import React, { useContext, useEffect, useState } from 'react';
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
  const { setLoading } = useContext(LoadingContext);

  const parseError = (text) => {
    var from = text.indexOf(']') + 1;
    return text.substring(from).trim();
  }

  const isValid = () => {
    if (!email) {
      setError("Fill your email");
      return false;
    }
    if (!password) {
      setError("Fill your password");
      return false;
    }
    if (registering && !repeatPassword) {
      setError("Fill your repeated password");
      return false;
    }
    if (registering && repeatPassword !== password) {
      setError("Repeated password does not match password");
      return false;
    }
    return true;
  }

  const register = (login, password) => {
    if (!isValid()) {
      return;
    }
    auth()
      .createUserWithEmailAndPassword(login, password)
      .then(() => {
        navigation.replace('BottomDrawerNavigator');
      })
      .catch(error => {
        setError(parseError(error.message));
    });
  }

  const login = (login, password) => {
    if (!isValid()) {
      return;
    }
    setLoading(true);
    auth()
      .signInWithEmailAndPassword(login, password)
      .then(() => {
        navigation.replace('BottomDrawerNavigator');
        setLoading(false);
        setError("");
      })
      .catch(error => {
        setError(parseError(error.message));
        setLoading(false);
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
              onPress={() => {
                setRegistering(!registering);
                setError("");
              }}>
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
                onPress={() => login(email, password)}
              >Log in</Button>
            </View>
          }
        </View>
      </View>
    
    </PaperProvider>
  );
}