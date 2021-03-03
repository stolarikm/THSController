import React, { useEffect, useState } from 'react';
import {StatusBar} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import SettingsComponent from '../components/SettingsComponent';
import { DefaultTheme, Provider as PaperProvider, Appbar } from 'react-native-paper';
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
      <SettingsComponent />
    </PaperProvider>
  );
}