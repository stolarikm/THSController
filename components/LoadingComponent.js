import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { BlurView } from "@react-native-community/blur";

const LoadingComponent = () => {

  const [height, setHeight] = useState(0);

  return (
    <View style={styles.overlay} onLayout={(event) => {
      var {height} = event.nativeEvent.layout;
      setHeight(height);
    }}>
      <BlurView style={styles.blur} blurType='dark'>
        <ActivityIndicator style={{transform: [{ scale: 2 }, { translateY: height / 2 }]}}
          size='large'
          color='#1976d2'/>
      </BlurView>
    </View>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      width: '100%',
      height: '100%'
    },
    blur: {
      flex: 1,
      justifyContent: 'center'
    },
  });
  
  export default LoadingComponent;