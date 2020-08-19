import React, {useState, useEffect, createContext} from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {HomeNavigator} from './home.navigator';
import {AuthNavigator} from './auth.navigator';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {ChannelProvider} from '../../ChannelContext';
import {navigationRef} from '../../rootnavigation';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export const AppNavigator = () => {
  // Set an initializing state while firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  let [userID, setUserID] = useState();

  // Handle user state changes
  const onAuthStateChanged = (user) => {
    setUser(user);
    console.log('\nSIGNED IN AS', user);
    if (user) {
      let email = user.email;
      console.log('\n\n\nUSER EMAIL', email, '\n\n\n');
      firestore()
        .doc(`users/${email}`)
        .get()
        .then((userData) => {
          console.log('USER', userData);
          userID = userData.data().phone.slice(-4);
          setUserID(userID);
        })
        .catch((error) => console.error(error));
    }

    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      {initializing ? null : !user ? (
        <AuthNavigator />
      ) : (
        <ChannelProvider value={userID}>
          <HomeNavigator />
        </ChannelProvider>
      )}
    </NavigationContainer>
  );
};
