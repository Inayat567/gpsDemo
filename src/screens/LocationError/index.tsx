import {Text} from 'react-native';
import React from 'react';
import {useLocationErrorStyles} from './LocationError.styles';
import {keywords} from '../../utils/keywords';

const LocationError = () => {
  const styles = useLocationErrorStyles();

  return (
    <>
      <Text style={styles.title}>{keywords.locationAccess}</Text>
      <Text style={styles.desc}>
        {keywords.needLocationPermissionAndGpsEnabled}
      </Text>
    </>
  );
};

export default LocationError;
