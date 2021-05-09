import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

/**
 * Gets initial orientation
 */
const getInitialOrientation = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  return windowWidth < windowHeight;
};

/**
 * Hook returning a flag indicating if the screen is oriented portrait or not
 * Inspired by: https://stackoverflow.com/questions/47683591/react-native-different-styles-applied-on-orientation-change
 */
export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(getInitialOrientation());

  useEffect(() => {
    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      if (width < height) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    });
    return Dimensions.removeEventListener('change');
  }, []);

  return isPortrait;
}
