import React, { memo } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: any;
}

const GlassContainer = memo<GlassContainerProps>(({ 
  children, 
  intensity = 15, 
  tint = 'light',
  style 
}) => {
  // Web fallback - expo-blur has limited web support
  if (Platform.OS === 'web') {
    return (
      <View style={[
        styles.webFallback,
        tint === 'dark' && styles.webFallbackDark,
        style
      ]}>
        {children}
      </View>
    );
  }
  
  // Native platforms with BlurView
  return (
    <BlurView 
      intensity={intensity} 
      tint={tint}
      style={[styles.container, style]}
    >
      {children}
    </BlurView>
  );
});

GlassContainer.displayName = 'GlassContainer';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  webFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  webFallbackDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
});

export default GlassContainer;