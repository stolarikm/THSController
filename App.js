import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import BottomDrawerNavigator from './components/BottomDrawerNavigator';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();

const initialScreen = () => {
    return auth().currentUser ? "BottomDrawerNavigator" : "LoginScreen";
}

const App = () => {
  return (
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
    );
  };
  
  export default App;