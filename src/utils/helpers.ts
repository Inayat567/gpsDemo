import Geolocation from '@react-native-community/geolocation';
import {Alert, Linking, Platform} from 'react-native';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import {keywords, OS} from './keywords';

const locationPerm =
  Platform.OS === OS.ANDROID
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

const requestPermission = async () => {
  await request(locationPerm);
};

export const checkPermission = async () => {
  const status = await check(locationPerm);
  if (status !== RESULTS.GRANTED) {
    requestPermission();
  } else {
    checkPermissionAndLocation();
  }
};

export const checkPermissionAndLocation = async (): Promise<{
  lat: number;
  lon: number;
} | null> => {
  let fine: PermissionStatus = RESULTS.UNAVAILABLE;
  let coarse: PermissionStatus = RESULTS.UNAVAILABLE;

  if (Platform.OS === OS.ANDROID) {
    fine = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    coarse = await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
  } else {
    fine = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    coarse = fine;
  }

  if (fine === RESULTS.BLOCKED || coarse === RESULTS.BLOCKED) {
    Alert.alert(keywords.permissionBlocked, keywords.allowLocationPermission, [
      {text: keywords.cancel, style: 'cancel'},
      {text: keywords.openSetting, onPress: () => openSettings()},
    ]);
    return null;
  }

  if (fine === RESULTS.DENIED && coarse === RESULTS.DENIED) {
    const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (granted !== RESULTS.GRANTED) {
      Alert.alert(
        keywords.permissionRequired,
        keywords.grantLocationPermission,
        [
          {text: keywords.cancel, style: 'cancel'},
          {text: keywords.openSetting, onPress: () => openSettings()},
        ],
      );
      return null;
    }
  }

  // Handle approximate location only, uncomment it if you want to force user to use precise location
  //   if (coarse === RESULTS.GRANTED && fine !== RESULTS.GRANTED) {
  //     Alert.alert(
  //       'Precise Location Off',
  //       'You allowed only approximate location. Please enable precise location for better accuracy.',
  //       [
  //         {text: 'Cancel', style: 'cancel'},
  //         {text: 'Open Settings', onPress: () => openSettings()},
  //       ],
  //     );
  //     return null;
  //   }

  return await new Promise<{lat: number; lon: number} | null>(resolve =>
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      async error => {
        console.log('Location fetch error:', error.message);

        if (Platform.OS === OS.ANDROID) {
          try {
            const res = await promptForEnableLocationIfNeeded();

            if (res === 'enabled' || res === 'already-enabled') {
              const coords = await new Promise<{
                latitude: number;
                longitude: number;
              }>((res, rej) =>
                Geolocation.getCurrentPosition(
                  position => {
                    res({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                    });
                  },
                  rej,
                  {
                    enableHighAccuracy: false,
                  },
                ),
              );

              resolve({lat: coords.latitude, lon: coords.longitude});
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        } else {
          Alert.alert(keywords.gpsDisabled, keywords.enableGps, [
            {text: keywords.cancel, style: 'cancel'},
            {text: keywords.openSetting, onPress: () => Linking.openSettings()},
          ]);
          resolve(null);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 100,
      },
    ),
  );
};
