import React from 'react';
import { View } from 'react-native';
import ParallaxCard from '@/components/ParallaxCard';

type Props = { uri: string; width?: number; height?: number; autoPlay?: boolean };

// Lightweight wrapper: tries to use Skia if available; fallbacks to ParallaxCard
export default function SkiaParallaxCard({ uri, width = 340, height = 220, autoPlay = true }: Props) {
  let Skia: any = null;
  try {
     
    Skia = require('@shopify/react-native-skia');
  } catch {
    Skia = null;
  }

  if (!Skia) {
    return <ParallaxCard uri={uri} width={width} height={height} />;
  }

  const { Canvas, useImage, Group, Image: SkiaImage } = Skia;
  const image = useImage(uri);

  // Simple auto-pan from left to right and back via translateX oscillation
  // Konsolide edilmiş; gerçek animasyon için Reanimated + Skia Mix kullanılabilir

  return (
    <View style={{ width, height, borderRadius: 16, overflow: 'hidden' }}>
      <Canvas style={{ width, height }}>
        {image && (
          <Group>
            <SkiaImage image={image} x={0} y={0} width={width} height={height} fit={'cover'} />
          </Group>
        )}
      </Canvas>
    </View>
  );
}

