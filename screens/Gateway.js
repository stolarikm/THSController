import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { FAB, Card, Title, Paragraph } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import NewDeviceModal from '../components/NewDeviceModal';
import PeriodicalPollingService from '../services/PeriodicalPollingService';
import ModbusService from '../modbus/ModbusService';
import firestore from '@react-native-firebase/firestore';
import NetworkScanService from '../services/NetworkScanService';
import { ActivityIndicator } from 'react-native';

export default function Gateway({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const { config, setConfig } = useConfig();
  const [modalOpen, setModalOpen] = useState(false);
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
    if (config.devices.some(d => d.name === device.name)) {
      return { ok: false, message: "Device with this name already exists"}
    }
    if (config.devices.some(d => d.name === device.name)) {
      return { ok: false, message: "Device with this name already exists"}
    }
    if (config.devices.some(d => d.ip === device.ip)) {
      return { ok: false, message: "Device with this address already exists"}
    }
    return { ok: true };
  }

  const addDevice = (device) => {
    let newConfig = {
      ...config
    };
    newConfig.devices.push(device);
    setConfig(newConfig);
    setModalOpen(false);
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
    console.log("[Poll]", sensors);
    if (sensors && sensors.length > 0) {
      var data = { 
        time: parseTime(new Date()),
        devices: []
      };
      for (sensor of sensors) {
        var { temperature, humidity } = await ModbusService.read(sensor.ip);
        var sensorData = {
          name: sensor.name,
          ip: sensor.ip,
          temperature: temperature,
          humidity: humidity
        };
        data.devices.push(sensorData);
      }
      upload(data);
    }
  }

  const upload = (data) => {
    firestore()
        .collection("readings")
        .doc()
        .set(data);
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
            onPress={() => {setModalOpen(true)}}
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
        visible={modalOpen}
        close={() => setModalOpen(false)}
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