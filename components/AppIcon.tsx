import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { glassColors } from '@/constants/colors';

interface AppIconProps {
  size?: number;
  style?: any;
}

export default function AppIcon({ size = 60, style }: AppIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={{ uri: 'https://r2-pub.rork.com/generated-images/938b20d3-63e4-4941-bed8-5484c2a8dc43.png' }}
        style={[styles.icon, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: glassColors.turkish.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    borderRadius: 12,
  },
});

export { AppIcon };