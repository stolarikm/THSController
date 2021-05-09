import React, { useEffect, useState } from 'react';
import BottomDrawerNavigator from './BottomDrawerNavigator';
import { Appbar } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import auth from '@react-native-firebase/auth';
import { useConfig } from '../hooks/useConfig';
import { Drawer } from 'material-bread';
import DrawerMenu from './DrawerMenu';
import { useOrientation } from '../hooks/useOrientation';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingOverlay from '../components/LoadingOverlay';

const Stack = createStackNavigator();

const MainCompoment = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [inited, setInited] = useState(false);
  const { config, setConfig } = useConfig();
  const user = auth().currentUser;
  const isPortrait = useOrientation();

  const DEVICES = 'DEVICES';
  const MODE = 'MODE';
  const GATEWAY_INTERVAL = 'GATEWAY_INTERVAL';
  const IP_SUFFIX = 'IP_SUFFIX';
  const NETWORK_PORT = 'NETWORK_PORT';
  const EXPORT_DIRECTORY = 'EXPORT_DIRECTORY';

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    //render
  }, [isPortrait]);

  const init = async () => {
    let newConfig = {};
    let devices = await getObject(DEVICES);
    if (devices) {
      newConfig.devices = devices;
    }
    let mode = await get(MODE);
    if (mode) {
      newConfig.mode = mode;
    }
    let gatewayInterval = await get(GATEWAY_INTERVAL);
    if (gatewayInterval) {
      newConfig.gatewayInterval = gatewayInterval;
    }
    let ipSuffix = await get(IP_SUFFIX);
    if (ipSuffix) {
      newConfig.ipSuffix = ipSuffix;
    }
    let networkPort = await get(NETWORK_PORT);
    if (networkPort) {
      newConfig.networkPort = networkPort;
    }
    let exportDirectory = await get(EXPORT_DIRECTORY);
    if (exportDirectory) {
      newConfig.exportDirectory = exportDirectory;
    }
    setConfig({ ...config, ...newConfig });
    setInited(true);
  };

  const get = async (label) => {
    return await AsyncStorage.getItem(label);
  };

  const getObject = async (label) => {
    let result = await get(label);
    return JSON.parse(result);
  };

  const initialScreen = () => {
    return auth().currentUser ? 'BottomDrawerNavigator' : 'LoginScreen';
  };

  if (inited) {
    return (
      <>
        <Appbar.Header style={{ display: !isPortrait ? 'none' : 'flex' }}>
          {user && (
            <Appbar.Action icon="menu" onPress={() => setShowMenu(!showMenu)} />
          )}
          <Appbar.Content title={config && config.screenName} />
        </Appbar.Header>
        <Drawer
          open={showMenu}
          widthPercentage={0.6}
          drawerContent={<DrawerMenu close={() => setShowMenu(false)} />}
          onClose={() => setShowMenu(false)}
          style={{ width: '100%' }}
        >
          <Stack.Navigator initialRouteName={initialScreen()}>
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BottomDrawerNavigator"
              component={BottomDrawerNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </Drawer>
      </>
    );
  } else {
    return <LoadingOverlay />;
  }
};

export default MainCompoment;
