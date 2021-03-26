import React, { useState } from 'react';
import BottomDrawerNavigator from './BottomDrawerNavigator';
import { Appbar } from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import auth from '@react-native-firebase/auth';
import { useConfig } from '../hooks/useConfig'
import { Drawer } from 'material-bread';
import DrawerMenu from './DrawerMenu';

const Stack = createStackNavigator();

const MainCompoment = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { config } = useConfig();
  const user = auth().currentUser;

  const initialScreen = () => {
      return auth().currentUser ? "BottomDrawerNavigator" : "LoginScreen";
  }

  return (
      <>
        <Appbar.Header>
          {user && <Appbar.Action  icon="menu" onPress={() => setShowMenu(!showMenu)}/>}
          <Appbar.Content title={config && config.screenName}/>
        </Appbar.Header>
        <Drawer
          open={showMenu}
          widthPercentage={.6}
          drawerContent={<DrawerMenu close={() => setShowMenu(false)}/>}
          onClose={() => setShowMenu(false)}>
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
        </Drawer>
      </>
    );
  };

  export default MainCompoment;