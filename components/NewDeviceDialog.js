import React, { useEffect, useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import Toast from 'react-native-simple-toast';

const NewDeviceDialog = ({
  updatedDevice,
  visible,
  close,
  confirm,
  validate,
}) => {
  const [device, setDevice] = useState(
    updatedDevice
      ? updatedDevice
      : {
          name: '',
          ip: '',
        }
  );

  useEffect(() => {
    if (updatedDevice) {
      setDevice(updatedDevice);
    }
  }, [updatedDevice]);

  const clear = () => {
    setDevice({
      name: '',
      ip: '',
    });
  };

  const processConfirmation = () => {
    var validation = validate(device);
    if (!validation.ok) {
      Toast.show(validation.error);
      return;
    }
    confirm(device);
    clear();
  };

  const processClose = () => {
    close();
    clear();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={processClose}>
        <Dialog.Title>
          {!!updatedDevice ? 'Edit device' : 'Set up new device'}
        </Dialog.Title>
        <Dialog.Content style={{ alignItems: 'center' }}>
          <TextInput
            placeholder="Device name"
            label="Device name"
            value={device.name}
            onChangeText={(text) => {
              var newDevice = { ...device };
              newDevice.name = text;
              setDevice(newDevice);
            }}
            style={{ marginBottom: 10, width: '95%' }}
          />
          <TextInput
            keyboardType={'numeric'}
            placeholder="192.168.0.68"
            label="IP address"
            value={device.ip}
            onChangeText={(text) => {
              var newDevice = { ...device };
              newDevice.ip = text;
              setDevice(newDevice);
            }}
            style={{ marginBottom: 10, width: '95%' }}
          />
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: 'space-between' }}>
          <Button onPress={processClose}>Cancel</Button>
          <Button onPress={processConfirmation}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default NewDeviceDialog;
