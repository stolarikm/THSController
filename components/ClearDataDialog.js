import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import FirebaseService from '../services/FirebaseService';

const ClearDataDialog = ({ visible, hideDialog }) => {

  const ok = async () => {
    await FirebaseService.clearData();
    hideDialog();
  }

  const discard = () => {
    hideDialog();
  }

  return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={discard}>
          <Dialog.Title>Clear data readings</Dialog.Title>
          <Dialog.Content>
            <Text>Do you really want to clear data readings of all devices from cloud storage?</Text>
          </Dialog.Content>
          <Dialog.Actions style={{justifyContent: 'space-between'}}>
            <Button onPress={discard}>No</Button>
            <Button onPress={ok}>Yes</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
  );
};

export default ClearDataDialog;