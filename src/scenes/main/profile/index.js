import React, {useState} from 'react';
import {StyleSheet, View, TouchableWithoutFeedback} from 'react-native';
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  Text,
  Input,
  Icon,
  Button,
} from '@ui-kitten/components';
import {MenuIcon} from '../../../components/menu-icon';
import {SafeAreaLayoutComponent} from '../../../components/safe-area-layout.component';
import {PersonIcon, EmailIcon} from './extra/icons';
import auth from '@react-native-firebase/auth';

export const ProfileScreen = ({navigation}) => {
  const renderDrawerAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={navigation.toggleDrawer} />
  );

  const [username, setUserName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confPassword, setConfPassword] = useState();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };

  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaLayoutComponent style={styles.container} insets="top">
      <TopNavigation
        title="My Profile"
        alignment="center"
        accessoryLeft={renderDrawerAction}
      />
      <Layout level="2" style={styles.container}>
        <View style={styles.formContainer}>
          <Input
            status="control"
            autoCapitalize="none"
            placeholder="User Name"
            accessoryLeft={PersonIcon}
            value={auth().currentUser.displayName}
            onChangeText={setUserName}
          />
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            placeholder="Email"
            accessoryLeft={EmailIcon}
            value={auth().currentUser.email}
            onChangeText={setEmail}
          />
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            placeholder="New Password"
            accessoryLeft={renderIcon}
            value={password}
            onChangeText={setPassword}
          />
          <Input
            style={styles.formInput}
            status="control"
            autoCapitalize="none"
            secureTextEntry={!passwordVisible}
            placeholder="Confirm New Password"
            accessoryLeft={renderIcon}
            value={confPassword}
            onChangeText={setConfPassword}
          />
          <Button style={styles.signUpButton} size="medium">
            Update Profile
          </Button>
        </View>
      </Layout>
    </SafeAreaLayoutComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  formInput: {
    marginTop: 16,
  },
  signUpButton: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});
