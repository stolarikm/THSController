import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import MainCompoment from './components/MainComponent';
import ConfigProvider from './hooks/useConfig';
import { navigationRef } from './services/NavigationService';

const App = () => {

  return (
    <ConfigProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer ref={navigationRef}>
          <MainCompoment/>
        </NavigationContainer>
      </PaperProvider>
    </ConfigProvider>
    );
  };
  
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#1976d2',
      accent: '#67daff'
    },
  };

  export default App;