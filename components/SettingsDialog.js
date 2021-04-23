import React, { useEffect, useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import AsyncStorage from '@react-native-community/async-storage';
import { defaultConfig } from '../hooks/useConfig';
import { View } from 'react-native';
import Toast from 'react-native-simple-toast';

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
    let validation = validate();
    if (!validation.ok) {
      Toast.show(validation.error);
      return;
    }
    Toast.show('Settings successfully updated');
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

  const validate = () => {
    if (!gatewayInterval || isNaN(parseInt(gatewayInterval)) || parseInt(gatewayInterval) < 1 || parseInt(gatewayInterval) > 60) {
      return {
        ok: false,
        error: "Gateway interval has to be between 1 and 60 seconds"
      }
    }
    if (!ipSuffix || isNaN(parseInt(ipSuffix)) || parseInt(ipSuffix) < 0 || parseInt(ipSuffix) > 255) {
      return {
        ok: false,
        error: "Ip address suffix has to be between 0 and 255"
      }
    }
    if (!port || isNaN(parseInt(port)) || parseInt(port) < 0 || parseInt(port) > 65353) {
      return {
        ok: false,
        error: "Network port has to be between 0 and 65353"
      }
    }
    if (!exportDirectory) {
      return {
        ok: false,
        error: 'Please set the export directory'
      }
    } 
    return { ok: true };
  }

  const discard = () => {
    hideDialog();
  }

  const reset = () => {
    setGatewayInterval(defaultConfig.gatewayInterval);
    setIpSuffix(defaultConfig.ipSuffix);
    setPort(defaultConfig.networkPort);
    setExportDirectory(defaultConfig.exportDirectory);
  }

  return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={discard}>
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Content style={{alignItems: 'center'}}>
            <TextInput
              keyboardType={'numeric'}
              label='Gateway service interval'
              value={gatewayInterval}
              onChangeText={text => {
                setGatewayInterval(text);
              } }
              style={{marginBottom: 10, width: '95%'}}
            />
            <TextInput
              keyboardType={'numeric'}
              label='Common device IP address suffix'
              value={ipSuffix}
              onChangeText={text => {
                setIpSuffix(text);
              } }
              style={{marginBottom: 10, width: '95%'}}
            />
            <TextInput
              keyboardType={'numeric'}
              label='Device network port'
              value={port}
              onChangeText={text => {
                setPort(text);
              } }
              style={{marginBottom: 10, width: '95%'}}
            />
            <TextInput
              label='Export directory'
              value={exportDirectory}
              onChangeText={text => {
                setExportDirectory(text);
              } }
              style={{marginBottom: 10, width: '95%'}}
            />
          </Dialog.Content>
          <Dialog.Actions style={{justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Button onPress={discard}>Cancel</Button>
              <Button onPress={reset}>Defaults</Button>
            </View>
            <View>
              <Button onPress={ok}>OK</Button>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
  );
};

export default SettingsDialog;