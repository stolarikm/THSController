import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import BottomDrawerNavigator from './components/BottomDrawerNavigator';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import auth from '@react-native-firebase/auth';
import ConfigProvider from './hooks/useConfig'

const Stack = createStackNavigator();

const App = () => {
  const initialScreen = () => {
      return auth().currentUser ? "BottomDrawerNavigator" : "LoginScreen";
  }

  return (
    <ConfigProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialScreen()}>
          <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{headerShown: false}}
            />
          <Stack.Screen
            name="BottomDrawerNavigator"
            component={BottomDrawerNavigator}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ConfigProvider>
    );
  };
  
  export default App;