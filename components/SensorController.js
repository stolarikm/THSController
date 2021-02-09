import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, processColor } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { LineChart } from 'react-native-charts-wrapper';
import ModbusService from '../modbus/ModbusService'
import PeriodicalPollingService from '../utils/PeriodicalPollingService';
import { useOrientation } from '../hooks/useOrientation';
import firestore from '@react-native-firebase/firestore';

export default function SensorController() {
  const [running, setRunning] = useState(false);
  const [sensorInputs, setSensorInputs] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [data, setData] = useState([]);

  const isPortrait = useOrientation();
  var screenWidth = Dimensions.get('window').width;
  var screenHeight = Dimensions.get('window').height;


  const onStart = () => {
    if (sensorInputs && sensorInputs.length > 0) {
      setRunning(true);
      PeriodicalPollingService.start(() => pollSensorsSequentially(sensorInputs), 7500);
    }
  };

  const onStop = () => {
    PeriodicalPollingService.stop();
    setRunning(false);
  };

  const getSensor = (id) => {
    return data.find((item) => item.id === id);
  }

  useEffect(() => {
    if (currentData && currentData.length > 0) {
      var newData = [];
      for (sensor of currentData) {
        var currentSensor = getSensor(sensor.id);
        newData.push({
          id: sensor.id,
          ip: sensor.ip,
          values: currentSensor ? currentSensor.values.concat(sensor.value) : [sensor.value],
        });
      }
      setData(newData);
    }
  }, [currentData]);

  const pollSensorsSequentially = async (sensors) => {
    if (sensors && sensors.length > 0) {
      var newData = [];
      for (sensor of sensors) {
        var temperature = await ModbusService.readTemperature(sensor.ip);
        var time = parseTime(new Date());
        var value = {
          time: time,
          temperature: temperature
        };
        var data = {
          id: sensor.id,
          ip: sensor.ip,
          value: value,
        };
        newData.push(data);
        upload(data);
      }
      setCurrentData(newData);
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
          {sensorInputs.map((element, index) => {
            return (
              <TextInput
                mode='outlined'
                placeholder='192.168.0.68'
                label='IP address'
                key={element.id}
                value={element.ip}
                disabled={running}
                onChangeText={text => {
                  let newSensorsInputs = [...sensorInputs];
                  newSensorsInputs[index] = { id: index, ip: text };
                  setSensorInputs(newSensorsInputs);
                }}
              />
            );
          })}
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Button
              style={{ margin: 5 }}
              mode='contained'
              disabled={running}
              onPress={() => {
                let newSensorsInputs = [...sensorInputs];
                newSensorsInputs.push({ id: sensorInputs.length, ip: "" });
                setSensorInputs(newSensorsInputs);
              }}
            >+</Button>
            <Button
              style={{ margin: 5 }}
              mode='contained'
              disabled={running}
              onPress={() => onStart()}
            >Start</Button>
            <Button
              style={{ margin: 5 }}
              mode='contained'
              disabled={!running}
              onPress={() => onStop()}
            >Stop</Button>
          </View>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: "row", marginTop: 5 }}>
          {currentData.map((element) => {
            return (
              <Card key={element.id}>
                <Card.Content>
                  <Title>{element.value.temperature} °C</Title>
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
              valueFormatter: data && data.length > 0 ? data[0].values.map((item) => item.time) : [],
              drawLabels: true,
              position: "BOTTOM",
            }}
            legend={{ enabled: false }}
            chartDescription={{ text: '' }}
            style={styles.chart}
            data={{
              dataSets: data.map((item) => {
                return { config: lineConfig, label: item.ip, values: item.values.map((value) => value.temperature) };
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
