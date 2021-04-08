import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      if (width < height) {
        setIsPortrait(true)
      } else {
        setIsPortrait(false)
      }
    })

  }, []);

  return isPortrait;
}