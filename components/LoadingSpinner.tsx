import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassColors } from '@/constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'default' | 'glass' | 'minimal' | 'branded';
  fullScreen?: boolean;
  showLogo?: boolean;
}

export default function LoadingSpinner({
  size = 'large',
  color = '#E30A17',
  text,
  style,
  textStyle,
  variant = 'default',
  fullScreen = false,
  showLogo = false,
}: LoadingSpinnerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation for spinner
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Fade in animation
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });

    fadeAnimation.start();
    if (showLogo || variant === 'branded') {
      pulseAnimation.start();
    }
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      fadeAnimation.stop();
    };
  }, [showLogo, variant, fadeAnim, pulseAnim, rotateAnim]);
  const containerStyle = [
    fullScreen ? styles.fullScreenContainer : styles.container,
    style,
  ];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderBrandedContent = () => (
    <Animated.View style={[styles.brandedContainer, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop&crop=center&auto=format&q=80' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
        <View style={[styles.customSpinner, { borderTopColor: color }]} />
      </Animated.View>
      <Text style={[styles.brandText, textStyle]}>PawGuard</Text>
      {text && (
        <Text style={[styles.text, { color: glassColors.turkish.red }, textStyle]}>
          {text}
        </Text>
      )}
    </Animated.View>
  );

  const renderContent = () => (
    <>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, { color }, textStyle]}>
          {text}
        </Text>
      )}
    </>
  );

  if (variant === 'branded') {
    return (
      <View style={containerStyle}>
        <LinearGradient
          colors={glassColors.gradients.turkish as any}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.brandedContent}>
          {renderBrandedContent()}
        </View>
      </View>
    );
  }

  if (variant === 'glass') {
    return (
      <View style={containerStyle}>
        <LinearGradient
          colors={glassColors.gradients.primary as any}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glassContent}>
          {showLogo ? renderBrandedContent() : renderContent()}
        </View>
      </View>
    );
  }

  if (variant === 'minimal') {
    return (
      <View style={[containerStyle, styles.minimal]}>
        {renderContent()}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {showLogo ? renderBrandedContent() : renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  minimal: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  glassContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  brandedContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  brandedContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  customSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(227, 10, 23, 0.2)',
    borderTopColor: '#E30A17',
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E30A17',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export { LoadingSpinner };