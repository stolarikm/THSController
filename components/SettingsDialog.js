import React, { useEffect, useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import AsyncStorage from '@react-native-community/async-storage';
import { defaultConfig } from '../hooks/useConfig';
import { ScrollView, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import Constants from '../resources/Constants';

/**
 * Settings dialog window
 * @param visible true if the dialog is open
 * @param hideDialog callback called on dialog dismiss
 */
const SettingsDialog = ({ visible, hideDialog }) => {
  const { config, setConfig } = useConfig();
  const [gatewayInterval, setGatewayInterval] = useState('');
  const [ipSuffix, setIpSuffix] = useState('');
  const [port, setPort] = useState('');
  const [exportDirectory, setExportDirectory] = useState('');

  /**
   * Initializes the current configuration on dialog open
   */
  useEffect(() => {
    setGatewayInterval(config.gatewayInterval);
    setIpSuffix(config.ipSuffix);
    setPort(config.networkPort);
    setExportDirectory(config.exportDirectory);
  }, [visible]);

  /**
   * Confirms the dialog
   * Validates inputs and sets the configuration to the config context and async storage
   */
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
      exportDirectory: exportDirectory,
    };
    setConfig(newConfig);

    AsyncStorage.setItem(Constants.GATEWAY_INTERVAL, gatewayInterval);
    AsyncStorage.setItem(Constants.IP_SUFFIX, ipSuffix);
    AsyncStorage.setItem(Constants.NETWORK_PORT, port);
    AsyncStorage.setItem(Constants.EXPORT_DIRECTORY, exportDirectory);
  };

  /**
   * Validates the settings values
   */
  const validate = () => {
    if (
      !gatewayInterval ||
      isNaN(parseInt(gatewayInterval)) ||
      parseInt(gatewayInterval) < 1 ||
      parseInt(gatewayInterval) > 60
    ) {
      return {
        ok: false,
        error: 'Gateway interval has to be between 1 and 60 seconds',
      };
    }
    if (
      !ipSuffix ||
      isNaN(parseInt(ipSuffix)) ||
      parseInt(ipSuffix) < 0 ||
      parseInt(ipSuffix) > 255
    ) {
      return {
        ok: false,
        error: 'Ip address suffix has to be between 0 and 255',
      };
    }
    if (
      !port ||
      isNaN(parseInt(port)) ||
      parseInt(port) < 0 ||
      parseInt(port) > 65353
    ) {
      return {
        ok: false,
        error: 'Network port has to be between 0 and 65353',
      };
    }
    if (!exportDirectory) {
      return {
        ok: false,
        error: 'Please set the export directory',
      };
    }
    return { ok: true };
  };

  /**
   * Discards the dialog
   */
  const discard = () => {
    hideDialog();
  };

  /**
   * Resets defaults to inputs
   */
  const reset = () => {
    setGatewayInterval(defaultConfig.gatewayInterval);
    setIpSuffix(defaultConfig.ipSuffix);
    setPort(defaultConfig.networkPort);
    setExportDirectory(defaultConfig.exportDirectory);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={discard}>
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.ScrollArea style={{ alignItems: 'center' }}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            <TextInput
              keyboardType={'numeric'}
              label="Gateway service interval"
              value={gatewayInterval}
              onChangeText={(text) => {
                setGatewayInterval(text);
              }}
              style={{ marginBottom: 10, width: '95%' }}
            />
            <TextInput
              keyboardType={'numeric'}
              label="Common device IP address suffix"
              value={ipSuffix}
              onChangeText={(text) => {
                setIpSuffix(text);
              }}
              style={{ marginBottom: 10, width: '95%' }}
            />
            <TextInput
              keyboardType={'numeric'}
              label="Device network port"
              value={port}
              onChangeText={(text) => {
                setPort(text);
              }}
              style={{ marginBottom: 10, width: '95%' }}
            />
            <TextInput
              label="Export directory"
              value={exportDirectory}
              onChangeText={(text) => {
                setExportDirectory(text);
              }}
              style={{ marginBottom: 10, width: '95%' }}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={{ justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
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
