import 'react-native-gesture-handler';
import React from 'react';
import {ApplicationProvider, Icon, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import {AppNavigator} from './src/navigation/app.navigator';
import PushNotificationsManager from './PushNotificationsManager';

/**
 * Use any valid `name` property from eva icons (e.g `github`, or `heart-outline`)
 * https://akveo.github.io/eva-icons
 */

export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.dark}>
      <PushNotificationsManager>
        <AppNavigator />
      </PushNotificationsManager>
    </ApplicationProvider>
  </>
);
