import React, { useEffect } from 'react';
import { Button, Dialog, Portal, RadioButton } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import FirebaseService from '../services/FirebaseService';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import PeriodicalPollingService from '../services/PeriodicalPollingService';
import Constants from '../resources/Constants';

/**
 * Dialog window with switch application mode options
 * @param visible true if the dialog is open
 * @param hideDialog callback called on dialog dismiss
 */
const SwitchModeDialog = ({ visible, hideDialog }) => {
  const { config, setConfig } = useConfig();
  const [mode, setMode] = React.useState(config.mode);

  /**
   * Initializes the current application mode from config context
   */
  useEffect(() => {
    if (visible) {
      setMode(config.mode);
    }
  }, [visible]);

  /**
   * Confirms the dialog
   * Fails on try to switch to gateway mode when there is already a gateway service running
   * Saves the new mode to async storage and config context
   */
  const ok = async () => {
    if (mode === 'client' && PeriodicalPollingService.isRunning()) {
      Toast.show(
        'Can not switch to client mode while gateway service is running',
        Toast.LONG
      );
      return;
    }
    if (
      mode === 'gateway' &&
      !(await FirebaseService.isGatewayLockAvailable())
    ) {
      Toast.show(
        'Can not switch to gateway mode, another gateway device already present',
        Toast.LONG
      );
      return;
    }
    hideDialog();
    Toast.show(`Switched to ${mode} mode`);
    let newConfig = {
      ...config,
      mode: mode,
    };
    setConfig(newConfig);
    AsyncStorage.setItem(Constants.MODE, mode);
  };

  /**
   * Discards the dialog
   */
  const discard = () => {
    hideDialog();
    setMode(config.mode);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={discard}>
        <Dialog.Title>Application mode</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={(value) => setMode(value)}
            value={mode}
          >
            <RadioButton.Item label="Client mode" value="client" />
            <RadioButton.Item label="Gateway mode" value="gateway" />
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: 'space-between' }}>
          <Button onPress={discard}>Cancel</Button>
          <Button onPress={ok}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SwitchModeDialog;
