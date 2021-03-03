import React, { useContext } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthNavigator from './navigation/AuthNavigator';
import BottomDrawerNavigator from './navigation/BottomDrawerNavigator';
import {createStackNavigator} from '@react-navigation/stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BlurView } from "@react-native-community/blur";

const Stack = createStackNavigator();
const LoadingContext = React.createContext({ 
  isLoading: false,
  setLoading: () => {}
});

const App = () => {
  const { isLoading } = useContext(LoadingContext);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthNavigator">
          <Stack.Screen
            name="AuthNavigator"
            component={AuthNavigator}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BottomDrawerNavigator"
            component={BottomDrawerNavigator}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {isLoading && 
        <View style={styles.overlay}>
          <BlurView style={styles.blur} blurType='dark'>
            <View style={{width: '25%'}}>
              <ActivityIndicator
                size='large'
                color='#1976d2'/>
              </View>
          </BlurView>
        </View>
      }
    </>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      width: '100%',
      height: '100%'
    },
    blur: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
  
  export default App;