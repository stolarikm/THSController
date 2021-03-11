import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar, TextInput, Button, FAB } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { Select } from '../components/DropDown';
import { Chip } from 'react-native-paper';
import { useConfig } from '../hooks/useConfig';
import ModbusService from '../modbus/ModbusService';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
  },
};

export default function Commands({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const [command, setCommand] = useState("");
  const [value, setValue] = useState("");
  const [targets, setTargets] = useState([]);
  const [canSend, setCanSend] = useState(false);
  const user = auth().currentUser;
  const { config } = useConfig();

  useEffect(() => {
    console.log(command);
    setCanSend(command && command === '1' && value && targets.length !== 0);
  }, [command, value, targets]);

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.replace('LoginScreen');
      });
  }

  const isSelected = (item) => {
    console.log(targets);
    return targets.some(t => t.id === item.id);
  }

  const select = (item) => {
    if (targets.some(t => t.id === item.id)) {
      var newTargets = targets.filter(t => t.id !== item.id);
    } else {
      var newTargets = [...targets];
      newTargets.push(item);
    }
    setTargets(newTargets);
  }

  const commandList = [
    { label: 'Temperature correction', value: '1' },
  ];

  const sendCommand = async () => {
    if (!canSend) {
      return;
    }
    var result = await ModbusService.writeTemperatureCorrection(targets[0].ip, parseInt(value));
    console.log(result);
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Commands" subtitle={user ? user.email : ""}/>
        <Appbar.Action icon="exit-to-app" onPress={logout} />
      </Appbar.Header>
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
          {config.map((item) => {
            return(<Chip key={item.id} selected={isSelected(item)} onPress={() => select(item)}>{item.ip}</Chip>);
          })}
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
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});