import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{lat: number; lon: number} | null>(null);

  const locationPerm =
    Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

  const checkAndFetchLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCoords({lat: latitude, lon: longitude});
        setLoading(false);
        Alert.alert('Location', `Lat: ${latitude}\nLon: ${longitude}`);
      },
      async error => {
        console.log('Location fetch error:', error.message);
        handleGpsDisabled();
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 100,
      },
    );
  };

  const handleGpsDisabled = () => {
    if (Platform.OS === 'android') {
      promptEnableGPS();
    } else {
      Alert.alert(
        'GPS Disabled',
        'Please enable location services in Settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    }
  };

  const promptEnableGPS = async () => {
    try {
      const result = await promptForEnableLocationIfNeeded();
      console.warn(result);
      if (result === 'enabled' || result === 'already-enabled') {
        checkAndFetchLocation();
      }
    } catch (err) {
      console.warn('User declined to enable GPS');
    }
  };

  const handleNext = async () => {
    setLoading(true);

    try {
      const fineStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      const coarseStatus = await check(
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      );

      // CASE 1: Permission Blocked
      if (fineStatus === RESULTS.BLOCKED && coarseStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Blocked',
          'Location permission is blocked. Please enable it from settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        setLoading(false);
        return;
      }

      // CASE 2: Permission Denied
      if (fineStatus === RESULTS.DENIED && coarseStatus === RESULTS.DENIED) {
        Alert.alert(
          'Permission Required',
          'Location permission is not granted. Please allow location access.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        setLoading(false);
        return;
      }

       // CASE 3: Approximate Location Only
    if (
      coarseStatus === RESULTS.GRANTED &&
      fineStatus !== RESULTS.GRANTED
    ) {
      Alert.alert(
        'Precise Location Off',
        'You have allowed only approximate location. Please enable precise location for better accuracy.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => openSettings()},
        ],
      );
      setLoading(false);
      return;
    }

      // CASE 4: All good
      if (fineStatus === RESULTS.GRANTED || coarseStatus === RESULTS.GRANTED) {
        checkAndFetchLocation();
      }
    } catch (err) {
      console.error('handleNext error:', err);
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    await request(locationPerm);
  };

  const checkPermission = async () => {
    const status = await check(locationPerm);
    if (status !== RESULTS.GRANTED) {
      requestPermission();
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Access</Text>
      <Text style={styles.desc}>
        We need your permission and GPS enabled to get your location.
      </Text>
      <TouchableOpacity
        style={[styles.button, loading && {opacity: 0.6}]}
        onPress={handleNext}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Next</Text>
        )}
      </TouchableOpacity>
      {coords && (
        <Text style={styles.coords}>
          Latitude: {coords.lat}
          {`\n`}Longitude: {coords.lon}
        </Text>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {fontSize: 22, marginBottom: 10, fontWeight: 'bold'},
  desc: {fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#444'},
  coords: {marginTop: 20, fontSize: 16},
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: 120,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {color: '#fff', fontWeight: 'bold'},
});
