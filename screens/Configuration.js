import React, { useEffect } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { Appbar, TextInput, FAB } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useConfig } from '../hooks/useConfig';
import { ScrollView } from 'react-native';

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
    <>
      <Appbar.Header>
        <Appbar.Content title="Configuration" subtitle={user ? user.email : ""}/>
        <Appbar.Action icon="exit-to-app" onPress={logout} />
      </Appbar.Header>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}} style={{flex: 2, width: '100%'}}>
          <View style={{ margin: 10, flex: 1, width: '75%' }}>
            {config.map((element, index) => {
              return (
                <TextInput
                  placeholder='192.168.0.68'
                  label='IP address'
                  key={element.id}
                  value={element.ip}
                  onChangeText={text => {
                    let newConfig = [...config];
                    newConfig[index] = { id: index, ip: text };
                    setConfig(newConfig);
                  }}
                  style={{marginBottom: 10}}
                />
              );
            })}
          </View>
        </ScrollView>
        <FAB
            icon="plus"
            label="Add"
            onPress={() => {
              let newConfig = [...config];
              newConfig.push({ id: newConfig.length, ip: "" });
              setConfig(newConfig);
            }}
            style={{
              position: 'absolute',
              margin: 30,
              right: 0,
              bottom: 0
            }}
          />
          <FAB
            icon="sync"
            label="Scan"
            onPress={() => {}}
            style={{
              position: 'absolute',
              margin: 30,
              left: 0,
              bottom: 0
            }}
          />
      </View>
    </>
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