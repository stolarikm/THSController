import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { Appbar, FAB, Card, Title, Paragraph } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useConfig } from '../hooks/useConfig';
import NewDeviceModal from '../components/NewDeviceModal';

export default function Configuration({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const { config, setConfig } = useConfig();
  const user = auth().currentUser;
  const [modalOpen, setModalOpen] = useState(false);

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.replace('LoginScreen');
      });
  }

  const validate = (device) => {
    if (!device.name) {
      return { ok: false, message: "Please provide a device name"}
    }
    if (!device.ip) {
      return { ok: false, message: "Please provide a device address"}
    }
    if (config.some(d => d.name === device.name)) {
      return { ok: false, message: "Device with this name already exists"}
    }
    if (config.some(d => d.name === device.name)) {
      return { ok: false, message: "Device with this name already exists"}
    }
    if (config.some(d => d.ip === device.ip)) {
      return { ok: false, message: "Device with this address already exists"}
    }
    return { ok: true };
  }

  const addDevice = (device) => {
    let newConfig = [...config];
    newConfig.push(device);
    setConfig(newConfig);
    setModalOpen(false);
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Configuration" subtitle={user ? user.email : ""}/>
        <Appbar.Action icon="exit-to-app" onPress={logout} />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={{ flex: 1, flexDirection: "row", marginTop: 10 }}>
          {config.map((element, index) => {
            return (
              <Card key={index} style={{margin: 5, height: '15%', width: '45%'}}>
                <Card.Content>
                  <Title>{element.name}</Title>
                  <Paragraph>{element.ip}</Paragraph>
                </Card.Content>
              </Card>
            );
          })}
        </View>
        <FAB
            icon="plus"
            label="Add"
            onPress={() => {setModalOpen(true)}}
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
      <NewDeviceModal
        visible={modalOpen}
        close={() => setModalOpen(false)}
        validate={validate}
        confirm={addDevice}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  }
});