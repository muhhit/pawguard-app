import React, { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
  uri: string;
  width?: number;
  height?: number;
  intensity?: number; // tilt intensity
};

export default function ParallaxCard({ uri, width = 320, height = 200, intensity = 12 }: Props) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const pan = useMemo(() => Gesture.Pan()
    .onChange((e) => {
      const nx = Math.max(-intensity, Math.min(intensity, -e.translationY / 10));
      const ny = Math.max(-intensity, Math.min(intensity, e.translationX / 10));
      rotateX.value = nx;
      rotateY.value = ny;
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, { damping: 10 });
      rotateY.value = withSpring(0, { damping: 10 });
    }), [intensity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: 1.0 }
    ],
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, { width, height }, containerStyle]}> 
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111827'
  },
  image: {
    width: '100%',
    height: '100%'
  }
});

