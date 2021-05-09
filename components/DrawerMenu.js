import React, { useEffect, useState } from 'react';
import { DrawerHeader, DrawerItem } from 'material-bread';
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import * as NavigationService from '../services/NavigationService';
import SwitchModeDialog from './SwitchModeDialog';
import { useConfig } from '../hooks/useConfig';
import SettingsDialog from './SettingsDialog';
import { useOrientation } from '../hooks/useOrientation';
import ClearDataDialog from './ClearDataDialog';

/**
 * Drawer menu, accessible from menu icon in the appbar
 * @param close callback which is called when closing the drawer
 */
const DrawerMenu = ({ close }) => {
  const user = auth().currentUser;
  const { config } = useConfig();
  const isPortrait = useOrientation();
  const [showSwitchModeDialog, setShowSwitchModeDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);

  /**
   * Closes the drawer menu on landscape orientation
   */
  useEffect(() => {
    if (!isPortrait) {
      close();
    }
  }, [isPortrait]);

  /**
   * Logs out the user and redirects to Login screen
   */
  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        close();
        NavigationService.navigate('LoginScreen');
      });
  };

  /**
   * Opens the switch mode dialog
   */
  const openSwitchModeDialog = () => {
    close();
    setShowSwitchModeDialog(true);
  };

  /**
   * Opens the settings dialog
   */
  const openSettingsDialog = () => {
    close();
    setShowSettingsDialog(true);
  };

  /**
   * Opens the clear data dialog
   */
  const openClearDataDialog = () => {
    close();
    setShowClearDataDialog(true);
  };

  return (
    <>
      <View>
        <DrawerHeader
          title={config.mode === 'client' ? 'Client mode' : 'Gateway mode'}
          subtitle={user ? user.email : ''}
        />
        <DrawerItem
          text={'Switch mode '}
          icon={'swap-vert'}
          onPress={openSwitchModeDialog}
        />
        <DrawerItem
          text={'Settings '}
          icon={'settings'}
          onPress={openSettingsDialog}
        />
        <DrawerItem
          text={'Clear data '}
          icon={'delete'}
          onPress={openClearDataDialog}
        />
        <DrawerItem text={'Logout '} icon={'exit-to-app'} onPress={logout} />
      </View>
      <SwitchModeDialog
        visible={showSwitchModeDialog}
        hideDialog={() => setShowSwitchModeDialog(false)}
      />
      <SettingsDialog
        visible={showSettingsDialog}
        hideDialog={() => setShowSettingsDialog(false)}
      />
      <ClearDataDialog
        visible={showClearDataDialog}
        hideDialog={() => setShowClearDataDialog(false)}
      />
    </>
  );
};

export default DrawerMenu;
