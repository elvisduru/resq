import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  Text,
  Icon,
} from '@ui-kitten/components';
import {MenuIcon} from '../../../components/menu-icon';
import {SafeAreaLayoutComponent} from '../../../components/safe-area-layout.component';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export const HomeScreen = ({navigation}) => {
  const renderDrawerAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={navigation.toggleDrawer} />
  );

  return (
    <SafeAreaLayoutComponent style={styles.container} insets="top">
      <TopNavigation
        alignment="center"
        title="I'm Fine"
        accessoryLeft={renderDrawerAction}
      />
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
