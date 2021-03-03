import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar, Button, TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
  },
};

export default function Configuration({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const [sensorInputs, setSensorInputs] = useState([]);
  const user = auth().currentUser;

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.replace('LoginScreen');
      });
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Settings" subtitle={user ? user.email : ""}/>
        <Appbar.Action icon="exit-to-app" onPress={logout} />
      </Appbar.Header>
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
                  global.sensorInputs = newSensorsInputs;
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
                global.sensorInputs = newSensorsInputs;
              }}
            >+</Button>
          </View>
        </View>
      </View>
    </View>
    </PaperProvider>
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