import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { TextInput, FAB } from 'react-native-paper';
import { Select } from '../components/DropDown';
import { Chip } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import Toast from 'react-native-simple-toast';
import LoadingOverlay from '../components/LoadingOverlay';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FirebaseService from '../services/FirebaseService';
import commandList from '../resources/commands.json';
import NoDataComponent from '../components/NoDataComponent';

/**
 * Command screen component
 * @param navigation navigation context
 */
export default function CommandsScreen({ navigation }) {
  const user = auth().currentUser;
  const [command, setCommand] = useState('');
  const [value, setValue] = useState('');
  const [targets, setTargets] = useState([]);
  const [canSend, setCanSend] = useState(false);
  const { config, setConfig } = useConfig();
  const [isLoading, setLoading] = useState(false);
  const [readings, setReadings] = useState({ devices: [] });

  /**
   * Sets the current screen name in config context
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: 'Commands',
      };
      setConfig(newConfig);
    });
    //cleanup
    return unsubscribe;
  }, [navigation, config]);

  /**
   * Registers a snapshot listener to the Firestore
   */
  useEffect(() => {
    firestore().settings = {};
    var unsubscribe = firestore()
      .collection('readings')
      .onSnapshot((snapshot) => {
        if (snapshot) {
          //should be only 1 document
          snapshot.forEach(
            (doc) => doc.id === user.email && setReadings(doc.data())
          );
        }
      });
    //cleanup
    return unsubscribe;
  }, []);

  /**
   * Keeps track of canSend state depending on input values
   * Sets canSend to true only if the command, value and targets are set
   */
  useEffect(() => {
    setCanSend(command && targets.length !== 0 && (!command.domain || value));
  }, [command, value, targets]);

  /**
   * Clears value when command is changed
   */
  useEffect(() => {
    setValue('');
  }, [command]);

  /**
   * Returns true if the target device is selected
   * @param item target device
   */
  const isSelected = (item) => {
    return targets.some((t) => t.ip === item.ip);
  };

  /**
   * Selects a target device
   * @param item target device
   */
  const select = (item) => {
    if (targets.some((t) => t.ip === item.ip)) {
      var newTargets = targets.filter((t) => t.ip !== item.ip);
    } else {
      var newTargets = [...targets];
      newTargets.push(item);
    }
    setTargets(newTargets);
  };

  /**
   * Validates the inputs
   * Returns { ok: true if validation passed, error: error message, if any }
   */
  const validate = () => {
    if (command.domain) {
      if (command.domain.type === 'numeric') {
        var val = parseFloat(value);
        return {
          ok:
            !Number.isNaN(val) &&
            val >= command.domain.values.min &&
            val <= command.domain.values.max,
          error: `Allowed value range for selected command is <${command.domain.values.min}, ${command.domain.values.max}>`,
        };
      }
      if (command.domain.type === 'string') {
        return {
          ok: command.domain.values.includes(value),
          error: `Allowed values for selected command are [${command.domain.values}]`,
        };
      }
    }
    return { ok: true };
  };

  /**
   * Resets the inputs
   */
  const reset = () => {
    setValue('');
    setTargets([]);
  };

  /**
   * Process the command send action
   * Firstly validates, then enqueues the command
   */
  const sendCommand = async () => {
    if (!canSend) {
      return;
    }
    var validation = validate();
    if (!validation.ok) {
      Toast.show(validation.error);
      return;
    }
    setLoading(true);
    var commandData = {
      command: command.value,
      value: value,
      register: command.register,
      ips: targets.map((t) => t.ip),
    };
    await FirebaseService.queueCommand(commandData);

    reset();
    setLoading(false);
    Toast.show('Command successfully sent');
  };

  /**
   * Returns true if there are target devices available
   */
  const devicesAvailable = () => {
    return readings && readings.devices && readings.devices.length > 0;
  };

  return (
    <>
      {!devicesAvailable() && <NoDataComponent />}
      {devicesAvailable() && (
        <View style={styles.container}>
          <View style={{ margin: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', width: '95%' }}>
              <View
                style={
                  command.domain
                    ? { width: '70%', marginRight: 15 }
                    : { width: '100%' }
                }
              >
                <Select
                  label="Command"
                  value={command.value}
                  setValue={(value) =>
                    setCommand(commandList.find((c) => c.value === value))
                  }
                  data={commandList}
                />
              </View>
              {command.domain && command.domain.type === 'numeric' && (
                <TextInput
                  style={{ width: '30%' }}
                  keyboardType="numeric"
                  label="Value"
                  value={value}
                  onChangeText={(text) => setValue(text)}
                />
              )}
              {command.domain && command.domain.type === 'string' && (
                <View style={{ width: '30%' }}>
                  <Select
                    label="Value"
                    value={value}
                    setValue={(text) => setValue(text)}
                    data={command.domain.values.map((val) => {
                      return { value: val, label: val };
                    })}
                  />
                </View>
              )}
            </View>
          </View>
          <View style={{ margin: 10, flex: 4 }}>
            <Text
              style={{ fontSize: 18, alignSelf: 'center', marginBottom: 20 }}
            >
              Target devices:
            </Text>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {readings.devices.map((item, index) => {
                  return (
                    <Chip
                      key={index}
                      selected={isSelected(item)}
                      onPress={() => select(item)}
                      style={{ margin: 5 }}
                      textStyle={{ maxWidth: 100 }}
                    >
                      <Text numberOfLines={1}>{item.name}</Text>
                    </Chip>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          <FAB
            icon="send"
            label="Send"
            onPress={() => sendCommand()}
            disabled={!canSend}
            style={{
              position: 'absolute',
              bottom: 30,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        </View>
      )}
      {isLoading && <LoadingOverlay />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
