import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
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
    setCanSend(command && value && targets.length !== 0);
  }, [command, value, targets]);

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

  const reset = () => {
    setValue("");
    setTargets([]);
  }

  const commandList = [
    { label: 'Temperature correction', value: 'temp_corr' },
  ];

  const sendCommand = async () => {
    if (!canSend) {
      return;
    }
    setLoading(true);
    var commandData = {
      command: command,
      value: value,
      ips: targets.map(t => t.ip)
    }
    await FirebaseService.queueCommand(commandData);

    reset();
    setLoading(false);
    Toast.show('Command successfully sent');
  }

  return (
    <>
      <View style={styles.container}>
        <View style={{ margin: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row', width: '95%'}}>
            <View style={{ width: '70%', marginRight: 15 }}>
              <Select
                label='Command'
                value={command}
                setValue={setCommand}
                data={commandList}
              />
            </View>
            <TextInput style={{ width: '30%' }}
              label='Value'
              value={value}
              onChangeText={text => setValue(text)}
            />
          </View>
        </View>
        <View style={{ margin: 10, flex: 3 }}>
          <View style={{flexDirection: 'row'}}>
            {readings.devices.map((item, index) => {
              return(
                <Chip key={index} selected={isSelected(item)} onPress={() => select(item)} style={{margin: 5}}>
                  {item.name}
                </Chip>
                );
            })}
          </View>
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