import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

/**
 * Dialog window asking user if he wants to overwrite the previous data readings when gateway service is restarted
 * @param visible true if the dialog is open
 * @param hideDialog callback called on dialog dismiss
 * @param callback callback called on dialog confirm
 */
const RestartGatewayDataDialog = ({ visible, hideDialog, callback }) => {
  /**
   * Confirms the dialog
   */
  const ok = () => {
    callback();
    hideDialog();
  };

  /**
   * Discards the dialog
   */
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
