import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Drawer, DrawerItem, IndexPath} from '@ui-kitten/components';
import {HomeScreen} from '../scenes/main/home';
import {ProfileScreen} from '../scenes/main/profile';
import {ContactsScreen} from '../scenes/main/contacts';
import {SettingsScreen} from '../scenes/main/settings';

const {Navigator, Screen} = createDrawerNavigator();

const DrawerContent = ({navigation, state}) => (
  <Drawer
    selectedIndex={new IndexPath(state.index)}
    onSelect={(index) => navigation.navigate(state.routeNames[index.row])}>
    <DrawerItem title="Home" />
    <DrawerItem title="Profile" />
    <DrawerItem title="Contacts" />
    <DrawerItem title="Settings" />
  </Drawer>
);

export const HomeNavigator = () => (
  <Navigator drawerContent={(props) => <DrawerContent {...props} />}>
    <Screen name="home" component={HomeScreen} />
    <Screen name="profile" component={ProfileScreen} />
    <Screen name="contacts" component={ContactsScreen} />
    <Screen name="settings" component={SettingsScreen} />
  </Navigator>
);
