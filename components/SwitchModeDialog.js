import * as React from 'react';
import { Button, Dialog, Portal, RadioButton } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';

const SwitchModeDialog = ({ visible, hideDialog }) => {

  const { config, setConfig } = useConfig();
  const [mode, setMode] = React.useState(config.mode);

  const ok = () => {
    hideDialog();
    let newConfig = {
      ...config,
      mode: mode
    };
    setConfig(newConfig);
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