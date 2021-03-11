import React, { useState } from 'react';
import { Text } from 'react-native';
import {StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import { Button, Card, TextInput, Title } from 'react-native-paper';

const NewDeviceModal = ({ visible, close, confirm, validate }) => {

  const [error, setError] = useState("");
  const [device, setDevice] = useState({
    name: "",
    ip: ""
  });

  const clear = () => {
    setDevice({
      name: "",
      ip: ""
    });
    setError("");
  }

  const processConfirmation = () => {
    var validation = validate(device);
    if (validation.ok) {
      confirm(device);
      clear();
    } else {
      setError(validation.message);
    }
  }

  const processClose = () => {
    close();
    clear();
  }

  return (
    <Modal isVisible={visible} onBackdropPress={processClose} onBackButtonPress={processClose}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Title style={{marginBottom: 20}}>Set up new device</Title>
          <TextInput
            placeholder='Device name'
            label='Device name'
            value={device.name}
            onChangeText={text => {
              var newDevice = { ...device };
              newDevice.name = text;
              setDevice(newDevice);
              setError("");
            } }
            style={{marginBottom: 10, width: 280}}
          />
          <TextInput
            placeholder='192.168.0.68'
            label='IP address'
            value={device.ip}
            onChangeText={text => {
              var newDevice = { ...device };
              newDevice.ip = text;
              setDevice(newDevice);
              setError("");
            } }
            style={{marginBottom: 10, width: 280}}
          />
          
            <Text style={{color: 'red'}}>{error}</Text>
          
          <Button
            style={{marginTop: 10}}
            onPress={() => processConfirmation()}
          >
            Confirm
          </Button>
        </Card.Content>
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