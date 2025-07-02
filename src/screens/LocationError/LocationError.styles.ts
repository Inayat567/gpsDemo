import {StyleSheet} from 'react-native';
import {colors} from '../../utils/colors';

export const useLocationErrorStyles = () => {
  return StyleSheet.create({
    title: {
      fontSize: 22,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    desc: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text,
    },
  });
};
