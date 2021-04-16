import React, { useEffect, useState } from 'react';
import { DrawerHeader, DrawerItem } from "material-bread";
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import * as NavigationService from '../services/NavigationService';
import SwitchModeDialog from './SwitchModeDialog';
import { useConfig } from '../hooks/useConfig';
import SettingsDialog from './SettingsDialog';
import { useOrientation } from '../hooks/useOrientation';
import ClearDataDialog from './ClearDataDialog';

const DrawerMenu = ({close}) => {
    const user = auth().currentUser;
    const { config } = useConfig();
    const isPortrait = useOrientation();

    const [showSwitchModeDialog, setShowSwitchModeDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showClearDataDialog, setShowClearDataDialog] = useState(false);

    useEffect(() => {
        if (!isPortrait) {
            close();
        }
    }, [isPortrait]);

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

    const settings = () => {
        close();
        setShowSettingsDialog(true);
    }

    const clearData = () => {
        close();
        setShowClearDataDialog(true);
    }

    return (
        <>
            <View>
                <DrawerHeader title={config.mode === 'client' ? "Client mode" : "Gateway mode"} subtitle={user ? user.email : ""}/>
                <DrawerItem text={'Switch mode'} icon={'swap-vert'} onPress={switchMode}/>
                <DrawerItem text={'Settings'} icon={'settings'} onPress={settings}/>
                <DrawerItem text={'Clear data'} icon={'delete'} onPress={clearData}/>
                <DrawerItem text={'Logout'} icon={'exit-to-app'} onPress={logout}/>
            </View>
            <SwitchModeDialog visible={showSwitchModeDialog} hideDialog={() => setShowSwitchModeDialog(false)}/>
            <SettingsDialog visible={showSettingsDialog} hideDialog={() => setShowSettingsDialog(false)}/>
            <ClearDataDialog visible={showClearDataDialog} hideDialog={() => setShowClearDataDialog(false)}/>
        </>
    );
};

  export default DrawerMenu;