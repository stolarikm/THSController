import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import LoadingOverlay from '../components/LoadingOverlay';
import { useConfig } from '../hooks/useConfig';

/**
 * Login screen component
 * @param navigation navigation context
 */
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const { config, setConfig } = useConfig();
  const { colors } = useTheme();

  /**
   * Sets the current screen name in config context
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      let newConfig = {
        ...config,
        screenName: 'Login',
      };
      setConfig(newConfig);
    });
    //clear
    return unsubscribe;
  }, [navigation, config]);

  /**
   * Parses error from Firebase technical error message
   * @param text Firebase technical error message
   */
  const parseError = (text) => {
    var from = text.indexOf(']') + 1;
    return text.substring(from).trim();
  };

  /**
   * Validates inputs
   * Return true if validation passed
   */
  const isValid = () => {
    if (!email) {
      setError('Fill your email');
      return false;
    }
    if (!password) {
      setError('Fill your password');
      return false;
    }
    if (registering && !repeatPassword) {
      setError('Fill your repeated password');
      return false;
    }
    if (registering && repeatPassword !== password) {
      setError('Repeated password does not match password');
      return false;
    }
    return true;
  };

  /**
   * Registers new user
   * Navigates to main screens navigator if succesful
   * @param login login email
   * @param password password
   */
  const register = (login, password) => {
    if (!isValid()) {
      return;
    }
    setLoading(true);
    auth()
      .createUserWithEmailAndPassword(login, password)
      .then(() => {
        navigation.replace('BottomDrawerNavigator');
        setLoading(false);
      })
      .catch((error) => {
        setError(parseError(error.message));
        setLoading(false);
      });
  };

  /**
   * Logs in existing user
   * Navigates to main screens navigator if succesful
   * @param login login email
   * @param password password
   */
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
        setError('');
      })
      .catch((error) => {
        setError(parseError(error.message));
        setLoading(false);
      });
  };

  return (
    <>
      <View style={styles.container}>
        <View style={{ flex: 1, marginLeft: 50, marginRight: 50 }}>
          <TextInput
            style={{ marginBottom: 20 }}
            label="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            style={{ marginBottom: 20 }}
            secureTextEntry={true}
            label="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          {registering && (
            <TextInput
              style={{ marginBottom: 20 }}
              secureTextEntry={true}
              label="Repeat password"
              value={repeatPassword}
              onChangeText={(text) => setRepeatPassword(text)}
            />
          )}
          {error !== '' && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.error, marginBottom: 20 }}>
                {error}
              </Text>
            </View>
          )}
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{ color: '#1976d2', marginBottom: 20 }}
              onPress={() => {
                setRegistering(!registering);
                setError('');
              }}
            >
              {registering ? 'Already have an account' : 'Create new account'}
            </Text>
          </View>
          {registering && (
            <View style={{ marginLeft: 60, marginRight: 60 }}>
              <Button
                title="Register"
                style={{ margin: 5 }}
                onPress={() => register(email, password)}
              >
                Log in
              </Button>
            </View>
          )}
          {!registering && (
            <View style={{ marginLeft: 60, marginRight: 60 }}>
              <Button
                title="Log in"
                style={{ margin: 5 }}
                onPress={() => login(email, password)}
              >
                Log in
              </Button>
            </View>
          )}
        </View>
      </View>

      {isLoading && <LoadingOverlay />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
