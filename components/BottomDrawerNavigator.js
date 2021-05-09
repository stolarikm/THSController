import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View } from 'react-native';
import { useConfig } from '../hooks/useConfig';
import MonitorScreen from '../screens/MonitorScreen';
import CommandsScreen from '../screens/CommandsScreen';
import GatewayScreen from '../screens/GatewayScreen';
import { useOrientation } from '../hooks/useOrientation';

const Tab = createMaterialBottomTabNavigator();

/**
 * Bottom-tab navigation component
 * Navigates between three main screens
 */
const BottomDrawerNavigator = () => {
  const { config } = useConfig();
  const isPortrait = useOrientation();

  return (
    <Tab.Navigator
      initialRouteName="Monitor"
      activeColor="#f0edf6"
      inactiveColor="#90caf9"
      barStyle={{
        backgroundColor: '#1976d2',
        display: !isPortrait ? 'none' : 'flex',
      }}
    >
      <Tab.Screen
        name="Monitor"
        component={MonitorScreen}
        options={{
          tabBarLabel: 'Monitor',
          tabBarIcon: ({ color }) => (
            <View>
              <Icon style={[{ color: color }]} size={25} name={'visibility'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Commands"
        component={CommandsScreen}
        options={{
          tabBarLabel: 'Commands',
          tabBarIcon: ({ color }) => (
            <View>
              <Icon style={[{ color: color }]} size={25} name={'send'} />
            </View>
          ),
        }}
      />
      {config.mode === 'gateway' && (
        <Tab.Screen
          name="Gateway"
          component={GatewayScreen}
          options={{
            tabBarLabel: 'Gateway',
            tabBarIcon: ({ color }) => (
              <View>
                <Icon style={[{ color: color }]} size={25} name={'router'} />
              </View>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default BottomDrawerNavigator;
