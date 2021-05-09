import React from 'react';
import { Text, View } from 'react-native';

const NoDataComponent = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>No devices available</Text>
    </View>
  );
};

export default NoDataComponent;
