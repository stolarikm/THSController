import React, { useEffect, useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import AsyncStorage from '@react-native-community/async-storage';

const SettingsDialog = ({ visible, hideDialog }) => {

  const { config, setConfig } = useConfig();
  const [gatewayInterval, setGatewayInterval] = useState("");
  const [ipSuffix, setIpSuffix] = useState("");
  const [port, setPort] = useState("");
  const [exportDirectory, setExportDirectory] = useState("");

  useEffect(() => {
    setGatewayInterval(config.gatewayInterval);
    setIpSuffix(config.ipSuffix);
    setPort(config.networkPort);
    setExportDirectory(config.exportDirectory);
  }, [visible]);

  const GATEWAY_INTERVAL = "GATEWAY_INTERVAL";
  const IP_SUFFIX = "IP_SUFFIX";
  const NETWORK_PORT = "NETWORK_PORT";
  const EXPORT_DIRECTORY = "EXPORT_DIRECTORY";

  const ok = () => {
    hideDialog();
    let newConfig = {
      ...config,
      gatewayInterval: gatewayInterval,
      ipSuffix: ipSuffix,
      networkPort: port,
      exportDirectory: exportDirectory
    };
    setConfig(newConfig);

    AsyncStorage.setItem(GATEWAY_INTERVAL, gatewayInterval);
    AsyncStorage.setItem(IP_SUFFIX, ipSuffix);
    AsyncStorage.setItem(NETWORK_PORT, port);
    AsyncStorage.setItem(EXPORT_DIRECTORY, exportDirectory);
  }

  const discard = () => {
    hideDialog();
  }

  return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={discard}>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label='Gateway service interval'
              value={gatewayInterval}
              onChangeText={text => {
                setGatewayInterval(text);
              } }
              style={{marginBottom: 10, width: 280}}
            />
            <TextInput
              label='Common device IP address suffix'
              value={ipSuffix}
              onChangeText={text => {
                setIpSuffix(text);
              } }
              style={{marginBottom: 10, width: 280}}
            />
            <TextInput
              label='Device network port'
              value={port}
              onChangeText={text => {
                setPort(text);
              } }
              style={{marginBottom: 10, width: 280}}
            />
            <TextInput
              label='Export directory'
              value={exportDirectory}
              onChangeText={text => {
                setExportDirectory(text);
              } }
              style={{marginBottom: 10, width: 280}}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={discard}>Cancel</Button>
            <Button onPress={ok}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
  );
};

export default SettingsDialog;