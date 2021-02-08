import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function SettingsComponent() {
  const [sensorInputs, setSensorInputs] = useState([]);

  return (
    <View style={styles.container}>
      <View style={{ margin: 10, flex: 1, width: 200 }}>
        <View>
          {sensorInputs.map((element, index) => {
            return (
              <TextInput
                mode='outlined'
                placeholder='192.168.0.68'
                label='IP address'
                key={element.id}
                value={element.ip}
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
              onPress={() => {
                let newSensorsInputs = [...sensorInputs];
                newSensorsInputs.push({ id: sensorInputs.length, ip: "" });
                setSensorInputs(newSensorsInputs);
              }}
            >+</Button>
          </View>
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
  }
});
