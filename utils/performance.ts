import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for search inputs and scroll events
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: any;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for high-frequency events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Run after interactions for better UX
  runAfterInteractions: (callback: () => void): void => {
    InteractionManager.runAfterInteractions(callback);
  },

  // Optimize list rendering
  getItemLayout: (itemHeight: number) => (
    data: any,
    index: number
  ) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),

  // Memory management for large lists
  getWindowSize: () => {
    if (Platform.OS === 'ios') {
      return 10; // iOS handles memory better
    }
    return 5; // Conservative for Android
  },

  // Optimize image loading
  getOptimalImageSize: (containerWidth: number, containerHeight: number) => {
    const pixelRatio = Platform.select({
      ios: 2,
      android: 2,
      web: (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1,
    }) as number;
    
    return {
      width: Math.ceil(containerWidth * pixelRatio),
      height: Math.ceil(containerHeight * pixelRatio),
    };
  },
};

// Custom hooks for performance
export const useDebounce = <T>(
  value: T,
  delay: number
): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRan = useRef<number>(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Memoization helpers
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
};

export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
};

// Performance monitoring
export const performanceMonitor = {
  startTimer: (label: string): (() => void) => {
    const start = Date.now();
    console.log(`⏱️ [${label}] Started`);
    
    return () => {
      const end = Date.now();
      const duration = end - start;
      console.log(`⏱️ [${label}] Completed in ${duration}ms`);
      
      if (duration > 100) {
        console.warn(`⚠️ [${label}] Slow operation detected: ${duration}ms`);
      }
    };
  },

  measureRender: (componentName: string) => {
    if (__DEV__) {
      const start = Date.now();
      return () => {
        const end = Date.now();
        const duration = end - start;
        if (duration > 16) { // 60fps = 16.67ms per frame
          console.warn(`🐌 [${componentName}] Slow render: ${duration}ms`);
        }
      };
    }
    return () => {};
  },
};

// List optimization helpers
export const listOptimizations = {
  // Standard FlatList props for performance
  getOptimizedFlatListProps: () => ({
    removeClippedSubviews: Platform.OS === 'android',
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 30,
    initialNumToRender: 10,
    windowSize: performanceUtils.getWindowSize(),
    getItemLayout: undefined, // Set this per list based on item height
    keyExtractor: (item: any, index: number) => item.id?.toString() || index.toString(),
  }),

  // ScrollView optimization
  getOptimizedScrollViewProps: () => ({
    removeClippedSubviews: Platform.OS === 'android',
    scrollEventThrottle: 16,
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
  }),
};

// Navigation optimization
export const navigationOptimizations = {
  // Preload critical screens
  preloadScreen: (screenName: string, importFn: () => Promise<any>) => {
    InteractionManager.runAfterInteractions(() => {
      importFn().catch(() => {
        console.warn(`Failed to preload screen: ${screenName}`);
      });
    });
  },
};

// Memory management
export const memoryOptimizations = {
  // Clean up resources
  useCleanup: (cleanup: () => void) => {
    useEffect(() => {
      return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  },

  // Limit concurrent operations
  createOperationQueue: (maxConcurrent: number = 3) => {
    let running = 0;
    const queue: (() => Promise<any>)[] = [];

    const processQueue = async () => {
      if (running >= maxConcurrent || queue.length === 0) {
        return;
      }

      running++;
      const operation = queue.shift()!;
      
      try {
        await operation();
      } catch (error) {
        console.error('Operation failed:', error);
      } finally {
        running--;
        processQueue(); // Process next item
      }
    };

    return {
      add: (operation: () => Promise<any>) => {
        queue.push(operation);
        processQueue();
      },
      clear: () => {
        queue.length = 0;
      },
    };
  },
};

export default performanceUtils;