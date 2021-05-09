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
import Constants from '../resources/Constants';
import { StatusBar } from 'react-native';
import NavigationBar from 'react-native-navbar-color';

const Stack = createStackNavigator();

/**
 * Main component
 * Encapsulating all screen components inside providers
 */
const MainCompoment = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [inited, setInited] = useState(false);
  const { config, setConfig } = useConfig();
  const user = auth().currentUser;
  const isPortrait = useOrientation();

  /**
   * Sets the colors of status bar and navigation bar on component mount
   */
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  /**
   * Loads the configuration on component mount
   */
  useEffect(() => {
    init();
  }, []);

  /**
   * Re-renders the layout on orientation change
   */
  useEffect(() => {
    //render
  }, [isPortrait]);

  /**
   * Loads the configuration
   */
  const init = async () => {
    let newConfig = {};
    let devices = await getObject(Constants.DEVICES);
    if (devices) {
      newConfig.devices = devices;
    }
    let mode = await get(Constants.MODE);
    if (mode) {
      newConfig.mode = mode;
    }
    let gatewayInterval = await get(Constants.GATEWAY_INTERVAL);
    if (gatewayInterval) {
      newConfig.gatewayInterval = gatewayInterval;
    }
    let ipSuffix = await get(Constants.IP_SUFFIX);
    if (ipSuffix) {
      newConfig.ipSuffix = ipSuffix;
    }
    let networkPort = await get(Constants.NETWORK_PORT);
    if (networkPort) {
      newConfig.networkPort = networkPort;
    }
    let exportDirectory = await get(Constants.EXPORT_DIRECTORY);
    if (exportDirectory) {
      newConfig.exportDirectory = exportDirectory;
    }
    setConfig({ ...config, ...newConfig });
    setInited(true);
  };

  /**
   * Gets string from async storage
   * @param label item label
   */
  const get = async (label) => {
    return await AsyncStorage.getItem(label);
  };

  /**
   * Gets object from async storage
   * @param label item label
   */
  const getObject = async (label) => {
    let result = await get(label);
    return JSON.parse(result);
  };

  /**
   * Returns the initial screen
   * Login screen for not logged-in users
   * Navigator form main screens for logged-in users
   */
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
