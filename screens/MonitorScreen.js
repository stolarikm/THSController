import React, { useEffect, useState } from 'react';
import { StyleSheet, View, processColor, StatusBar } from 'react-native';
import { Card, Title, Paragraph, Button, Switch } from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';
import { useConfig } from '../hooks/useConfig';
import NavigationBar from 'react-native-navbar-color'
import FileExportService from '../services/FileExportService';
import { Text } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function MonitorScreen({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  useEffect(() => {
    firestore().settings = {  };
    var unsubscribe = firestore().collection("readings")
      .onSnapshot((snapshot) => {
        if (snapshot) {
          //should be only 1 document
          snapshot.forEach((doc) => doc.id === user.email && setReadings(doc.data()));
        }
      });
      //cleanup
      return unsubscribe;
  }, []);

  const user = auth().currentUser;
  const [readings, setReadings] = useState({ devices: [] });
  const [isHumidity, setisHumidity] = useState(false);
  const { config, setConfig } = useConfig();
  const isPortrait = useOrientation();

  useEffect(() => { //TODO refactor
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: "Monitor"
      };
      setConfig(newConfig);
    });

    return unsubscribe;
  }, [navigation, config]);

  const getTemperatureReadingsOfDevice = (ip) => {
    var device = readings.devices.find(device => device.ip === ip);
    if (device && device.readings) {
      return device.readings.map(reading => reading.temperature);
    }
  }

  const getHumidityReadingsOfDevice = (ip) => {
    var device = readings.devices.find(device => device.ip === ip);
    if (device && device.readings) {
      return device.readings.map(reading => reading.humidity);
    }
  }

  return (
    <>
      <View style={styles.container}>
        <View style={!isPortrait ? {display: 'none'} : {}}>
          <View style={{flex: 1}}>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <Text style={{ fontWeight: !isHumidity ? 'bold' : 'normal', fontSize: 16, margin: 5 }}>Temperature</Text>
              <Switch value={isHumidity} onValueChange={() => setisHumidity(!isHumidity)} trackColor={{true: 'lightgrey', false: 'lightgrey'}} thumbColor='#67daff'/>
              <Text style={{ fontWeight: isHumidity ? 'bold' : 'normal', fontSize: 16, margin: 5, paddingRight: 30 }}>Humidity</Text>
            </View>
          </View>
          <View style={{flex: 9}}>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              {readings && readings.devices.map((device, index) => {
                if (device.readings && device.readings.length > 0) {
                  return (
                    <Card key={index} style={{marginTop: 15, margin: 5}}>
                      <Card.Content>
                        { isHumidity && <Title>{device.readings[device.readings.length - 1].humidity}% RH</Title>}
                        { !isHumidity && <Title>{device.readings[device.readings.length - 1].temperature} °C</Title>}
                        <Paragraph>{device.name}</Paragraph>
                      </Card.Content>
                    </Card>
                  );
                }
              })}
            </View>
          </View>
        </View>
        <View style={{ marginBottom: 10, position: 'absolute', bottom: 0, height: isPortrait ? 250 : '100%', width: '100%'}}>
          <Button 
            icon="file" 
            disabled={readings.devices.length === 0}
            onPress={() => FileExportService.exportToExcel(readings.devices, config.exportDirectory)} 
            style={{alignSelf: 'flex-start', display: !isPortrait ? 'none' : 'flex' }}>
            Export
          </Button>
          <LineChart
            marker={{ enabled: true, digits: 1 }}
            xAxis={{
              valueFormatter: readings && readings.devices.length > 0 && readings.devices[0].readings ? readings.devices[0].readings.map((reading) => reading.time) : [],  //robit to podla najdlhsieho devicu
              drawLabels: true,
              position: "BOTTOM",
            }}
            legend={{ enabled: false }}
            chartDescription={{ text: '' }}
            style={styles.chart}
            data={{
              dataSets: readings.devices.map(device => {
                return { config: lineConfig, label: device.name, values: isHumidity ? getHumidityReadingsOfDevice(device.ip) : getTemperatureReadingsOfDevice(device.ip) };
              }),
            }}
          />
        </View>
      </View>
      </>
  );
}

const lineConfig = {
  lineWidth: 2,
  drawCircleHole: false,
  drawCircles: false,
  circleRadius: 0,
  drawValues: false,
  color: processColor('#1976d2'),
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    flex: 1,
  }
});