import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

const RestartGatewayDataDialog = ({ visible, hideDialog, callback }) => {
  const ok = () => {
    callback();
    hideDialog();
  };

  const discard = () => {
    hideDialog();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={discard}>
        <Dialog.Title>Overwrite previous data readings</Dialog.Title>
        <Dialog.Content>
          <Text>
            Starting new gateway service will overwrite the data readings from
            previous gateway session. Are you sure you want to overwrite
            previous data?
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: 'space-between' }}>
          <Button onPress={discard}>No</Button>
          <Button onPress={ok}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default RestartGatewayDataDialog;
