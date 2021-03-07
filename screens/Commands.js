import React, { useEffect, useState } from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar, TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import DropDown from '../thirdParty/DropDown';

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

  const [showDropDown, setShowDropDown] = useState(false);
  const [command, setCommand] = useState("");
  const [value, setValue] = useState("");
  const user = auth().currentUser;

  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.replace('LoginScreen');
      });
  }

  const commandList = [
    { label: 'Command1', value: '1' },
    { label: 'Command2', value: '2' },
    { label: 'Command3', value: '3' },
  ];

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Commands" subtitle={user ? user.email : ""}/>
        <Appbar.Action icon="exit-to-app" onPress={logout} />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={{ margin: 10, flex: 1, width: 300 }}>
          <DropDown
            label='Command'
            value={command}
            setValue={setCommand}
            list={commandList}
            visible={showDropDown}
            showDropDown={() => setShowDropDown(true)}
            onDismiss={() => setShowDropDown(false)}
            inputProps={{
              right: <TextInput.Icon name={'menu-down'} />,
            }}
          />
          <TextInput
            label='Value'
            value={value}
            onChangeText={text => setValue(text)}
          />
        </View>
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