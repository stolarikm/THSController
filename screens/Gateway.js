import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { FAB, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import NewDeviceModal from '../components/NewDeviceModal';
import PeriodicalPollingService from '../services/PeriodicalPollingService';
import ModbusService from '../modbus/ModbusService';
import firestore from '@react-native-firebase/firestore';
import NetworkScanService from '../services/NetworkScanService';
import { ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Gateway({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const user = auth().currentUser;
  const { config, setConfig } = useConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [editedDevice, setEditedDevice] = useState(null);
  const [isRunning, setRunning] = useState(PeriodicalPollingService.isRunning());
  const [isScanning, setScanning] = useState(false);

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
        await NetworkScanService.autoScan(processDevice);
        setScanning(false);
      };
      startScan();
    } else {
      NetworkScanService.stop();
    }
  }, [isScanning]);

  const validate = (device) => {
    if (!device.name) {
      return { ok: false, message: "Please provide a device name"}
    }
    if (!device.ip) {
      return { ok: false, message: "Please provide a device address"}
    }
    if (config.devices.some(d => d.name === device.name) && (!editedDevice || device.name !== editedDevice.name)) {
      return { ok: false, message: "Device with this name already exists"}
    }
    if (config.devices.some(d => d.ip === device.ip) && (!editedDevice || device.ip !== editedDevice.ip)) {
      return { ok: false, message: "Device with this address already exists"}
    }
    return { ok: true };
  }

  const addDevice = (device) => {
    if (editedDevice) {
      let newConfig = {
        ...config
      };
      var updatedDeviceRef = newConfig.devices.find(d => d.ip === editedDevice.ip);
      updatedDeviceRef.name = device.name;
      updatedDeviceRef.ip = device.ip;
      setConfig(newConfig);
    } else {
      let newConfig = {
        ...config
      };
      newConfig.devices.push(device);
      setConfig(newConfig);
    }
    setModalOpen(false);
    setEditedDevice(null);
  }
  
  const deleteDevice = (device) => {
    let newConfig = {
      ...config,
      devices: config.devices.filter(d => d.ip !== device.ip)
    };
    setConfig(newConfig);
  }

  const onStart = () => {
    if (config.devices.length > 0) {
      PeriodicalPollingService.start(() => pollSensorsSequentially(config.devices), 15000);
      setRunning(true);
    }
  };

  const onStop = () => {
    PeriodicalPollingService.stop();
    setRunning(false);
  };

  const pollSensorsSequentially = async (sensors) => {
    if (sensors && sensors.length > 0) {
      var updateData = [];
      for (sensor of sensors) {
        var { temperature, humidity } = await ModbusService.read(sensor.ip);
        var data = { 
          name: sensor.name,
          ip: sensor.ip,
          readings: [{
            time: parseTime(new Date()),
            temperature: temperature,
            humidity: humidity
          }]
        };
        updateData.push(data);
      }
      upload(updateData);
    }
  }

  const upload = async (updateDevices) => {
    setDocument(merge((await getDocument()).data(), updateDevices));
  }

  const merge = (data, newData) => {
    if (!data || !data.devices) {
      //init
      data = { devices: [] };
    }

    for (updateDevice of newData) {
      var device = data.devices.find((a) => a.ip === updateDevice.ip);
      if (device) {
        device.readings = device.readings.concat(updateDevice.readings);
      } else {
        data.devices.push(updateDevice);
      }
    }
    return data;
  }

  const getDocument = async () => {
    return await firestore()
      .collection("readings")
      .doc(user.email)
      .get();
  }

  const setDocument = (doc) => {
    firestore()
      .collection("readings")
      .doc(user.email)
      .set(doc);
  }

  const parseTime = (date) => {
    return date.toTimeString().split(' ')[0];
  }

  const processDevice = (device) => {
    let newConfig = {
      ...config
    };
    newConfig.devices.push(device);
    setConfig(newConfig);
  }

  const onAutoScan = () => {
    if (isScanning) {
      setScanning(false);
    } else {
      let newConfig = {
        ...config
      };
      newConfig.devices = [];
      setConfig(newConfig);
      setScanning(true);
    }
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
        <View style={{ flex: 1, flexDirection: "row", marginTop: 100 }}>
          {config.devices.map((element, index) => {
            return (
              <Card key={index} style={{margin: 5, height: 100, width: '45%'}}>
                <Card.Content>
                  <Title>{element.name}</Title>
                  <Paragraph>{element.ip}</Paragraph>
                  <View style={{ position: 'absolute', right: 0}}>
                    <IconButton
                      icon="pencil"
                      color="grey"
                      onPress={() => {setEditedDevice(element); setModalOpen(true)}}
                    />
                    <IconButton
                      icon="delete"
                      color="grey"
                      onPress={() => deleteDevice(element)}
                    />
                  </View>
                </Card.Content>
              </Card>
            );
          })}
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