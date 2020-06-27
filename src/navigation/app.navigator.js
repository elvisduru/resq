import React, {useState, useEffect} from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {HomeNavigator} from './home.navigator';
import {AuthNavigator} from './auth.navigator';
import auth from '@react-native-firebase/auth';

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

  // Handle user state changes
  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      {initializing ? null : !user ? <AuthNavigator /> : <HomeNavigator />}
    </NavigationContainer>
  );
};
