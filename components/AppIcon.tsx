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
        source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop&crop=center&auto=format&q=80' }}
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