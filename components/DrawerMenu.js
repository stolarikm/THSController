import React, { useState } from 'react';
import { DrawerHeader, DrawerItem } from "material-bread";
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import * as NavigationService from '../services/NavigationService';
import SwitchModeDialog from './SwitchModeDialog';

const DrawerMenu = ({close}) => {
    const user = auth().currentUser;

    const [showSwitchModeDialog, setShowSwitchModeDialog] = useState(false);

    const logout = () => {
        auth()
            .signOut()
            .then(() => {
                close();
                NavigationService.navigate('LoginScreen');
        });
    }

    const switchMode = () => {
        close();
        setShowSwitchModeDialog(true);
    }

    return (
        <>
            <View>
                <DrawerHeader title="Options" subtitle={user ? user.email : ""}/>
                <DrawerItem text={'Switch mode'} icon={'swap-vert'} onPress={switchMode}/>
                <DrawerItem text={'Logout'} icon={'exit-to-app'} onPress={logout}/>
            </View>
            <SwitchModeDialog visible={showSwitchModeDialog} hideDialog={() => setShowSwitchModeDialog(false)}/>
        </>
    );
};

  export default DrawerMenu;