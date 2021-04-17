import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Button, Card, TextInput, Title } from 'react-native-paper';
import Toast from 'react-native-simple-toast';

const NewDeviceModal = ({ updatedDevice, visible, close, confirm, validate }) => {
  const [device, setDevice] = useState(updatedDevice ? updatedDevice : {
    name: "",
    ip: ""
  });

  useEffect(() => {
    if (updatedDevice) {
      setDevice(updatedDevice);
    }
  }, [updatedDevice]);

  const clear = () => {
    setDevice({
      name: "",
      ip: ""
    });
  }

  const processConfirmation = () => {
    var validation = validate(device);
    if (!validation.ok) {
      Toast.show(validation.error);
      return;
    }
    confirm(device);
    clear();
  }

  const processClose = () => {
    close();
    clear();
  }

  return (
    <Modal isVisible={visible} onBackdropPress={processClose} onBackButtonPress={processClose}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {!updatedDevice && <Title style={{marginBottom: 20}}>Set up new device</Title>}
          {updatedDevice && <Title style={{marginBottom: 20}}>Edit device</Title>}
          <TextInput
            placeholder='Device name'
            label='Device name'
            value={device.name}
            onChangeText={text => {
              var newDevice = { ...device };
              newDevice.name = text;
              setDevice(newDevice);
            } }
            style={{marginBottom: 10, width: 280}}
          />
          <TextInput
            keyboardType={'numeric'}
            placeholder='192.168.0.68'
            label='IP address'
            value={device.ip}
            onChangeText={text => {
              var newDevice = { ...device };
              newDevice.ip = text;
              setDevice(newDevice);
            } }
            style={{marginBottom: 10, width: 280}}
          />
        </Card.Content>
        <Card.Actions style={{justifyContent: 'space-between'}}>
          <Button onPress={processClose}>Cancel</Button>
            <Button onPress={processConfirmation}>OK</Button>
        </Card.Actions>
      </Card>
    </Modal>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      width: '100%',
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      alignItems: 'center'
    }
  });

  export default NewDeviceModal;