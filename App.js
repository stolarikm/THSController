import React from 'react';

import { createAppContainer } from 'react-navigation';  
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'; 
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import Home from './screens/Home';
import Settings from './screens/Settings';
import { View } from 'react-native';

const TabNavigator = createMaterialBottomTabNavigator(  
  {  
      Home: { screen: Home,  
          navigationOptions:{  
              tabBarLabel:'Home',  
              tabBarIcon: ({ tintColor }) => (  
                  <View>  
                      <Icon style={[{color: tintColor}]} size={25} name={'home'}/>  
                  </View>),  
          }  
      },  
      Config: { screen: Settings,  
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
    initialRouteName: "Home",  
    activeColor: '#f0edf6',  
    inactiveColor: '#90caf9',  
    barStyle: { backgroundColor: '#1976d2' },  
  },  
);

export default createAppContainer(TabNavigator);