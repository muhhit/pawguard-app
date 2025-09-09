import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, Easing } from 'react-native';

interface PageTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
}

export function PageTransition({ 
  children, 
  style, 
  duration = 350, 
  delay = 0 
}: PageTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function FadeTransition({ 
  children, 
  style, 
  duration = 300, 
  delay = 0 
}: PageTransitionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SlideUpTransition({ 
  children, 
  style, 
  duration = 400, 
  delay = 0 
}: PageTransitionProps) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.7,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 120,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function ScaleTransition({ 
  children, 
  style, 
  duration = 350, 
  delay = 0 
}: PageTransitionProps) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 110,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SlideFromRightTransition({ 
  children, 
  style, 
  duration = 300, 
  delay = 0 
}: PageTransitionProps) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SlideFromLeftTransition({ 
  children, 
  style, 
  duration = 300, 
  delay = 0 
}: PageTransitionProps) {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function BounceFadeTransition({ 
  children, 
  style, 
  duration = 500, 
  delay = 0 
}: PageTransitionProps) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.6,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, rotateAnim, duration, delay]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { rotate },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function StaggeredFadeTransition({ 
  children, 
  style, 
  duration = 400, 
  delay = 0,
  staggerDelay = 100 
}: PageTransitionProps & { staggerDelay?: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.stagger(staggerDelay, [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, scaleAnim, duration, delay, staggerDelay]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface TransitionConfig {
  type: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideRight' | 'slideLeft' | 'bounce' | 'staggered';
  duration?: number;
  delay?: number;
  staggerDelay?: number;
}

export function SmartTransition({ 
  children, 
  style, 
  config = { type: 'fade' }
}: { 
  children: React.ReactNode; 
  style?: ViewStyle; 
  config?: TransitionConfig;
}) {
  const { type, duration, delay, staggerDelay } = config;

  switch (type) {
    case 'slide':
      return <PageTransition style={style} duration={duration} delay={delay}>{children}</PageTransition>;
    case 'scale':
      return <ScaleTransition style={style} duration={duration} delay={delay}>{children}</ScaleTransition>;
    case 'slideUp':
      return <SlideUpTransition style={style} duration={duration} delay={delay}>{children}</SlideUpTransition>;
    case 'slideRight':
      return <SlideFromRightTransition style={style} duration={duration} delay={delay}>{children}</SlideFromRightTransition>;
    case 'slideLeft':
      return <SlideFromLeftTransition style={style} duration={duration} delay={delay}>{children}</SlideFromLeftTransition>;
    case 'bounce':
      return <BounceFadeTransition style={style} duration={duration} delay={delay}>{children}</BounceFadeTransition>;
    case 'staggered':
      return <StaggeredFadeTransition style={style} duration={duration} delay={delay} staggerDelay={staggerDelay}>{children}</StaggeredFadeTransition>;
    case 'fade':
    default:
      return <FadeTransition style={style} duration={duration} delay={delay}>{children}</FadeTransition>;
  }
}