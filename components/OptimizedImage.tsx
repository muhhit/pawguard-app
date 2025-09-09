import React, { useState, useEffect } from 'react';
import { 
  Image as RNImage, 
  ImageProps as RNImageProps, 
  View, 
  ActivityIndicator, 
  StyleSheet,
  Platform
} from 'react-native';
import { ImageOptimizer, ImageOptimizationOptions, optimizeImage } from '@/utils/imageOptimization';

export interface OptimizedImageProps extends Omit<RNImageProps, 'source'> {
  source: string | { uri: string };
  optimization?: ImageOptimizationOptions | keyof typeof ImageOptimizer.presets;
  placeholder?: boolean;
  lazy?: boolean;
  fallback?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

export function OptimizedImage({
  source,
  optimization = 'card',
  placeholder = true,
  lazy = false,
  fallback,
  onLoadStart,
  onLoadEnd,
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [shouldLoad, setShouldLoad] = useState<boolean>(!lazy);

  const sourceUri = typeof source === 'string' ? source : source.uri;
  const optimizedSource = optimizeImage(sourceUri, optimization);

  useEffect(() => {
    if (lazy && !shouldLoad) {
      // Implement intersection observer for lazy loading on web
      if (Platform.OS === 'web') {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );

        // Note: In a real implementation, you'd need a ref to the component
        // For now, we'll just load immediately
        setShouldLoad(true);
      } else {
        // For React Native, load immediately (can be enhanced with viewport detection)
        setShouldLoad(true);
      }
    }
  }, [lazy, shouldLoad]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  if (!shouldLoad) {
    return (
      <View style={[styles.container, style]}>
        {placeholder && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="small" color="#64748B" />
          </View>
        )}
      </View>
    );
  }

  const imageSource = hasError && fallback 
    ? optimizeImage(fallback, optimization)
    : optimizedSource;

  return (
    <View style={[styles.container, style]}>
      <RNImage
        {...props}
        source={imageSource}
        style={StyleSheet.absoluteFill}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        resizeMode={props.resizeMode || 'cover'}
      />
      
      {isLoading && placeholder && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#64748B" />
        </View>
      )}
    </View>
  );
}

export default OptimizedImage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
  },
});