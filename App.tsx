import React, {useEffect, useState} from 'react';
import {Home, LocationError} from './src';
import {fns} from './src/utils';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from './src/utils/colors';
import {keywords} from './src/utils/keywords';

const App = () => {
  const [coords, setCoords] = useState<{lat: number; lon: number} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermissionAndFetchLocation();
  }, []);

  const checkPermissionAndFetchLocation = async () => {
    setLoading(true);
    const location = await fns.checkPermissionAndLocation();
    if (location) {
      setCoords(location);
    } else {
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size={'small'} color={colors.primary} />
      ) : coords ? (
        <Home lat={coords.lat} lon={coords.lon} />
      ) : (
        <>
          <LocationError />
          <TouchableOpacity onPress={checkPermissionAndFetchLocation}>
            <Text style={styles.btnText}>{keywords.enableLocation}</Text>
          </TouchableOpacity>
        </>
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
    backgroundColor: colors.background,
  },
  btnText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
