import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, processColor } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import ModbusService from '../modbus/ModbusService'
import PeriodicalPollingService from '../utils/PeriodicalPollingService';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';

export default function SensorController() {
  const [readings, setReadings] = useState([]);
  const [isRunning, setRunning] = useState(PeriodicalPollingService.isRunning());

  const isPortrait = useOrientation();
  var screenWidth = Dimensions.get('window').width;
  var screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    global.sensorInputs = [];
    var unsubscribe = firestore().collection("readings")
      .onSnapshot((snapshot) => {
        var snapshotData = [];
        snapshot.forEach((doc) => snapshotData.push(doc.data()));
        setReadings(snapshotData);
      });
      //cleanup
      return unsubscribe;
  }, []);

  const onStart = () => {
    if (global.sensorInputs && global.sensorInputs.length > 0) {
      PeriodicalPollingService.start(() => pollSensorsSequentially(global.sensorInputs), 15000);
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
          id: sensor.id,
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

  const lineConfig = {
    lineWidth: 2,
    drawCircleHole: false,
    drawCircles: false,
    circleRadius: 0,
    drawValues: false,
    color: processColor('#1976d2'),
  }

  return (
    <View style={styles.container}>
      <View style={{ margin: 10, flex: 1 }}>
        <View>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Button
              style={{ margin: 5 }}
              mode='contained'
              disabled={isRunning}
              onPress={() => onStart()}
            >Start</Button>
            <Button
              style={{ margin: 5 }}
              mode='contained'
              disabled={!isRunning}
              onPress={() => onStop()}
            >Stop</Button>
          </View>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: "row", marginTop: 5 }}>
          {readings && readings.length > 0 && readings[readings.length - 1].devices.map((element) => {
            return (
              <Card key={element.id}>
                <Card.Content>
                  <Title>{element.value} °C</Title>
                  <Paragraph>{element.ip}</Paragraph>
                </Card.Content>
              </Card>
            );
          })}
        </View>
        <View style={{ height: isPortrait ? 250 : screenHeight, width: screenWidth }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    flex: 1,
  }
});
