import React from 'react';

import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'; 
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { View } from 'react-native';
import Configuration from '../screens/Configuration';
import Monitor from '../screens/Monitor';
import Commands from '../screens/Commands';
import { useConfig } from '../hooks/useConfig';

const Tab = createMaterialBottomTabNavigator();

const BottomDrawerNavigator = () => {
    const { config } = useConfig();

    return (
        <Tab.Navigator 
            initialRouteName="Monitor" 
            activeColor="#f0edf6"  
            inactiveColor="#90caf9"  
            barStyle={{ backgroundColor: '#1976d2' }}
        >
            <Tab.Screen name="Monitor" component={Monitor} options={
                {  
                    tabBarLabel:'Monitor',  
                    tabBarIcon: ({ color  }) => (  
                        <View>  
                            <Icon style={[{color: color }]} size={25} name={'visibility'}/>  
                        </View>),  
                } 
            }/>
            <Tab.Screen name="Commands" component={Commands} options={
                {  
                    tabBarLabel:'Commands',  
                    tabBarIcon: ({ color  }) => (  
                        <View>  
                            <Icon style={[{color: color }]} size={25} name={'send'}/>  
                        </View>),  
                }  
            }/>
            {config.mode === 'gateway' && 
                <Tab.Screen name="Configuration" component={Configuration} options={
                    {  
                        tabBarLabel:'Configuration',  
                        tabBarIcon: ({ color  }) => (  
                            <View>  
                                <Icon style={[{color: color }]} size={25} name={'settings'}/>  
                            </View>),  
                    }
                }/>
            }
        </Tab.Navigator>
    );
}

export default BottomDrawerNavigator;