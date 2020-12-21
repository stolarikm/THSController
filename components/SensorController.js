import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import ModbusService from '../modbus/ModbusService'

export default function SensorController() {
  const [running, setRunning] = useState(false);
  const [sensorInputs, setSensorInputs] = useState([]);
  const [data, setData] = useState([]);

  const onStart = () => {
    if (sensorInputs && sensorInputs.length > 0) {
      setRunning(true);
      pollSensorsSequentially(sensorInputs);
    }
  };
  
  const onStop = () => {
    setRunning(false);
  };

  const pollSensorsSequentially = async (sensors) => {
    if (sensors && sensors.length > 0) {
      var newData = [];
      for (sensor of sensors) {
        var value = await ModbusService.readTemperature(sensor.ip);
        newData.push({
          id: sensor.id,
          ip: sensor.ip,
          temperature: parseTemperature(value),
        });
      }
      setData(newData);
    }
  }
  
  const parseTemperature = (rowData) => {
    if (rowData && rowData[0] === "[") {
      var str = rowData.toString().substring(1, rowData.length - 1);
      var value = parseInt(str);
      if (!isNaN(value)) {
        value = value / 10;
        return value.toString() + " °C";
      }
    }
    return "No data";
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
        renderItem={({ item }) => <Text>IP: {item.ip} - Temperature: {item.temperature}</Text>}
        keyExtractor={rowData => rowData.id.toString()}
      />
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
