import React, { useEffect } from 'react';
import {StatusBar} from 'react-native';
import SensorController from './components/SensorController';
import { DefaultTheme, Provider as PaperProvider, Appbar } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
  },
};

export default function App() {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="THS Controller" subtitle="Temperature and humidity sensor controller" />
      </Appbar.Header>
      <SensorController />
    </PaperProvider>
  );
}