import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View, ScrollView, Text} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
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

export default function CommandsScreen({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const user = auth().currentUser;
  const [command, setCommand] = useState("");
  const [value, setValue] = useState("");
  const [targets, setTargets] = useState([]);
  const [canSend, setCanSend] = useState(false);
  const { config, setConfig } = useConfig();
  const [isLoading, setLoading] = useState(false);
  const [readings, setReadings] = useState({ devices: [] });

  useEffect(() => { //TODO refactor
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: "Commands"
      };
      setConfig(newConfig);
    });
    
    return unsubscribe;
  }, [navigation, config]);

  useEffect(() => {
    firestore().settings = {  };
    var unsubscribe = firestore().collection("readings")
      .onSnapshot((snapshot) => {
        if (snapshot) {
          //should be only 1 document
          snapshot.forEach((doc) => doc.id === user.email && setReadings(doc.data()));
        }
      });
      //cleanup
      return unsubscribe;
  }, []);

  useEffect(() => {
    setCanSend(command && targets.length !== 0 && (!command.domain || value));
  }, [command, value, targets]);

  useEffect(() => {
    setValue("");
  }, [command]);

  const isSelected = (item) => {
    return targets.some(t => t.ip === item.ip);
  }

  const select = (item) => {
    if (targets.some(t => t.ip === item.ip)) {
      var newTargets = targets.filter(t => t.ip !== item.ip);
    } else {
      var newTargets = [...targets];
      newTargets.push(item);
    }
    setTargets(newTargets);
  }

  const validate = () => {
    if (command.domain) {
      if (command.domain.type === "numeric") {
        var val = parseFloat(value);
        return {
          ok: !Number.isNaN(val) && val >= command.domain.values.min && val <= command.domain.values.max,
          error: `Allowed value range for selected command is <${command.domain.values.min}, ${command.domain.values.max}>`
        }
      }
      if (command.domain.type === "string") {
        return {
          ok: command.domain.values.includes(value),
          error: `Allowed values for selected command are [${command.domain.values}]`
        }
      }
    }
    return { ok: true };
  }

  const reset = () => {
    setValue("");
    setTargets([]);
  }

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
      ips: targets.map(t => t.ip)
    }
    await FirebaseService.queueCommand(commandData);

    reset();
    setLoading(false);
    Toast.show('Command successfully sent');
  }

  const devicesAvailable = () => {
    return readings && readings.devices && readings.devices.length > 0;
  }

  return (
    <>
      {!devicesAvailable() && <NoDataComponent />}
      {devicesAvailable() && 
        <View style={styles.container}>
          <View style={{ margin: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', width: '95%'}}>
              <View style={{ width: '70%', marginRight: 15 }}>
                <Select
                  label='Command'
                  value={command.value}
                  setValue={(value) => setCommand(commandList.find(c => c.value === value))}
                  data={commandList}
                />
              </View>
              <TextInput style={{ width: '30%' }}
                keyboardType='numeric'
                disabled={!command.domain}
                label='Value'
                value={value}
                onChangeText={text => setValue(text)}
              />
            </View>
          </View>
          <View style={{ margin: 10, flex: 4 }}>
            <Text style={{fontSize: 18, alignSelf: 'center', marginBottom: 20}}>Target devices:</Text>
            <ScrollView contentContainerStyle={{alignItems: 'center'}}>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                {readings.devices.map((item, index) => {
                  return(
                    <Chip key={index} selected={isSelected(item)} onPress={() => select(item)} style={{margin: 5}} textStyle={{maxWidth: 100}}>
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
                marginRight: 'auto'
              }}
            />
        </View>
      }
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
  }
});