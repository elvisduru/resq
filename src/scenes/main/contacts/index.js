import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  FlatList,
  TextInput,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
  Icon,
  List,
  ListItem,
  Button,
  ButtonGroup,
  Modal,
  Input,
  Card,
  Text,
} from '@ui-kitten/components';
import {MenuIcon} from '../../../components/menu-icon';
import {SafeAreaLayoutComponent} from '../../../components/safe-area-layout.component';
// import {usePubNub} from 'pubnub-react';
import Communications from 'react-native-communications';
import ListItemNew from '../../../components/ListItem';

import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import Contacts from 'react-native-contacts';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import ChannelContext from '../../../../ChannelContext';

export const ContactsScreen = ({navigation}) => {
  const channelID = useContext(ChannelContext);
  let [contacts, setContacts] = useState([]);
  let currentUser = auth().currentUser;
  const [channels, setChannels] = useState([]);
  // const [channelID, setChannelID] = useState();
  // const pubnub = usePubNub();

  // const loadUserID = async () => {
  //   try {
  //     const user = await firestore()
  //       .collection('users')
  //       .doc(currentUser.email)
  //       .get();

  //     let id = user.data().phone.slice(-4);
  //     setChannelID(id);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   loadUserID();
  // }, []);

  const loadChannels = async () => {
    try {
      // const res = await firestore().doc(`users/${currentUser.email}`).get();
      // setChannels(res.data().channels);
      // return res.data().channels;
      let channels = [];
      await database()
        .ref(`channels/${channelID}/friends`)
        .once('value', (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            channels.push(childSnapshot.val().channelID);
          });
        });
      console.log('CHANNELS---', channels);
      setChannels(channels);
      return channels;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
      }).then(() => {
        loadContacts();
      });
    } else {
      loadContacts();
    }
    // pubnub.addListener({
    //   message: function (message) {
    //     console.log('STATUS: ', message);
    //   },
    // });
    // // Get Status Feed Messages
    // pubnub.subscribe({channelGroups: [`${id}-friends`]});
  }, []);

  const loadContacts = () => {
    Contacts.getAll((err, contacts) => {
      contacts.sort(
        (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
      );
      if (err === 'denied') {
        alert('Permission to access contacts was denied');
        console.warn('Permission to access contacts was denied');
      } else {
        setContacts(contacts);
        console.log('contacts', contacts);
      }
    });
  };

  const search = (text) => {
    const phoneNumberRegex = /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
    if (text === '' || text === null) {
      loadContacts();
    } else if (phoneNumberRegex.test(text)) {
      Contacts.getContactsByPhoneNumber(text, (err, contacts) => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        setContacts(contacts);
        console.log('contacts', contacts);
      });
    } else {
      Contacts.getContactsMatchingString(text, (err, contacts) => {
        contacts.sort(
          (a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase(),
        );
        setContacts(contacts);
        console.log('contacts', contacts);
      });
    }
  };

  const sendInvite = async (contact) => {
    let number = contact.phoneNumbers[0].number;
    let newChannelID = number.slice(-4);

    console.log(number);
    console.log(contact);

    Linking.openURL(
      `whatsapp://send?text=${currentUser.displayName} has invited you to download and install the ResQ app. Visit this link to install: https://firebasestorage.googleapis.com/v0/b/resq-e2d7a.appspot.com/o/ResQ.apk?alt=media&phone=${number}`,
    )
      .then(() => {
        console.log('Whatsapp opened');
      })
      .catch((err) => {
        console.log(err);
        Communications.text(
          number,
          `${currentUser.displayName} has invited you to download and install the ResQ app. Visit this link to install: https://firebasestorage.googleapis.com/v0/b/resq-e2d7a.appspot.com/o/ResQ.apk?alt=media`,
        );
      });

    var newFriend = database().ref(`channels/${channelID}/friends`).push();
    newFriend.set({channelID: newChannelID});

    var addMe = database().ref(`channels/${newChannelID}/friends`).push();
    addMe.set({
      channelID,
    });

    // await firestore()
    //   .doc(`users/${currentUser.email}`)
    //   .update({channels: firestore.FieldValue.arrayUnion(channelID)});

    // loadChannels()
    //   .then((data) => {
    //     console.log('Channels set success', data);
    //     pubnub.channelGroups.addChannels(
    //       {
    //         channels: data,
    //         channelGroup: `${id}-friendlist`,
    //       },
    //       function (status) {
    //         if (status.error) {
    //           console.log('operation failed w/ status: ', status);
    //         } else {
    //           console.log('Channel added to channel group');
    //         }
    //       },
    //     );
    //   })
    //   .catch((error) => console.log(error));

    console.log(`Invitation sent to ${contact.givenName} successfully`);
  };

  const renderDrawerAction = (props) => (
    <TopNavigationAction
      {...props}
      icon={MenuIcon}
      onPress={navigation.toggleDrawer}
    />
  );

  const renderItemIcon = (props) => <Icon {...props} name="person" />;

  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);

  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [mapVisible, setMapVisible] = useState();

  const [mapMargin, setMapMargin] = useState(1);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await loadChannels();
        console.log('Channels loaded successfully', channels);
        const list = await Promise.all(
          channels.map(async (id) => {
            console.log('ID', id);
            const snapshot = await database().ref(`/users/${id}`).once('value');

            let value = snapshot.val();
            // allUsers.push(snapshot.val());
            console.log('VALUE', value);
            return value;
          }),
        );
        setData(list.filter((x) => x));
      } catch (error) {
        console.log(error);
      }
      // setData(allUsers);

      // pubnub.objects
      //   .getAllUUIDMetadata({
      //     include: {
      //       customFields: true,
      //     },
      //   })
      //   .then((data) => {
      //     const allUsers = data.data;
      //     const myContacts = allUsers.filter((x) =>
      //       loadedChannels.some((o) => o === x.id),
      //     );
      //     setData(myContacts);
      //     console.log('MY CONTACT:', myContacts);
      //     // console.log('\n\n\nData:', data.data[0].id);
      //   })
      //   .catch((err) => console.log(err));
    }, 5000);
    return () => clearInterval(interval);
  }, [channels]);

  const renderItem = ({item, index}) => (
    <ListItem
      title={item.username}
      description={item.email}
      accessoryLeft={renderItemIcon}
      accessoryRight={() => {
        const status = item.status;
        return (
          <ButtonGroup
            size="small"
            status={status}
            onPress={() => alert('yeah')}>
            <Button
              status="info"
              accessoryLeft={(props) => (
                <Icon {...props} name="shake-outline" />
              )}
              onPress={() => {
                Communications.phonecall('911', true);
              }}
            />
            <Button
              status={status}
              size="tiny"
              onPress={() => {
                if (item.latitude) {
                  setLatitude(item.latitude);
                  setLongitude(item.longitude);
                  setMapVisible(true);
                } else {
                  alert('User has not set up location');
                }
              }}>
              {status === 'warning'
                ? 'FOLLOW'
                : status === 'danger'
                ? 'HELP ME!'
                : 'SAFE'}
            </Button>
          </ButtonGroup>
        );
      }}
    />
  );

  return (
    <SafeAreaLayoutComponent style={styles.container} insets="top">
      <TopNavigation
        title="My Contacts"
        alignment="center"
        accessoryLeft={renderDrawerAction}
      />
      <List style={styles.container} data={data} renderItem={renderItem} />
      <Button onPress={() => setVisible(true)}>Invite Contact</Button>
      <Modal
        style={styles.map}
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={{fontSize: 20}}>Select Contact</Text>
            <Button onPress={() => setVisible(false)} appearance="ghost">
              <Text style={{color: 'white'}}>Close</Text>
            </Button>
          </View>
          <TextInput
            onChangeText={search}
            placeholder="Search"
            style={styles.searchBar}
          />
          <FlatList
            data={contacts}
            renderItem={(contact) => {
              {
                console.log('contact -> ' + JSON.stringify(contact));
              }
              return (
                <ListItemNew
                  key={contact.item.recordID}
                  item={contact.item}
                  onPress={sendInvite}
                />
              );
            }}
            keyExtractor={(item) => item.recordID}
          />
        </View>
      </Modal>
      <Modal style={styles.map} visible={mapVisible}>
        <MapView
          style={{flex: 1, marginBottom: mapMargin}}
          onMapReady={() => setMapMargin(0)}
          showsUserLocation
          followUserLocation
          loadingEnabled
          region={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Marker
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
          />
        </MapView>
        <Button
          onPress={() => {
            setMapVisible(false);
          }}
          size="large">
          Exit
        </Button>
      </Modal>
    </SafeAreaLayoutComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    minHeight: '100%',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  map: {
    flex: 1,
    minHeight: '100%',
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: '#4591ed',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBar: {
    backgroundColor: '#f0eded',
    paddingHorizontal: 30,
    paddingVertical: Platform.OS === 'android' ? undefined : 15,
  },
});
