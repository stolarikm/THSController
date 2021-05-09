import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import FirebaseService from '../services/FirebaseService';
import Toast from 'react-native-simple-toast';

/**
 * Dialog window asking user for consent to clear the readings from cloud
 */
const ClearDataDialog = ({ visible, hideDialog }) => {
  /**
   * Confirms the dialog and clears the data using FirebaseService
   */
  const ok = async () => {
    await FirebaseService.clearData();
    Toast.show('Data successfully cleared');
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
        <Dialog.Title>Clear data readings</Dialog.Title>
        <Dialog.Content>
          <Text>
            Do you really want to clear data readings of all devices from cloud
            storage?
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

export default ClearDataDialog;
