import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { FAB, Card, Title, Paragraph } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import NewDeviceModal from '../components/NewDeviceModal';
import PeriodicalPollingService from '../services/PeriodicalPollingService';
import ModbusService from '../modbus/ModbusService';
import firestore from '@react-native-firebase/firestore';

export default function Gateway({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const { config, setConfig } = useConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [isRunning, setRunning] = useState(PeriodicalPollingService.isRunning());

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
      ...config,
      devices: [...config.devices]
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
        var temperature = await ModbusService.readTemperature(sensor.ip);
        var sensorData = {
          name: sensor.name,
          ip: sensor.ip,
          value: temperature,
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

  return (
    <>
      <View style={styles.container}>
        {!isRunning && 
            <FAB
              icon="play"
              label="Start"
              onPress={() => onStart()}
              disabled={config.devices.length === 0}
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
              <Card key={index} style={{margin: 5, height: '15%', width: '45%'}}>
                <Card.Content>
                  <Title>{element.name}</Title>
                  <Paragraph>{element.ip}</Paragraph>
                </Card.Content>
              </Card>
            );
          })}
        </View>
        <FAB
            icon="plus"
            label="Add"
            onPress={() => {setModalOpen(true)}}
            style={{
              position: 'absolute',
              margin: 30,
              right: 0,
              bottom: 0
            }}
          />
          <FAB
            icon="sync"
            label="Scan"
            onPress={() => {}}
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