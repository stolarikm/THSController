import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, processColor, StatusBar } from 'react-native';
import { Appbar, Card, Title, Paragraph, FAB } from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import ModbusService from '../modbus/ModbusService'
import PeriodicalPollingService from '../services/PeriodicalPollingService';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';
import { useConfig } from '../hooks/useConfig';
import auth from '@react-native-firebase/auth';
import NavigationBar from 'react-native-navbar-color'

export default function Monitor({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  useEffect(() => {
    var unsubscribe = firestore().collection("readings")
      .onSnapshot((snapshot) => {
        var snapshotData = [];
        snapshot.forEach((doc) => snapshotData.push(doc.data()));
        setReadings(snapshotData);
      });
      //cleanup
      return unsubscribe;
  }, []);

  const [readings, setReadings] = useState([]);
  const [isRunning, setRunning] = useState(PeriodicalPollingService.isRunning());
  const { config, setConfig } = useConfig();
  const isPortrait = useOrientation();
  var screenWidth = Dimensions.get('window').width;
  var screenHeight = Dimensions.get('window').height;

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

  const onStart = () => {
    if (config.devices.length > 0) {
      PeriodicalPollingService.start(() => pollSensorsSequentially(config), 15000);
      setRunning(true);
    }
  };

  const onStop = () => {
    PeriodicalPollingService.stop();
    setRunning(false);
  };

  const pollSensorsSequentially = async (sensors) => {
    console.log(sensors);
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

  const getSensorIps = () => {
    var ips = new Set();
    readings.forEach(reading => reading.devices.forEach(device => ips.add(device.ip)));
    return ips;
  }

  const getReadings = (ip) => {
    var read = readings
      .filter(reading => reading.devices.some(device => device.ip === ip))
      .map(reading => reading.devices.filter(device => device.ip === ip)[0].value); //TODO fix [0]
    console.log("SYNC...", read);
    return read;
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
        <View style={{ flexDirection: "row", marginTop: 5 }}>
          {readings && readings.length > 0 && readings[readings.length - 1].devices.map((element, index) => {
            return (
              <Card key={index}>
                <Card.Content>
                  <Title>{element.value} °C</Title>
                  <Paragraph>{element.name}</Paragraph>
                </Card.Content>
              </Card>
            );
          })}
        </View>
        <View style={{ position: 'absolute', bottom: 0, height: isPortrait ? 250 : screenHeight, width: screenWidth }}>
          <LineChart
            marker={{ enabled: true, digits: 1 }}
            xAxis={{
              valueFormatter: readings && readings.length > 0 ? readings.map((reading) => reading.time) : [],
              drawLabels: true,
              position: "BOTTOM",
            }}
            legend={{ enabled: false }}
            chartDescription={{ text: '' }}
            style={styles.chart}
            data={{
              dataSets: [...getSensorIps()].map((ip) => {
                return { config: lineConfig, label: ip, values: getReadings(ip) };
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