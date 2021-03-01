import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet, Button, Text } from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar, TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default function LoginScreen({navigation}) {
  useEffect(() => {
    StatusBar.setBackgroundColor('#005cb2');
    NavigationBar.setColor('#005cb2');
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");

  const parseError = (text) => {
    var from = text.lastIndexOf('[') + 1;
    var to = text.lastIndexOf(']');
    return text.substring(from, to);
  }

  const register = (login, password) => {
    auth()
      .createUserWithEmailAndPassword(login, password)
      .then(() => {
        navigation.replace('BottomDrawerNavigator');
      })
      .catch(error => {
        setError(parseError(error.message));
    });
  }

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Login" />
      </Appbar.Header>

      <View style={styles.container}>
        <View style={{ flex: 1, marginLeft: 50, marginRight: 50 }}>
          <TextInput
            style={{marginBottom: 20}}
            label='Email'
            value={email}
            onChangeText={text => setEmail(text)}
          />
          <TextInput
            style={{marginBottom: 20}}
            secureTextEntry={true}
            label='Password'
            value={password}
            onChangeText={text => setPassword(text)}
          />
          {registering && 
            <TextInput
              style={{marginBottom: 20}}
              secureTextEntry={true}
              label='Repeat password'
              value={repeatPassword}
              onChangeText={text => setRepeatPassword(text)}
            />
          }
          {error !== "" && <View style={{ alignItems: "center" }}>
            <Text style={{color: theme.colors.error, marginBottom: 20}}>
              {error}
            </Text>
          </View>}
          <View style={{ alignItems: "center" }}>
            <Text style={{color: '#1976d2', marginBottom: 20}}
              onPress={() => setRegistering(!registering)}>
              {registering ? "Already have an account" : "Create new account"}
            </Text>
          </View>
          {registering && 
            <View style={{marginLeft: 60, marginRight: 60}}>
              <Button
                title="Register"
                style={{ margin: 5 }}
                onPress={() => register(email, password)}
              >Log in</Button>
            </View>
          }
          {!registering && 
            <View style={{marginLeft: 60, marginRight: 60}}>
              <Button 
                title="Log in"
                style={{ margin: 5 }}
                onPress={() => {
                  navigation.replace('BottomDrawerNavigator');
                }}
              >Log in</Button>
            </View>
          }
        </View>
      </View>
    
    </PaperProvider>
  );
}