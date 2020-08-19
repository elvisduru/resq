import React, {createContext, useState, useEffect} from 'react';
import {Platform, View} from 'react-native';
import {Notifications} from 'react-native-notifications';
import {TokenProvider} from './TokenContext';

import * as RootNavigation from './rootnavigation';

const PushNotificationManager = ({children}) => {
  const [token, setToken] = useState('');
  useEffect(() => {
    registerDevice();
    registerNotificationEvents();
  }, []);

  const registerDevice = () => {
    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      // TODO: Send the token to my server so it could send back push notifications...
      console.log('Device Token Received', event.deviceToken);
      setToken(event.deviceToken);
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (event) => {
        console.error(event);
      },
    );

    Notifications.registerRemoteNotifications();
  };

  const registerNotificationEvents = () => {
    Notifications.events().registerNotificationReceivedForeground(
      (notification, completion) => {
        console.log('Notification Received - Foreground', notification);
        RootNavigation.navigate('contacts');
        // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
        completion({alert: true, sound: true, badge: false});
      },
    );

    Notifications.events().registerNotificationOpened(
      (notification, completion) => {
        console.log('Notification opened by device user', notification);
        console.log(
          `Notification opened with an action identifier: ${notification.identifier}`,
        );
        RootNavigation.navigate('contacts');
        completion();
      },
    );

    Notifications.events().registerNotificationReceivedBackground(
      (notification, completion) => {
        console.log('Notification Received - Background', notification);

        // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
        completion({alert: true, sound: true, badge: false});
      },
    );

    Notifications.getInitialNotification()
      .then((notification) => {
        console.log('Initial notification was:', notification || 'N/A');
      })
      .catch((err) => console.error('getInitialNotifiation() failed', err));
  };

  return (
    <TokenProvider value={token}>
      <View style={{flex: 1}}>{children}</View>
    </TokenProvider>
  );
};

export default PushNotificationManager;
