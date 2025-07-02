import {StyleSheet} from 'react-native';
import {colors} from '../../utils/colors';

export const useHomeStyles = () => {
  return StyleSheet.create({
    heading: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text,
      fontWeight: 'bold',
    },
    text:{
      fontSize: 14,
      color: colors.text,
    }
  });
};
