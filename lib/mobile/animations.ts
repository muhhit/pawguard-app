import { Animated, AccessibilityInfo, Platform } from 'react-native';
import { withSpring, withTiming, useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { getAnimationConfig, isFeatureEnabled } from './featureFlags';
import { isLowEndDevice } from './deviceTier';

export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  easing?: any;
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}

class AnimationManager {
  private static instance: AnimationManager;
  private reduceMotionEnabled: boolean | null = null;

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  // Reduce motion durumunu kontrol et
  async shouldReduceMotion(): Promise<boolean> {
    if (this.reduceMotionEnabled !== null) {
      return this.reduceMotionEnabled;
    }

    try {
      // AccessibilityInfo ile OS ayarını kontrol et
      this.reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.warn('Reduce motion kontrolü başarısız:', error);
      this.reduceMotionEnabled = false;
    }

    return this.reduceMotionEnabled;
  }

  // Cihaz ve erişilebilirlik durumuna göre animasyon konfigürasyonu
  async getOptimalAnimationConfig(baseConfig: AnimationConfig): Promise<AnimationConfig> {
    const shouldReduce = await this.shouldReduceMotion();
    const isLowEnd = await isLowEndDevice();
    const animConfig = await getAnimationConfig();

    if (shouldReduce) {
      // Reduce motion aktifse minimal animasyon
      return {
        duration: Math.min(baseConfig.duration, 200),
        useNativeDriver: true,
        easing: undefined, // Linear easing
      };
    }

    if (isLowEnd || !animConfig.enabled) {
      // Düşük cihazlarda hızlı ve basit animasyonlar
      return {
        duration: Math.min(baseConfig.duration, 300),
        useNativeDriver: true,
        easing: baseConfig.easing,
      };
    }

    // Normal cihazlarda tam konfigürasyon
    return baseConfig;
  }

  // Fade animasyonu (tüm cihazlarda desteklenir)
  async createFadeAnimation(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 300
  ): Promise<Animated.CompositeAnimation | null> {
    const shouldReduce = await this.shouldReduceMotion();
    
    if (shouldReduce && toValue === 0) {
      // Reduce motion aktifse fade out'u hızlandır
      duration = 150;
    }

    const config = await this.getOptimalAnimationConfig({
      duration,
      useNativeDriver: true,
    });

    return Animated.timing(animatedValue, {
      toValue,
      duration: config.duration,
      useNativeDriver: config.useNativeDriver,
    });
  }

  // Scale animasyonu (orta+ cihazlarda)
  async createScaleAnimation(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 300
  ): Promise<Animated.CompositeAnimation | null> {
    const shouldReduce = await this.shouldReduceMotion();
    const animConfig = await getAnimationConfig();

    if (shouldReduce) {
      // Reduce motion aktifse scale animasyonu yapma
      return null;
    }

    if (!animConfig.enabled) {
      return null;
    }

    const config = await this.getOptimalAnimationConfig({
      duration,
      useNativeDriver: true,
    });

    return Animated.timing(animatedValue, {
      toValue,
      duration: config.duration,
      useNativeDriver: config.useNativeDriver,
    });
  }

  // Reanimated ile spring animasyonu (yüksek cihazlarda)
  async createReanimatedSpring(
    value: number,
    config: Partial<SpringConfig> = {}
  ) {
    const shouldReduce = await this.shouldReduceMotion();
    const animConfig = await getAnimationConfig();

    if (shouldReduce || !animConfig.spring) {
      // Reduce motion veya spring desteği yoksa timing kullan
      return withTiming(value, { duration: 200 });
    }

    const springConfig = {
      damping: 15,
      stiffness: 150,
      mass: 1,
      ...config,
    };

    return withSpring(value, springConfig);
  }

  // Kart giriş animasyonu (ana kullanım)
  async createCardEntranceAnimation(
    fadeValue: Animated.Value,
    scaleValue: Animated.Value,
    delay: number = 0
  ): Promise<Animated.CompositeAnimation> {
    const shouldReduce = await this.shouldReduceMotion();
    const animConfig = await getAnimationConfig();

    if (shouldReduce) {
      // Sadece fade animasyonu
      const fadeAnim = await this.createFadeAnimation(fadeValue, 1, 200);
      return Animated.sequence([
        Animated.delay(delay),
        fadeAnim!,
      ]);
    }

    if (!animConfig.enabled) {
      // Animasyon devre dışıysa anında göster
      fadeValue.setValue(1);
      scaleValue.setValue(1);
      return Animated.timing(fadeValue, { toValue: 1, duration: 0, useNativeDriver: true });
    }

    // Normal animasyon: fade + scale
    const fadeAnim = await this.createFadeAnimation(fadeValue, 1, 300);
    const scaleAnim = await this.createScaleAnimation(scaleValue, 1, 300);

    if (!scaleAnim) {
      // Scale desteklenmiyorsa sadece fade
      return Animated.sequence([
        Animated.delay(delay),
        fadeAnim!,
      ]);
    }

    return Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([fadeAnim!, scaleAnim]),
    ]);
  }

  // Performans izleme
  startPerformanceMonitoring() {
    if (__DEV__) {
      console.log('Animasyon performans izleme başlatıldı');
    }
  }

  // Bellek temizleme
  cleanup() {
    this.reduceMotionEnabled = null;
  }
}

export const animationManager = AnimationManager.getInstance();

// Hook: Animasyonlu kart bileşeni için
export const useCardAnimation = (delay: number = 0) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  const startAnimation = async () => {
    const animation = await animationManager.createCardEntranceAnimation(
      fadeAnim,
      scaleAnim,
      delay
    );
    animation.start();
  };

  return {
    fadeAnim,
    scaleAnim,
    startAnimation,
    animatedStyle: {
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
    },
  };
};

// Hook: Reanimated ile kart animasyonu
export const useReanimatedCardAnimation = (delay: number = 0) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  const startAnimation = async () => {
    const shouldReduce = await animationManager.shouldReduceMotion();
    const animConfig = await getAnimationConfig();

    if (shouldReduce) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = 1;
    } else if (animConfig.spring) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return {
    startAnimation,
    animatedStyle,
  };
};

// Yardımcı fonksiyonlar
export const shouldReduceMotion = async (): Promise<boolean> => {
  return await animationManager.shouldReduceMotion();
};

export const getOptimalDuration = async (baseDuration: number): Promise<number> => {
  const shouldReduce = await shouldReduceMotion();
  const isLowEnd = await isLowEndDevice();

  if (shouldReduce) return Math.min(baseDuration, 200);
  if (isLowEnd) return Math.min(baseDuration, 300);
  return baseDuration;
};
