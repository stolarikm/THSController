import React, { useEffect } from 'react';
import { StatusBar, View, StyleSheet, Button } from 'react-native';
import NavigationBar from 'react-native-navbar-color'
import { DefaultTheme, Provider as PaperProvider, Appbar } from 'react-native-paper';

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

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="Login" />
      </Appbar.Header>

      <View style={styles.container}>
        <View style={{ margin: 10, flex: 1, width: 200 }}>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Button
              title="Log in"
              style={{ margin: 5 }}
              mode='contained'
              onPress={() => {
                navigation.replace('BottomDrawerNavigator');
              }}
            >Log in</Button>
          </View>
        </View>
      </View>
    
    </PaperProvider>
  );
}