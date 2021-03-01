import React, { useEffect } from 'react';
import {StatusBar} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import SensorController from '../components/SensorController';
import { DefaultTheme, Provider as PaperProvider, Appbar } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
  },
};

export default function Monitor() {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const user = auth().currentUser;

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Home" subtitle={user ? user.email : ""}/>
      </Appbar.Header>
      <SensorController />
    </PaperProvider>
  );
}