import React from 'react';

import { createAppContainer } from 'react-navigation';  
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'; 
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { View } from 'react-native';
import Configuration from './screens/Configuration';
import Monitor from './screens/Monitor';
import Commands from './screens/Commands';

const TabNavigator = createMaterialBottomTabNavigator(  
  {  
      Monitor: { screen: Monitor,  
          navigationOptions:{  
              tabBarLabel:'Monitor',  
              tabBarIcon: ({ tintColor }) => (  
                  <View>  
                      <Icon style={[{color: tintColor}]} size={25} name={'visibility'}/>  
                  </View>),  
          }  
      },  
      Commands: { screen: Commands,  
        navigationOptions:{  
            tabBarLabel:'Commands',  
            tabBarIcon: ({ tintColor }) => (  
                <View>  
                    <Icon style={[{color: tintColor}]} size={25} name={'send'}/>  
                </View>),  
        }  
    },  
      Config: { screen: Configuration,  
          navigationOptions:{  
              tabBarLabel:'Settings',  
              tabBarIcon: ({ tintColor }) => (  
                  <View>  
                      <Icon style={[{color: tintColor}]} size={25} name={'settings'}/>  
                  </View>),  
          }  
      },  
  },  
  {  
    initialRouteName: "Monitor",  
    activeColor: '#f0edf6',  
    inactiveColor: '#90caf9',  
    barStyle: { backgroundColor: '#1976d2' },  
  },  
);

export default createAppContainer(TabNavigator);