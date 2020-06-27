import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../scenes/auth/login';
import SignupScreen from '../scenes/auth/signup';
const Stack = createStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator headerMode="none">
    <Stack.Screen name="login" component={LoginScreen} />
    <Stack.Screen name="signup" component={SignupScreen} />
  </Stack.Navigator>
);
