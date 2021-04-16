import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const getInitialOrientation = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  return windowWidth < windowHeight;
}

export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(getInitialOrientation());

  useEffect(() => {
    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      if (width < height) {
        setIsPortrait(true)
      } else {
        setIsPortrait(false)
      }
    });
    return Dimensions.removeEventListener('change');
  }, []);
  
  return isPortrait;
}