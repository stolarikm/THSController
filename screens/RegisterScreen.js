import React, { useEffect } from 'react';
import {StatusBar} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
  },
};

export default function RegisterScreen() {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Register" />
      </Appbar.Header>
    </PaperProvider>
  );
}