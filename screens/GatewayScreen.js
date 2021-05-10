import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { FAB, Card, Title, Paragraph, IconButton } from "react-native-paper";
import { useConfig } from "../hooks/useConfig";
import NewDeviceDialog from "../components/NewDeviceDialog";
import BackgroundTaskService from "../services/BackgroundTaskService";
import ModbusService from "../services/ModbusService";
import NetworkScanService from "../services/NetworkScanService";
import { ActivityIndicator } from "react-native";
import FirebaseService from "../services/FirebaseService";
import Toast from "react-native-simple-toast";
import { Icon } from "react-native-elements";
import LoadingOverlay from "../components/LoadingOverlay";
import firestore from "@react-native-firebase/firestore";
import RestartGatewayDataDialog from "../components/RestartGatewayDataDialog";
import Constants from "../resources/Constants";

/**
 * Gateway screen component
 * @param navigation navigation context
 */
export default function GatewayScreen({ navigation }) {
  const { config, setConfig } = useConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [editedDevice, setEditedDevice] = useState(null);
  const [isRunning, setRunning] = useState(BackgroundTaskService.isRunning());
  const [isScanning, setScanning] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [states, setStates] = useState([]);

  /**
   * Sets the current screen name in config context
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      let newConfig = {
        ...config,
        screenName: "Gateway",
      };
      setConfig(newConfig);
    });
    //clear
    return unsubscribe;
  }, [navigation, config]);

  /**
   * Manages the auto-restart of the gateway service
   * The auto-restart of the gateway service is performed when the application was started
   * while gateway service was already running
   */
  useEffect(() => {
    /**
     * Processes the auto-restart of the gateway service if application was started while gateway service was running
     */
    var restart = async () => {
      if (isRunning) {
        setLoading(true);
        let timeout = parseInt(config.gatewayInterval);
        await BackgroundTaskService.stop();
        await BackgroundTaskService.start(
          () => gatewayServiceTask(config.devices),
          timeout * 1000
        );
        setLoading(false);
      }
    };

    if (isRunning) {
      //if the gateway service was running before the start of application
      //we have to restart it, to be able to sync the state with the service again
      restart();
    }
  }, []);

  /**
   * Manages the start and stop of the auto-scan feature
   */
  useEffect(() => {
    if (isScanning) {
      let startScan = async () => {
        let port = parseInt(config.networkPort);
        let commonIpSuffix = config.ipSuffix;
        await NetworkScanService.autoScan(saveDevice, port, commonIpSuffix);
        setScanning(false);
      };
      startScan();
    } else {
      NetworkScanService.stop();
    }
  }, [isScanning]);

  /**
   * Returns the status color of the device
   * Orange - READING
   * Green - SUCCESS
   * RED - FAIL
   * @param ip of the device
   */
  const getDeviceColor = (ip) => {
    if (isRunning && currentDevice === ip) {
      return "orange";
    }
    if (isRunning && states[ip]) {
      if (states[ip].success) {
        return "green";
      } else {
        return "red";
      }
    }
    return "grey";
  };

  /**
   * Callback to set devices state to SUCCESS or FAIL
   * @param ip ip of the device
   * @param success true if the read was succesful, false otherwise
   */
  const success = (ip, success) => {
    states[ip] = { success: success };
    setStates(states);
    setCurrentDevice(null);
  };

  /**
   * Resets the state of the devices
   */
  const resetState = () => {
    setStates([]);
    setCurrentDevice(null);
  };

  /**
   * Validates the ip address
   * Returns true if the ip address is valid, false otherwise
   * @param ip input
   */
  const validateIp = (ip) => {
    let parts = ip.split(".");
    if (parts.length !== 4) {
      return false;
    }
    for (part of parts) {
      if (!part || isNaN(parseInt(part))) {
        return false;
      }
      if (parseInt(part) < 0 || parseInt(part) > 255) {
        return false;
      }
    }
    return true;
  };

  /**
   * Validates the device configuration
   * Returns { ok: true if validation passed, error: error message, if any }
   * @param device device configuration
   */
  const validate = (device) => {
    if (!device.name) {
      return { ok: false, error: "Please provide a device name" };
    }
    if (!device.ip) {
      return { ok: false, error: "Please provide a device IP address" };
    }
    if (!validateIp(device.ip)) {
      return { ok: false, error: "Please provide a valid IP adress" };
    }
    if (
      config.devices.some((d) => d.name === device.name) &&
      (!editedDevice || device.name !== editedDevice.name)
    ) {
      return { ok: false, error: "Device with this name already exists" };
    }
    if (
      config.devices.some((d) => d.ip === device.ip) &&
      (!editedDevice || device.ip !== editedDevice.ip)
    ) {
      return { ok: false, error: "Device with this address already exists" };
    }
    return { ok: true };
  };

  /**
   * Add device callback
   * Adds device if a new device was being configured
   * Updates existing device if a device was being edited
   * @param device devices configuration
   */
  const addDevice = (device) => {
    if (editedDevice) {
      editDevice(device);
    } else {
      saveDevice(device);
    }
    setModalOpen(false);
    setEditedDevice(null);
  };

  /**
   * Processes the start gateway service action
   * Opens restart modal if there are already some data reading present
   * Starts the gateway service otherwise
   */
  const processStart = async () => {
    if (await FirebaseService.areDataPresent()) {
      setRestartModalOpen(true);
    } else {
      startGatewayService();
    }
  };

  /**
   * Confirms the restart modal
   * Clears previous data readings and starts the gateway service
   */
  const overWriteAndStart = async () => {
    await FirebaseService.clearData();
    startGatewayService();
  };

  /**
   * Starts the gateway service
   * Fails if the gateway lock is not available (meaning another gateway device is present)
   */
  const startGatewayService = async () => {
    setLoading(true);
    resetState();
    if (!(await FirebaseService.isGatewayLockAvailable())) {
      fallbackToClientMode();
      setLoading(false);
      Toast.show(
        "Can not start gateway service, another gateway device already present. Falling back to client mode",
        Toast.LONG
      );
      return;
    }
    let timeout = parseInt(config.gatewayInterval);
    if (config.devices.length > 0) {
      await BackgroundTaskService.start(
        () => gatewayServiceTask(config.devices),
        timeout * 1000
      );
      Toast.show("Gateway service started");
      setRunning(true);
    }
    setLoading(false);
  };

  /**
   * Falls back to client mode if there is another gateway device present
   * Redirects to Monitor screen
   */
  const fallbackToClientMode = () => {
    let newConfig = {
      ...config,
      mode: "client",
    };
    setConfig(newConfig);
    AsyncStorage.setItem(Constants.MODE, "client");
    navigation.replace("BottomDrawerNavigator", { screen: "Monitor" });
  };

  /**
   * Stops the gateway service
   */
  const onStop = async () => {
    setLoading(true);
    resetState();
    await BackgroundTaskService.stop();
    Toast.show("Gateway service stopped");
    setRunning(false);
    setLoading(false);
  };

  /**
   * The gateway service task
   * Firstly, check the command queue for next command and send it if present
   * Secondly, squentially reads the devices data
   */
  const gatewayServiceTask = async (sensors) => {
    let port = parseInt(config.networkPort);
    //send commands
    var command = await FirebaseService.popCommand();
    if (command) {
      for (ip of command.ips) {
        await ModbusService.sendCommand(ip, port, command);
      }
    }

    //read data
    var readTime = getRoundTimestamp();
    if (sensors && sensors.length > 0) {
      var updateData = [];
      for (sensor of sensors) {
        setCurrentDevice(sensor.ip);
        try {
          var { temperature, humidity } =
            await ModbusService.readTemperatureAndHumidity(sensor.ip, port);
          success(sensor.ip, true);
          var data = {
            name: sensor.name,
            ip: sensor.ip,
            readings: [
              {
                time: firestore.Timestamp.fromDate(readTime),
                temperature: temperature,
                humidity: humidity,
              },
            ],
          };
          updateData.push(data);
        } catch (error) {
          success(sensor.ip, false);
        }
      }
      FirebaseService.uploadReadings(updateData);
    }
  };

  /**
   * Returns timestamp with 0 milliseconds
   */
  const getRoundTimestamp = () => {
    var result = new Date();
    result.setMilliseconds(0);
    return result;
  };

  /**
   * Sets auto-scan to running
   */
  const onAutoScan = () => {
    if (isScanning) {
      setScanning(false);
    } else {
      setDevices([]);
      setScanning(true);
    }
  };

  /**
   * Saves new device configuration
   */
  const saveDevice = async (device) => {
    let newDevices = await getDevices();
    newDevices.push(device);
    await setDevices(newDevices);
  };

  /**
   * Updates existing device configuration
   */
  const editDevice = async (device) => {
    let newDevices = await getDevices();
    var updatedDeviceRef = newDevices.find((d) => d.ip === editedDevice.ip);
    updatedDeviceRef.name = device.name;
    updatedDeviceRef.ip = device.ip;
    await setDevices(newDevices);
  };

  /**
   * Deletes existing devices configuration
   */
  const deleteDevice = async (device) => {
    let devices = await getDevices();
    let newDevices = devices.filter((d) => d.ip !== device.ip);
    await setDevices(newDevices);
  };

  /**
   * Returns configuration of devices from async storage (persisted between application starts)
   */
  const getDevices = async () => {
    var devices = await AsyncStorage.getItem(Constants.DEVICES);
    var deviceList = JSON.parse(devices);
    return deviceList ?? [];
  };

  /**
   * Saves the devices configuration into the async storage (to persist between application starts)
   * @param devices devices configuration
   */
  const setDevices = async (devices) => {
    updateDevicesConfig(devices);
    var json = JSON.stringify(devices);
    await AsyncStorage.setItem(Constants.DEVICES, json);
  };

  /**
   * Updates devices configuration in the configuration context
   * @param devices devices configuration to update
   */
  const updateDevicesConfig = (devices) => {
    let newConfig = {
      ...config,
      devices: devices,
    };
    setConfig(newConfig);
  };

  return (
    <>
      <View style={styles.container}>
        {!isRunning && (
          <FAB
            icon="play"
            label="Start"
            onPress={() => processStart()}
            disabled={!config || config.devices.length === 0 || isScanning}
            style={{
              position: "absolute",
              top: 30,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        )}
        {isRunning && (
          <FAB
            icon="stop"
            label="Stop"
            onPress={() => onStop()}
            style={{
              position: "absolute",
              top: 30,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        )}
        <View style={{ flex: 4, flexDirection: "row", marginTop: 100 }}>
          <ScrollView contentContainerStyle={{ alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {config &&
                config.devices.map((element, index) => {
                  return (
                    <Card
                      key={index}
                      style={{ margin: 5, height: 98, width: "45%" }}
                    >
                      <Card.Content>
                        <View style={{ flexDirection: "row" }}>
                          <View style={{ flex: 9 }}>
                            <View style={{ flexDirection: "row" }}>
                              <Icon
                                name="fiber-manual-record"
                                size={15}
                                color={getDeviceColor(element.ip)}
                                style={{ marginTop: 10, marginRight: 3 }}
                              />
                              <Title numberOfLines={1}>{element.name}</Title>
                            </View>
                            <Paragraph numberOfLines={1}>
                              {element.ip}
                            </Paragraph>
                          </View>
                          <View
                            style={{
                              flex: 2,
                              alignItems: "flex-start",
                              justifyContent: "flex-end",
                              marginTop: 80,
                            }}
                          >
                            <IconButton
                              disabled={isRunning || isScanning}
                              icon="pencil"
                              color="grey"
                              onPress={() => {
                                setEditedDevice(element);
                                setModalOpen(true);
                              }}
                            />
                            <IconButton
                              disabled={isRunning || isScanning}
                              icon="delete"
                              color="grey"
                              onPress={() => deleteDevice(element)}
                            />
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  );
                })}
            </View>
          </ScrollView>
        </View>
        <View style={{ flex: 1 }}>
          {isScanning && (
            <ActivityIndicator
              style={{ marginBottom: 25 }}
              size="small"
              color="#1976d2"
            />
          )}
        </View>
        <FAB
          icon="plus"
          label="Add"
          onPress={() => {
            setModalOpen(true);
            setEditedDevice(null);
          }}
          disabled={isScanning || isRunning}
          style={{
            position: "absolute",
            margin: 30,
            right: 0,
            bottom: 0,
          }}
        />
        <FAB
          icon={isScanning ? "stop" : "sync"}
          label={isScanning ? "Stop" : "Scan"}
          onPress={onAutoScan}
          disabled={isRunning}
          style={{
            position: "absolute",
            margin: 30,
            left: 0,
            bottom: 0,
          }}
        />
      </View>
      <NewDeviceDialog
        updatedDevice={editedDevice}
        visible={modalOpen}
        close={() => {
          setModalOpen(false);
          setEditedDevice(null);
        }}
        validate={validate}
        confirm={addDevice}
      />
      <RestartGatewayDataDialog
        visible={restartModalOpen}
        hideDialog={() => setRestartModalOpen(false)}
        callback={overWriteAndStart}
      />
      {isLoading && <LoadingOverlay />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
});
