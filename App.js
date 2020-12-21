import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import ModbusTcp from 'react-native-modbus-tcp';

export default function App() {
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

  const updateMeasuredData = (sensor, value) => {
    if (data[sensor.id]) {
      data[sensor.id].temperature = value;
    } else {
      data[sensor.id] = {
        id: sensor.id,
        ip: sensor.ip,
        temperature: value,
      }
    }
    setData(data);
  }

  const pollSensorsSequentially = (sensors) => {
    if (sensors && sensors.length > 0) {
      var sensor = sensors[0];
      
      //create array of sensors without first element
      var remainingSensors = [...sensors];
      remainingSensors.splice(0, 1);

      //measure first sensor, and recursively meausre on others
      ModbusTcp.connectToModbusMaster(sensor.ip, 502, (res) => {
        ModbusTcp.readHoldingRegisters(1, 0, 1, (read) => {
          value = parseTemperature(read);
          updateMeasuredData(sensor, value);
          ModbusTcp.destroyConnection((disc) => {
            pollSensorsSequentially(remainingSensors);
          });
        });
      });
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
