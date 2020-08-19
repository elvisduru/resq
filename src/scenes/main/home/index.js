import React, {useState, useEffect, useRef, useContext} from 'react';
import {StyleSheet, View, Dimensions, ToastAndroid, Alert} from 'react-native';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  Icon,
  Button,
  Text,
  Modal,
  Card,
  ButtonGroup,
  Tooltip,
  Input,
} from '@ui-kitten/components';
import {MenuIcon} from '../../../components/menu-icon';
import {SafeAreaLayoutComponent} from '../../../components/safe-area-layout.component';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
// import {usePubNub} from 'pubnub-react';
import auth from '@react-native-firebase/auth';
import ReactNativeAN from 'react-native-alarm-notification';
import Communications from 'react-native-communications';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import TokenContext from '../../../../TokenContext';
import ChannelContext from '../../../../ChannelContext';
import axios from 'axios';

export const HomeScreen = ({navigation}) => {
  // const pubnub = usePubNub();
  const [location, setLocation] = useState();
  const [latitude, setLatitude] = useState();
  const [status, setStatus] = useState('primary');
  const [visible, setVisible] = useState(false);
  const [senderVisible, setSenderVisible] = useState(false);
  const [toolTip, setToolTip] = useState(false);
  const [startFollow, setStartFollow] = useState(false);
  const [sender, setSender] = useState();
  const channelID = useContext(ChannelContext);
  const [tokens, setTokens] = useState([]);
  let watchId;

  const token = useContext(TokenContext);

  const renderToggleButton = () => (
    <Button onPress={() => setToolTip(true)} appearance="ghost">
      Need help ?
    </Button>
  );

  const fireDate = ReactNativeAN.parseDate(new Date(Date.now()));

  const alarmNotifData = {
    alarm_id: '12345',
    title: 'ResQ App',
    message: 'SOS Mode Enabled',
    channel: 'my_channel_id',
    small_icon: 'ic_launcher',
    color: 'red',
    fire_date: fireDate,
    loop_sound: true,
    sound_name: 'woscream4.mp3',
    use_big_text: true,

    // You can add any additional data that is important for the notification
    // It will be added to the PendingIntent along with the rest of the bundle.
    // e.g.
    // data: {foo: 'bar'},
  };

  const loadTokens = async () => {
    let channels = [];
    await database()
      .ref(`channels/${channelID}/friends`)
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          channels.push(childSnapshot.val().channelID);
        });
      });
    const list = await Promise.all(
      channels.map(async (id) => {
        const snapshot = await database().ref(`/users/${id}`).once('value');

        let value = snapshot.val();
        return value.token;
      }),
    );

    if (tokens.length < list.length) {
      console.log('Tokens', list);
      setTokens(list);
    }
  };

  useEffect(() => {
    let currentUser = auth().currentUser;
    database().ref(`users/${channelID}`).update({
      status,
      token,
      username: currentUser.displayName,
      email: currentUser.email,
    });
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log(
            'This feature is not available (on this device / in this context)',
          );
          break;
        case RESULTS.DENIED:
          console.log(
            'The permission has not been requested / is denied but requestable',
          );
          break;
        case RESULTS.GRANTED:
          console.log('The permission is granted');
          watchId = Geolocation.watchPosition(
            (position) => {
              const {latitude, longitude} = position.coords;
              setLocation({latitude, longitude});
              setLatitude(latitude);
              // pubnub.objects.setUUIDMetadata({
              //   data: {
              //     name: currentUser.displayName,
              //     email: currentUser.email,
              //     custom: {
              //       status: 'primary',
              //       latitude,
              //       longitude,
              //     },
              //   },
              // });
              console.log('Channel Id is', channelID);
              database().ref(`users/${channelID}`).update({
                latitude,
                longitude,
              });
              loadTokens();
            },
            (error) => console.error(error),
            {
              enableHighAccuracy: true,
              distanceFilter: 0,
              interval: 5000,
              fastestInterval: 2000,
            },
          );
          break;
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore');
          break;
      }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });

    messaging()
      .subscribeToTopic('resq')
      .then(() => console.log('Subscribed to Topic!'));

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [channelID]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log(remoteMessage);
      if (remoteMessage.notification.body) {
        Alert.alert(
          'A new ResQ Message arrived',
          JSON.stringify(remoteMessage.notification.body),
        );
      }
    });

    return unsubscribe;
  }, []);

  const prevLatitude = usePrevious(latitude);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  // const currentUser = auth().currentUser;

  const mounted = useRef();
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else {
      // do componentDidUpate logic
      if (latitude !== prevLatitude && startFollow) {
        // pubnub.publish({
        //   message: {location, from: currentUser.displayName},
        //   channel: channelID,
        // });
        // pubnub.objects.setUUIDMetadata({
        //   data: {
        //     name: currentUser.displayName,
        //     email: currentUser.email,
        //     custom: {
        //       status: 'primary',
        //       latitude: location.latitude,
        //       longitude: location.longitude,
        //     },
        //   },
        // });
        database().ref(`users/${channelID}`).update({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    }
  });

  const renderDrawerAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={navigation.toggleDrawer} />
  );

  const loadingIconRef = useRef();

  const [mapMargin, setMapMargin] = useState(1);
  const {width, height} = Dimensions.get('window');
  const ASPECT_RATIO = width / height;

  return (
    <SafeAreaLayoutComponent style={styles.container} insets="top">
      <TopNavigation
        alignment="center"
        title={
          status === 'danger'
            ? 'Help Me!'
            : status === 'warning'
            ? 'Follow Me'
            : "I'm Safe"
        }
        accessoryLeft={renderDrawerAction}
      />
      <Layout level="2" style={styles.container}>
        {location ? (
          <MapView
            style={{flex: 1, marginBottom: mapMargin}}
            onMapReady={() => setMapMargin(0)}
            showsUserLocation
            followUserLocation
            loadingEnabled
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0922 * ASPECT_RATIO,
            }}>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
            />
          </MapView>
        ) : (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Icon
              ref={loadingIconRef}
              animationConfig={{cycles: Infinity}}
              animation="pulse"
              name="pin-outline"
            />
          </View>
        )}
      </Layout>
      <Layout level="1" style={styles.footer}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <Button
            style={styles.button}
            appearance="outline"
            status="success"
            onPress={() => {
              setStatus('primary');
              alert(`Status set to 'Safe'`);

              database().ref(`users/${channelID}`).update({
                status: 'primary',
              });

              const data = {
                registration_ids: tokens,
                collapse_key: 'type_a',
                data: {
                  body: `${auth().currentUser.displayName} is safe`,
                  title: 'ResQ Status!',
                },
              };

              console.log('sending request');

              axios
                .post('https://fcm.googleapis.com/fcm/send', data, {
                  headers: {
                    Authorization:
                      'key=AAAA6VfOmuU:APA91bEEGFRkV4gGRUAxKBh9LTqudcXnC2_K49vTGpMNMxJohbFeBImS9hIttTkp7TT4gFN-vMn-948MHncWYX3sJb14lSkXipWZWmSRWdklRP0FoyLSBD-pzmA0_FXmU4sVsYMdYUsD',
                    'Content-Type': 'application/json',
                  },
                })
                .then((res) => {
                  console.log(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }}>
            I'm fine
          </Button>
          <Button
            style={styles.button}
            status="warning"
            appearance="outline"
            onPress={() => {
              setStatus('warning');
              console.log(status);
              setStartFollow(true);
              alert(`Status set to 'Follow me'`);

              database().ref(`users/${channelID}`).update({
                status: 'warning',
              });

              const data = {
                registration_ids: tokens,
                collapse_key: 'type_a',
                data: {
                  body: `${auth().currentUser.displayName} wants you to follow`,
                  title: 'ResQ Status!',
                },
              };

              axios
                .post('https://fcm.googleapis.com/fcm/send', data, {
                  headers: {
                    Authorization:
                      'key=AAAA6VfOmuU:APA91bEEGFRkV4gGRUAxKBh9LTqudcXnC2_K49vTGpMNMxJohbFeBImS9hIttTkp7TT4gFN-vMn-948MHncWYX3sJb14lSkXipWZWmSRWdklRP0FoyLSBD-pzmA0_FXmU4sVsYMdYUsD',
                    'Content-Type': 'application/json',
                  },
                })
                .then((res) => {
                  console.log(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }}>
            Follow me
          </Button>
          <Button
            style={styles.button}
            status="danger"
            appearance="outline"
            onPress={() => {
              setStatus('danger');
              ReactNativeAN.scheduleAlarm(alarmNotifData);
              setVisible(true);

              database().ref(`users/${channelID}`).update({
                status: 'danger',
              });

              const data = {
                registration_ids: tokens,
                collapse_key: 'type_a',
                data: {
                  body: `${auth().currentUser.displayName} is in danger!`,
                  title: 'ResQ Status!',
                },
              };

              axios
                .post('https://fcm.googleapis.com/fcm/send', data, {
                  headers: {
                    Authorization:
                      'key=AAAA6VfOmuU:APA91bEEGFRkV4gGRUAxKBh9LTqudcXnC2_K49vTGpMNMxJohbFeBImS9hIttTkp7TT4gFN-vMn-948MHncWYX3sJb14lSkXipWZWmSRWdklRP0FoyLSBD-pzmA0_FXmU4sVsYMdYUsD',
                    'Content-Type': 'application/json',
                  },
                })
                .then((res) => {
                  console.log(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }}>
            Help me!
          </Button>
        </View>
        <Tooltip
          anchor={renderToggleButton}
          placement="top"
          visible={toolTip}
          onBackdropPress={() => setToolTip(false)}>
          Click on *Follow me* to allow friends track your location. Click on
          *Help me!* to enter SOS Mode.
        </Tooltip>
        <Modal visible={visible} backdropStyle={styles.backdrop}>
          <Card status="danger" disabled={true}>
            <View style={{marginBottom: 15, alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 20,
                }}>
                🛑 SOS Mode Enabled 🛑
              </Text>
            </View>
            <ButtonGroup status="danger" appearance="outline">
              <Button
                onPress={() => {
                  ReactNativeAN.stopAlarmSound();
                  ReactNativeAN.deleteAlarm(alarmNotifData.alarm_id);
                  ReactNativeAN.removeFiredNotification(
                    alarmNotifData.alarm_id,
                  );
                  ReactNativeAN.removeAllFiredNotifications();
                  setStatus('primary');

                  database().ref(`users/${channelID}`).update({
                    status: 'primary',
                  });
                  setVisible(false);

                  const data = {
                    registration_ids: tokens,
                    collapse_key: 'type_a',
                    data: {
                      body: `${auth().currentUser.displayName} is safe now`,
                      title: 'ResQ Status!',
                    },
                  };

                  axios
                    .post('https://fcm.googleapis.com/fcm/send', data, {
                      headers: {
                        Authorization:
                          'key=AAAA6VfOmuU:APA91bEEGFRkV4gGRUAxKBh9LTqudcXnC2_K49vTGpMNMxJohbFeBImS9hIttTkp7TT4gFN-vMn-948MHncWYX3sJb14lSkXipWZWmSRWdklRP0FoyLSBD-pzmA0_FXmU4sVsYMdYUsD',
                        'Content-Type': 'application/json',
                      },
                    })
                    .then((res) => {
                      console.log(res.data);
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                }}>
                DISABLE
              </Button>
              <Button
                onPress={() => {
                  Communications.phonecall('911', true);
                  setVisible(false);
                }}>
                CALL 911
              </Button>
              <Button
                onPress={() => {
                  if (sender) {
                    Communications.text(
                      sender,
                      `Please Help Me!. These are my location coordinates: ${location.longitude}, ${location.latitude}`,
                    );
                    setVisible(false);
                  } else {
                    setSenderVisible(true);
                  }
                }}>
                SEND SMS
              </Button>
            </ButtonGroup>
          </Card>
        </Modal>
        <Modal visible={senderVisible}>
          <Card disabled={true}>
            <Input
              style={styles.formInput}
              status="control"
              autoCapitalize="none"
              placeholder="Enter Emergency Contact"
              value={sender}
              onChangeText={setSender}
            />
            <Button
              appearance="outline"
              onPress={() => {
                Communications.text(
                  sender,
                  `Please Help Me!. These are my location coordinates: ${location.longitude}, ${location.latitude}`,
                );
                setSenderVisible(false);
              }}>
              Submit
            </Button>
          </Card>
        </Modal>
      </Layout>
    </SafeAreaLayoutComponent>
  );
};

const follow = '#FFAA00';
const danger = '#FF3D71';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 130,
  },
  bgfollow: {
    backgroundColor: follow,
  },
  bgdanger: {
    backgroundColor: danger,
  },
  button: {
    margin: 2,
  },
  modal: {
    minHeight: '100%',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  formInput: {
    marginBottom: 15,
  },
});
