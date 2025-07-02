import {View, Text} from 'react-native';
import React from 'react';
import {useHomeStyles} from './Home.styles';
import {keywords} from '../../utils/keywords';

const Home = ({lat, lon}: {lat: number; lon: number}) => {
  const styles = useHomeStyles();

  return (
    <View>
      <Text style={styles.heading}>{keywords.home}</Text>
      <Text style={styles.text}>
        {keywords.latitude}: {lat}
      </Text>
      <Text style={styles.text}>
        {keywords.latitude}: {lon}
      </Text>
    </View>
  );
};

export default Home;
