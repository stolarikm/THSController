import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import ModbusService from '../modbus/ModbusService'
import PeriodicalPollingService from '../utils/PeriodicalPollingService';

export default function SensorController() {
  const [running, setRunning] = useState(false);
  const [sensorInputs, setSensorInputs] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [data, setData] = useState([]);


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
        newData.push({
          id: sensor.id,
          ip: sensor.ip,
          value: value,
        });
      }
      setCurrentData(newData);
    }
  }
  
  const parseTime = (date) => {
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }

  const takeLast = (array, n) => {
    if (array) {
      if (array.length > n) {
        return array.slice(array.length - n);
      }
      return array;
    } 
  }

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(57, 26, 255, ${opacity})`,
    barPercentage: 0.5,
  };

  const chartData = {
    labels: data.length > 0 && takeLast(data[0].values.map((value) => value.time), 6), 
    datasets: data.map((item) => {
      return { data: takeLast(item.values.map((value) => value.temperature), 6) }
    }),
  };

  return (
    <View style={styles.container}>
      <View style={{ margin: 10 }}>
        {sensorInputs.map((element, index) => {
          return (
            <TextInput
              style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1 }}
              key={element.id}
              value={element.ip}
              editable={!running}
              onChangeText={text => {
                let newSensorsInputs = [...sensorInputs];
                newSensorsInputs[index] = { id: index, ip: text };
                setSensorInputs(newSensorsInputs);
              }}
            />
          );
        })}
        <View style={{ flexDirection: "row" }}>
          <View style={{ margin: 10 }}>
            <Button
              disabled={running}
              onPress={() => {
                let newSensorsInputs = [...sensorInputs];
                newSensorsInputs.push({ id: sensorInputs.length, ip: "" });
                setSensorInputs(newSensorsInputs);
              }}
              title="+"
            />
          </View>
          <View style={{ margin: 10 }}>
            <Button
              disabled={running}
              onPress={() => onStart()}
              title="Start"
            />
          </View>
          <View style={{ margin: 10 }}>
            <Button
              disabled={!running}
              onPress={() => onStop()}
              title="Stop"
            />
          </View>
        </View>
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => <Text>IP: {item.ip} - Temperature: {item.values[item.values.length - 1].temperature} °C</Text>}
        keyExtractor={rowData => rowData.id.toString()}
      />
      {data.length > 0 && <LineChart
        data={chartData}
        width={400}
        height={220}
        chartConfig={chartConfig}
      />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
