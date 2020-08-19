import React, {useEffect} from 'react';
import {StyleSheet, View, TouchableWithoutFeedback, Image} from 'react-native';
import {Button, Input, Text, Icon} from '@ui-kitten/components';
import {ImageOverlay} from './extra/image-overlay.component';
import {FacebookIcon, GoogleIcon, PersonIcon, TwitterIcon} from './extra/icons';
import {KeyboardAvoidingView} from './extra/3rd-party';
import auth from '@react-native-firebase/auth';

export default ({navigation}) => {
  const [email, setEmail] = React.useState();
  const [error, setError] = React.useState();
  const [password, setPassword] = React.useState();
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const onSignInButtonPress = () => {
    if (email && password) {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          console.log('User account created & signed in!');
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');
            setError('That email address is already in use!');
          }
          if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
            setError('That email address is invalid!');
          }
          if (error.code === 'auth/user-not-found') {
            console.log('There is no user record found');
            setError('There is no user record found');
          }
          console.log(error);
        });
    }
  };
  const onSignUpButtonPress = () => {
    navigation && navigation.navigate('signup');
  };
  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };
  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  return (
    <KeyboardAvoidingView>
      {/* <ImageOverlay
        style={styles.container}
        source={require('./assets/image-background.jpg')}> */}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {/* <Text category="h1" status="control">
            Hello
          </Text> */}
          <View>
            <Image
              source={require('./assets/resq_logo.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.signInLabel} category="s1" status="control">
            Sign in to your account
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            status="control"
            placeholder="Email"
            accessoryLeft={PersonIcon}
            value={email}
            onChangeText={setEmail}
          />
          <Input
            style={styles.passwordInput}
            status="control"
            placeholder="Password"
            accessoryLeft={renderIcon}
            value={password}
            secureTextEntry={!passwordVisible}
            onChangeText={setPassword}
          />
          <View style={{alignItems: 'center'}}>
            <Text status="danger">{error}</Text>
          </View>
        </View>
        <Button
          style={styles.signInButton}
          size="giant"
          onPress={onSignInButtonPress}>
          SIGN IN
        </Button>
        <View style={styles.socialAuthContainer}>
          <Text style={styles.socialAuthHintText} status="control">
            Or Sign In using Social Media
          </Text>
          <View style={styles.socialAuthButtonsContainer}>
            <Button
              appearance="ghost"
              status="control"
              size="giant"
              accessoryLeft={GoogleIcon}
            />
            <Button
              appearance="ghost"
              status="control"
              size="giant"
              accessoryLeft={FacebookIcon}
            />
            <Button
              appearance="ghost"
              status="control"
              size="giant"
              accessoryLeft={TwitterIcon}
            />
          </View>
        </View>
        <Button
          style={styles.signUpButton}
          appearance="ghost"
          status="control"
          onPress={onSignUpButtonPress}>
          Don't have an account? Sign Up
        </Button>
      </View>
      {/* </ImageOverlay> */}
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222B45',
  },
  headerContainer: {
    minHeight: 216,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  signInLabel: {
    marginTop: 16,
  },
  passwordInput: {
    marginTop: 16,
  },
  signInButton: {
    marginHorizontal: 16,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forgotPasswordButton: {
    paddingHorizontal: 0,
  },
  signUpButton: {
    marginVertical: 12,
  },
  socialAuthContainer: {
    marginTop: 32,
  },
  socialAuthButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0,
  },
  socialAuthHintText: {
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0,
  },
  logo: {
    resizeMode: 'contain',
    height: 50,
    width: 110,
  },
});
