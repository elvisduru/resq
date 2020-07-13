import React from 'react';
import {StyleSheet, View, TouchableWithoutFeedback} from 'react-native';
import {Button, Input, Text, Icon} from '@ui-kitten/components';
import {ImageOverlay} from './extra/image-overlay.component';
import {FacebookIcon, GoogleIcon, PersonIcon, TwitterIcon} from './extra/icons';
import {KeyboardAvoidingView} from './extra/3rd-party';
import auth from '@react-native-firebase/auth';
import IntlPhoneInput from 'react-native-intl-phone-input';

export default ({navigation}) => {
  const [confirm, setConfirm] = React.useState(null);
  const [code, setCode] = React.useState('');

  const [phone, setPhone] = React.useState();
  const [error, setError] = React.useState();
  const onSignInButtonPress = async () => {
    if (phone) {
      console.log(phone);
      const confirmation = auth().signInWithPhoneNumber(
        `${phone.dialCode}${phone.unmaskedPhoneNumber}`,
      );
      setConfirm(confirmation);
    }
  };

  const confirmCode = async () => {
    try {
      console.log(code);
      await confirm.conform(code);
    } catch (error) {
      alert('Invalid code.');
    }
  };

  return (
    <KeyboardAvoidingView>
      <ImageOverlay
        style={styles.container}
        source={require('./assets/image-background.jpg')}>
        <View style={styles.headerContainer}>
          <Text category="h1" status="control">
            Hello
          </Text>
          <Text style={styles.signInLabel} category="s1" status="control">
            Sign in to your account
          </Text>
        </View>
        <View style={styles.formContainer}>
          {confirm ? (
            <>
              <Input
                status="control"
                placeholder="Enter Confirmation Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              <Button
                style={styles.signInButton}
                size="giant"
                onPress={() => confirmCode()}>
                CONFIRM CODE
              </Button>
            </>
          ) : (
            <>
              <IntlPhoneInput
                defaultCountry="NG"
                lang="EN"
                onChangeText={setPhone}
              />
              <Button
                style={styles.signInButton}
                size="giant"
                onPress={onSignInButtonPress}>
                SIGN IN
              </Button>
            </>
          )}
          <View style={{alignItems: 'center'}}>
            <Text status="danger">{error}</Text>
          </View>
        </View>
        {/* <View style={styles.socialAuthContainer}>
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
        </Button> */}
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 16,
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
});
