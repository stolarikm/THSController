import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationBar from 'react-native-navbar-color'
import { FAB, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import NewDeviceModal from '../components/NewDeviceModal';
import PeriodicalPollingService from '../services/PeriodicalPollingService';
import ModbusService from '../services/ModbusService';
import NetworkScanService from '../services/NetworkScanService';
import { ActivityIndicator } from 'react-native';
import FirebaseService from '../services/FirebaseService';
import Toast from 'react-native-simple-toast';
import { Icon } from 'react-native-elements'


export default function GatewayScreen({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const { config, setConfig } = useConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [editedDevice, setEditedDevice] = useState(null);
  const [isRunning, setRunning] = useState(PeriodicalPollingService.isRunning());
  const [isScanning, setScanning] = useState(false);

  const [currentDevice, setCurrentDevice] = useState(null);
  const [states, setStates] = useState([]);

  const DEVICES = 'DEVICES';
  const MODE = "MODE";

  useEffect(() => { //TODO refactor
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: "Gateway"
      };
      setConfig(newConfig);
    });
    
    return unsubscribe;
  }, [navigation, config]);

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

  const getDeviceColor = (ip) => {
    if (isRunning && currentDevice === ip) {
      return 'orange';
    }
    if (isRunning && states[ip]) {
      if (states[ip].success) {
        return 'green';
      } else {
        return 'red';
      }
    }
    return 'grey';
  }

  const success = (ip, success) => {
    states[ip] = { success: success };
    setStates(states);
    setCurrentDevice(null);
  }

  const resetState = () => {
    setStates([]);
    setCurrentDevice(null);
  }

  const validateIp = (ip) => {
    let parts = ip.split('.');
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
  }

  const validate = (device) => {
    if (!device.name) {
      return { ok: false, error: "Please provide a device name"}
    }
    if (!device.ip) {
      return { ok: false, error: "Please provide a device IP address"}
    }
    if (!validateIp(device.ip)) {
      return { ok: false, error: "Please provide a valid IP adress"}
    }
    if (config.devices.some(d => d.name === device.name) && (!editedDevice || device.name !== editedDevice.name)) {
      return { ok: false, error: "Device with this name already exists"}
    }
    if (config.devices.some(d => d.ip === device.ip) && (!editedDevice || device.ip !== editedDevice.ip)) {
      return { ok: false, error: "Device with this address already exists"}
    }
    return { ok: true };
  }

  const addDevice = (device) => {
    if (editedDevice) {
      editDevice(device);
    } else {
      saveDevice(device);
    }
    setModalOpen(false);
    setEditedDevice(null);
  }

  const onStart = async () => {
    resetState();
    if (!await FirebaseService.isGatewayLockAvailable()) {
      fallbackToClientMode();
      Toast.show('Can not start gateway service, another gateway device already present. Falling back to client mode', Toast.LONG);
      return;
    }
    let timeout = parseInt(config.gatewayInterval);
    if (config.devices.length > 0) {
      PeriodicalPollingService.start(() => pollSensorsSequentially(config.devices), timeout * 1000);
      setRunning(true);
    }
  };

  const fallbackToClientMode = () => {
    let newConfig = {
      ...config,
      mode: 'client'
    };
    setConfig(newConfig);
    AsyncStorage.setItem(MODE, 'client');
    navigation.replace('BottomDrawerNavigator', { screen: 'Monitor' });
  }

  const onStop = () => {
    resetState();
    PeriodicalPollingService.stop();
    setRunning(false);
  };

  const pollSensorsSequentially = async (sensors) => {
    let port = parseInt(config.networkPort);
    //send commands
    var command = await FirebaseService.popCommand();
    if (command) {
      for (ip of command.ips) {
        await ModbusService.sendCommand(ip, port, command);
      }
    }

    //monitor
    if (sensors && sensors.length > 0) {
      var updateData = [];
      for (sensor of sensors) {
        setCurrentDevice(sensor.ip);
        try {
          var { temperature, humidity } = await ModbusService.readTemperatureAndHumidity(sensor.ip, port);
          success(sensor.ip, true);
          var data = { 
            name: sensor.name,
            ip: sensor.ip,
            readings: [{
              time: getRoundTimestamp(),
              temperature: temperature,
              humidity: humidity
            }]
          };
          updateData.push(data);
        } catch (error) {
          success(sensor.ip, false);
        }
      }
      FirebaseService.uploadReadings(updateData);
    }
  }

  const getRoundTimestamp = () => {
    var result = new Date();
    result.setMilliseconds(0);
    return result;
  } 

  const onAutoScan = () => {
    if (isScanning) {
      setScanning(false);
    } else {
      setDevices([]);
      setScanning(true);
    }
  }

  const saveDevice = async (device) => {
    let newDevices = await getDevices();
    newDevices.push(device);
    await setDevices(newDevices);
  }

  const editDevice = async (device) => {
    let newDevices = await getDevices();
    var updatedDeviceRef = newDevices.find(d => d.ip === editedDevice.ip);
    updatedDeviceRef.name = device.name;
    updatedDeviceRef.ip = device.ip;
    await setDevices(newDevices);
  }

  const deleteDevice = async (device) => {
    let devices = await getDevices();
    let newDevices = devices.filter(d => d.ip !== device.ip);
    await setDevices(newDevices);
  }

  const getDevices = async () => {
    var devices = await AsyncStorage.getItem(DEVICES);
    return JSON.parse(devices);
  }

  const setDevices = async (devices) => {
    updateDevicesConfig(devices);
    var json = JSON.stringify(devices);
    await AsyncStorage.setItem(DEVICES, json);
  }

  const updateDevicesConfig = (devices) => {
    let newConfig = {
      ...config,
      devices: devices
    };
    setConfig(newConfig);
  }

  return (
    <>
      <View style={styles.container}>
        {!isRunning && 
            <FAB
              icon="play"
              label="Start"
              onPress={() => onStart()}
              disabled={config.devices.length === 0 || isScanning}
              style={{
                position: 'absolute',
                top: 30,
                marginLeft: 'auto', 
                marginRight: 'auto'
              }}
            />
          }
          {isRunning && 
            <FAB
              icon="stop"
              label="Stop"
              onPress={() => onStop()}
              style={{
                position: 'absolute',
                top: 30,
                marginLeft: 'auto', 
                marginRight: 'auto'
              }}
            />  
        }
        <View style={{ flex: 4, flexDirection: "row", marginTop: 100 }}>
          <ScrollView contentContainerStyle={{alignItems: 'center'}}>
            <View style={{ flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center'}}>
              {config.devices.map((element, index) => {
                return (
                  <Card key={index} style={{ margin: 5, height: 98, width: '45%' }}>
                    <Card.Content>
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 9 }}>
                          <View style={{flexDirection: 'row'}}>
                            <Icon name='fiber-manual-record' size={15} color={getDeviceColor(element.ip)} style={{marginTop: 10, marginRight: 3}}/>
                            <Title numberOfLines={1}>{element.name}</Title>
                          </View>
                          <Paragraph>{element.ip}</Paragraph>
                        </View>
                        <View style={{ flex: 2, alignItems: 'flex-start', justifyContent: 'flex-end', marginTop: 80 }}>
                          <IconButton
                            disabled={isRunning || isScanning}
                            icon="pencil"
                            color="grey"
                            onPress={() => {setEditedDevice(element); setModalOpen(true)}}
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
        <View style={{flex: 1}}>
        {isScanning && 
          <ActivityIndicator style={{marginBottom: 25}}
            size='small'
            color='#1976d2'/>
        }
        </View>
        <FAB
            icon="plus"
            label="Add"
            onPress={() => {setModalOpen(true); setEditedDevice(null)}}
            disabled={isScanning || isRunning}
            style={{
              position: 'absolute',
              margin: 30,
              right: 0,
              bottom: 0
            }}
          />
          <FAB
            icon={isScanning ? "stop" : "sync"}
            label={isScanning ? "Stop" : "Scan"}
            onPress={onAutoScan}
            disabled={isRunning}
            style={{
              position: 'absolute',
              margin: 30,
              left: 0,
              bottom: 0
            }}
          />
      </View>
      <NewDeviceModal
        updatedDevice={editedDevice}
        visible={modalOpen}
        close={() => {setModalOpen(false); setEditedDevice(null)}}
        validate={validate}
        confirm={addDevice}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  }
});