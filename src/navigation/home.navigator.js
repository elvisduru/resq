import React, {useEffect} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Drawer, DrawerItem, IndexPath} from '@ui-kitten/components';
import {HomeScreen} from '../scenes/main/home';
import {ProfileScreen} from '../scenes/main/profile';
import {ContactsScreen} from '../scenes/main/contacts';
import {SettingsScreen} from '../scenes/main/settings';
import auth from '@react-native-firebase/auth';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import database from '@react-native-firebase/database';
import ReactNativeAN from 'react-native-alarm-notification';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';

const {Navigator, Screen} = createDrawerNavigator();

const DrawerContent = ({navigation, state}) => (
  <Drawer
    selectedIndex={new IndexPath(state.index)}
    onSelect={(index) => {
      if (index.row === 3) {
        auth()
          .signOut()
          .then(() => {
            console.log('User signed out!');
            navigation.toggleDrawer();
          })
          .catch((error) => console.log(error));
      } else {
        navigation.navigate(state.routeNames[index.row]);
      }
    }}>
    <DrawerItem title="Dashboard" />
    <DrawerItem title="Profile" />
    <DrawerItem title="Contacts" />
    <DrawerItem title="Logout" />
  </Drawer>
);

const fireDate = ReactNativeAN.parseDate(new Date(Date.now()));

const alarmNotifData = {
  alarm_id: '12345',
  title: 'ResQ App',
  message: 'SOS Mode Enabled',
  channel: 'my_channel_id',
  small_icon: 'ic_launcher',
  color: 'red',
  fire_date: fireDate,
  loop_sound: true,
  sound_name: 'woscream4.mp3',
  use_big_text: true,
};

export const HomeNavigator = ({user}) => {
  const pubnub = new PubNub({
    publishKey: 'pub-c-6599cd97-7ab1-4b04-8a9a-051169b24b2b',
    subscribeKey: 'sub-c-eb105b66-bad2-11ea-8e27-9244a32233bd',
    autoNetworkDetection: true,
    restore: true,
    uuid: user,
  });

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken(); //<---- Add this
      console.log('Authorization status:', authStatus);
    }
  };

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log(fcmToken);
      console.log('Your Firebase Token is:', fcmToken);
    } else {
      console.log('Failed', 'No token received');
    }
  };

  const saveTokenToDatabase = (token) => {
    const tokensRef = database().ref('/tokens').push();
    tokensRef
      .set(token)
      .then(() => {
        console.log('Token stored successfully');
        return database().ref('/tokens').once('value');
      })
      .then((snapshot) =>
        snapshot.forEach((childSnapshot) => {
          console.log(childSnapshot.val());
        }),
      )
      .catch((err) => console.log('Error saving token', err));
  };

  useEffect(() => {
    messaging()
      .subscribeToTopic('resq')
      .then(() => console.log('Subscribed to Topic!'));
    requestUserPermission();

    messaging()
      .getToken()
      .then((token) => {
        return saveTokenToDatabase(token);
      });

    return messaging().onTokenRefresh((token) => {
      saveTokenToDatabase(token);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      database()
        .ref('/users')
        .once('value')
        .then((snapshot) => {
          let status = snapshot.val();
          console.log('Alarm status: ', status);
          if (status.alert === true) {
            ReactNativeAN.scheduleAlarm(alarmNotifData);
          } else {
            ReactNativeAN.stopAlarmSound();
            ReactNativeAN.deleteAlarm(alarmNotifData.alarm_id);
            ReactNativeAN.removeFiredNotification(alarmNotifData.alarm_id);
            ReactNativeAN.removeAllFiredNotifications();
          }
        });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <PubNubProvider client={pubnub}>
      <Navigator drawerContent={(props) => <DrawerContent {...props} />}>
        <Screen name="home" component={HomeScreen} />
        <Screen name="profile" component={ProfileScreen} />
        <Screen name="contacts" component={ContactsScreen} />
      </Navigator>
    </PubNubProvider>
  );
};
