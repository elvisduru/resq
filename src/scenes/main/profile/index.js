import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  Text,
} from '@ui-kitten/components';
import {MenuIcon} from '../../../components/menu-icon';
import {
  SafeAreaLayout,
  SafeAreaLayoutComponent,
} from '../../../components/safe-area-layout.component';
import {useIsDrawerOpen} from '@react-navigation/drawer';

const renderDrawerAction = () => {
  <TopNavigationAction
    icon={<MenuIcon open={() => useIsDrawerOpen()} />}
    onPress={props.navigation.toggleDrawer}
  />;
};

export const ProfileScreen = ({navigation}) => {
  return (
    <SafeAreaLayoutComponent style={styles.container} insets="top">
      <TopNavigation title="I'm Fine" accessoryLeft={renderDrawerAction()} />
      <Layout level="2" style={styles.container}>
        <Text>Hello</Text>
      </Layout>
    </SafeAreaLayoutComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
