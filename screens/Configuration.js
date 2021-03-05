import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar, Button, TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useConfig } from '../hooks/useConfig';

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

  const { config, setConfig } = useConfig();
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
          {config.map((element, index) => {
            return (
              <TextInput
                mode='outlined'
                placeholder='192.168.0.68'
                label='IP address'
                key={element.id}
                value={element.ip}
                onChangeText={text => {
                  let newConfig = [...config];
                  newConfig[index] = { id: index, ip: text };
                  setConfig(newConfig);
                }}
              />
            );
          })}
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Button
              style={{ margin: 5 }}
              mode='contained'
              onPress={() => {
                let newConfig = [...config];
                newConfig.push({ id: newConfig.length, ip: "" });
                setConfig(newConfig);
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