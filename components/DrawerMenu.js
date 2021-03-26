import React from 'react';
import { DrawerHeader, DrawerItem } from "material-bread";
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import * as NavigationService from '../services/NavigationService';

const DrawerMenu = ({close}) => {
    const user = auth().currentUser;

    const logout = () => {
        auth()
            .signOut()
            .then(() => {
                NavigationService.navigate('LoginScreen');
                close();
        });
    }

    return (
        <View>
            <DrawerHeader title="Options" subtitle={user ? user.email : ""}/>
            <DrawerItem text={'Switch mode'} icon={'swap-vert'} />
            <DrawerItem text={'Logout'} icon={'exit-to-app'} onPress={logout}/>
        </View>
    );
};

  export default DrawerMenu;