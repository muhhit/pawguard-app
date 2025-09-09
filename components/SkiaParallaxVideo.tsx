import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

// Optional Skia auto-pan video-style effect. Falls back to simple ParallaxCard when Skia not available.
export default function SkiaParallaxVideo({ uri, width = 340, height = 220, duration = 4000 }: { uri: string; width?: number; height?: number; duration?: number }) {
  let Skia: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Skia = require('@shopify/react-native-skia');
  } catch {}

  if (!Skia) {
    // Fallback: static container; upstream will show ParallaxCard elsewhere
    return <View style={{ width, height, borderRadius: 16, overflow: 'hidden' }} />;
  }

  const { Canvas, useImage, Group, Image: SkiaImage } = Skia;
  const image = useImage(uri);
  const panX = useSharedValue(0);

  useEffect(() => {
    panX.value = withRepeat(withTiming(20, { duration }), -1, true);
  }, [duration]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: panX.value }] }));

  return (
    <View style={{ width, height, borderRadius: 16, overflow: 'hidden' }}>
      <Canvas style={{ width, height }}>
        {image && (
          <Group transform={style.transform as any}>
            <SkiaImage image={image} x={0} y={0} width={width + 40} height={height} fit={'cover'} />
          </Group>
        )}
      </Canvas>
    </View>
  );
}

