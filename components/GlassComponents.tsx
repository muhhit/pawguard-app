import React, { ReactNode, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// iOS 26 Liquid Glass Card Component
interface LiquidGlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
  gradient?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'floating' | 'interactive';
  glowColor?: string;
  borderRadius?: number;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  intensity = 40,
  gradient = true,
  onPress,
  variant = 'default',
  glowColor = '#667EEA',
  borderRadius = 24,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    // Continuous shimmer effect
    const shimmerAnimation = () => {
      shimmer.value = withSequence(
        withTiming(1, { duration: 2000 }),
        withDelay(3000, withTiming(-1, { duration: 0 }))
      );
    };
    
    shimmerAnimation();
    const interval = setInterval(shimmerAnimation, 5000);
    return () => clearInterval(interval);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
    shadowOpacity: interpolate(
      glow.value,
      [0, 1],
      [0.1, 0.3],
      Extrapolate.CLAMP
    ),
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [-1, 1],
          [-SCREEN_WIDTH, SCREEN_WIDTH],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      shimmer.value,
      [-1, -0.5, 0, 0.5, 1],
      [0, 0.3, 0.6, 0.3, 0],
      Extrapolate.CLAMP
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    rotation.value = withSpring(0.5);
    glow.value = withTiming(1, { duration: 200 });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    rotation.value = withSpring(0);
    glow.value = withTiming(0, { duration: 300 });
  };

  const Container = onPress ? Pressable : View;
  const variantStyles = getVariantStyles(variant, borderRadius);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Container
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        onPress={onPress}
        style={variantStyles.container}
      >
        {Platform.OS !== 'web' ? (
          <AnimatedBlurView
            intensity={intensity}
            tint="systemMaterialLight"
            style={[styles.glassContainer, { borderRadius }, variantStyles.blur]}
          >
            {gradient && (
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            
            {/* Shimmer Effect */}
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                shimmerStyle,
                { overflow: 'hidden' },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.2)',
                  'rgba(255,255,255,0.4)',
                  'rgba(255,255,255,0.2)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { width: 100 }]}
              />
            </Animated.View>
            
            <View style={[styles.glassContent, variantStyles.content]}>
              {children}
            </View>
          </AnimatedBlurView>
        ) : (
          <View style={[styles.glassContainer, styles.webGlass, { borderRadius }, variantStyles.blur]}>
            {gradient && (
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={[styles.glassContent, variantStyles.content]}>
              {children}
            </View>
          </View>
        )}
      </Container>
    </Animated.View>
  );
};

// iOS 26 Aurora Button Component
interface AuroraButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large' | 'xl';
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const AuroraButton: React.FC<AuroraButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const rotation = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    if (loading) {
      rotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
      const interval = setInterval(() => {
        rotation.value = withSequence(
          withTiming(360, { duration: 1000 }),
          withTiming(0, { duration: 0 })
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading, rotation]);

  const colors = {
    primary: ['#667EEA', '#764BA2', '#F093FB'] as const,
    secondary: ['#4ECDC4', '#44A08D', '#093637'] as const,
    danger: ['#FF6B6B', '#FF5252', '#FF0040'] as const,
    success: ['#56CCF2', '#2F80ED', '#1E3A8A'] as const,
    warning: ['#FFD93D', '#FF6B6B', '#FF8E53'] as const,
  };

  const sizes = {
    small: { height: 40, fontSize: 14, padding: 12, borderRadius: 20 },
    medium: { height: 48, fontSize: 16, padding: 16, borderRadius: 24 },
    large: { height: 56, fontSize: 18, padding: 20, borderRadius: 28 },
    xl: { height: 64, fontSize: 20, padding: 24, borderRadius: 32 },
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: loading ? `${rotation.value}deg` : '0deg' },
    ],
    shadowOpacity: interpolate(
      glow.value,
      [0, 1],
      [0.2, 0.5],
      Extrapolate.CLAMP
    ),
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [-1, 1],
          [-200, 200],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      glow.value = withTiming(1, { duration: 200 });
      shimmer.value = withTiming(1, { duration: 600 });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    glow.value = withTiming(0, { duration: 300 });
    shimmer.value = withTiming(-1, { duration: 0 });
  };

  return (
    <Animated.View
      style={[
        styles.auroraButton,
        {
          height: sizes[size].height,
          width: fullWidth ? '100%' : undefined,
        },
        animatedStyle,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.buttonPressable}
      >
        <LinearGradient
          colors={disabled ? ['#999', '#666'] : colors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buttonGradient,
            { borderRadius: sizes[size].borderRadius },
          ]}
        >
          {/* Shimmer Effect */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              shimmerStyle,
              { overflow: 'hidden', borderRadius: sizes[size].borderRadius },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255,255,255,0.3)',
                'rgba(255,255,255,0.6)',
                'rgba(255,255,255,0.3)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFillObject, { width: 100 }]}
            />
          </Animated.View>
          
          {icon && !loading && <View style={styles.buttonIcon}>{icon}</View>}
          {loading && (
            <Animated.View style={[styles.buttonIcon, { transform: [{ rotate: `${rotation.value}deg` }] }]}>
              <View style={styles.loadingSpinner} />
            </Animated.View>
          )}
          <Text style={[styles.buttonText, { fontSize: sizes[size].fontSize }]}>
            {loading ? 'Loading...' : title}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// iOS 26 Floating Action Button
interface FloatingActionProps {
  icon: ReactNode;
  onPress: () => void;
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const FloatingAction: React.FC<FloatingActionProps> = ({
  icon,
  onPress,
  position = 'bottomRight',
  variant = 'primary',
  size = 'medium',
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const positions = {
    bottomRight: { bottom: insets.bottom + 20, right: 20 },
    bottomLeft: { bottom: insets.bottom + 20, left: 20 },
    topRight: { top: insets.top + 20, right: 20 },
    topLeft: { top: insets.top + 20, left: 20 },
  };

  const sizes = {
    small: 48,
    medium: 56,
    large: 64,
  };

  const colors = {
    primary: ['#667EEA', '#764BA2'] as const,
    secondary: ['#4ECDC4', '#44A08D'] as const,
    danger: ['#FF6B6B', '#FF5252'] as const,
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    shadowOpacity: interpolate(
      glow.value,
      [0, 1],
      [0.3, 0.6],
      Extrapolate.CLAMP
    ),
  }));

  const handlePress = () => {
    rotation.value = withSpring(360, { damping: 15, stiffness: 300 }, () => {
      rotation.value = 0;
    });
    glow.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 300 })
    );
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onPress();
  };

  const buttonSize = sizes[size];

  return (
    <Animated.View
      style={[
        styles.floatingAction,
        positions[position],
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.9);
          glow.value = withTiming(1, { duration: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
          glow.value = withTiming(0, { duration: 300 });
        }}
      >
        <LinearGradient
          colors={colors[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.floatingActionGradient,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
          ]}
        >
          {Platform.OS !== 'web' ? (
            <BlurView intensity={20} style={styles.floatingActionBlur}>
              {icon}
            </BlurView>
          ) : (
            <View style={styles.floatingActionBlur}>{icon}</View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// iOS 26 Liquid Navigation Bar
interface LiquidNavBarProps {
  title?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  transparent?: boolean;
  scrollY?: Animated.SharedValue<number>;
}

export const LiquidNavBar: React.FC<LiquidNavBarProps> = ({
  title,
  leftAction,
  rightAction,
  transparent = false,
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(transparent ? 0 : 1);

  const animatedStyle = useAnimatedStyle(() => {
    if (scrollY) {
      const newOpacity = interpolate(
        scrollY.value,
        [0, 100],
        [transparent ? 0 : 1, 1],
        Extrapolate.CLAMP
      );

      
      return {
        opacity: newOpacity,
      };
    }
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.navBar,
        { paddingTop: insets.top },
        animatedStyle,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <AnimatedBlurView
          intensity={40}
          tint="systemMaterialLight"
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.webNavBar]} />
      )}
      
      <View style={styles.navContent}>
        <View style={styles.navLeft}>{leftAction}</View>
        <View style={styles.navCenter}>
          {title && <Text style={styles.navTitle}>{title}</Text>}
        </View>
        <View style={styles.navRight}>{rightAction}</View>
      </View>
    </Animated.View>
  );
};

// iOS 26 Bottom Sheet Component
interface LiquidBottomSheetProps {
  children: ReactNode;
  isVisible: boolean;
  onClose: () => void;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
}

export const LiquidBottomSheet: React.FC<LiquidBottomSheetProps> = ({
  children,
  isVisible,
  onClose,
  snapPoints = ['50%', '90%'],
  enablePanDownToClose = true,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [isVisible, opacity, translateY]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial position
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || translateY.value > SCREEN_HEIGHT * 0.3) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isVisible && translateY.value === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.bottomSheet, sheetStyle]}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={40} tint="systemMaterialLight" style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.webBottomSheet]} />
          )}
          
          <View style={styles.sheetHandle} />
          <View style={[styles.sheetContent, { paddingBottom: insets.bottom }]}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// Helper function for variant styles
const getVariantStyles = (variant: string, borderRadius: number) => {
  const baseStyles = {
    container: {},
    blur: {},
    content: {},
  };

  switch (variant) {
    case 'elevated':
      return {
        ...baseStyles,
        container: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 12,
        },
      };
    case 'floating':
      return {
        ...baseStyles,
        container: {
          shadowColor: '#667EEA',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 16,
        },
      };
    case 'interactive':
      return {
        ...baseStyles,
        blur: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        },
      };
    default:
      return baseStyles;
  }
};

const styles = StyleSheet.create({
  glassContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  webGlass: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(40px)',
  },
  glassContent: {
    padding: 20,
  },
  auroraButton: {
    borderRadius: 30,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    marginVertical: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonPressable: {
    flex: 1,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
  floatingAction: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingActionGradient: {
    overflow: 'hidden',
  },
  floatingActionBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  webNavBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(40px)',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
  },
  navLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  navCenter: {
    flex: 2,
    alignItems: 'center',
  },
  navRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: SCREEN_HEIGHT * 0.5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  webBottomSheet: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(40px)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default {
  LiquidGlassCard,
  AuroraButton,
  FloatingAction,
  LiquidNavBar,
  LiquidBottomSheet,
};