import React, { useEffect } from 'react';
import { Button, Dialog, Portal, RadioButton } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import FirebaseService from '../services/FirebaseService';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';

const SwitchModeDialog = ({ visible, hideDialog }) => {

  const { config, setConfig } = useConfig();
  const [mode, setMode] = React.useState(config.mode);

  useEffect(() => {
    if (visible) {
      setMode(config.mode);
    }
  }, [visible]);

  const MODE = "MODE";

  const ok = async () => {
    if (mode === 'gateway' && !await FirebaseService.isGatewayLockAvailable()) {
      Toast.show('Can not switch to gateway mode, another gateway device already present', Toast.LONG);
      return;
    }
    hideDialog();
    let newConfig = {
      ...config,
      mode: mode
    };
    setConfig(newConfig);
    AsyncStorage.setItem(MODE, mode);
  }

  const discard = () => {
    hideDialog();
    setMode(config.mode);
  }

  return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={discard}>
          <Dialog.Title>Application mode</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setMode(value)} value={mode}>
              <RadioButton.Item label="Client mode" value="client" />
              <RadioButton.Item label="Gateway mode" value="gateway" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={discard}>Cancel</Button>
            <Button onPress={ok}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
  );
};

export default SwitchModeDialog;