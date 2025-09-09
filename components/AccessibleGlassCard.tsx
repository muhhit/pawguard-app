import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Platform, useColorScheme } from 'react-native';
import GlassContainer from './GlassContainer';

interface AccessibleGlassCardProps {
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: any;
  intensity?: number;
  testID?: string;
}

// Hook to check if screen reader is enabled
const useScreenReaderEnabled = () => {
  const [isEnabled, setIsEnabled] = React.useState(false);
  
  React.useEffect(() => {
    const checkScreenReader = async () => {
      if (Platform.OS === 'web') {
        // Web accessibility check
        setIsEnabled(false); // Default for web
        return;
      }
      
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsEnabled(enabled);
      } catch (error) {
        console.log('Error checking screen reader status:', error);
        setIsEnabled(false);
      }
    };
    
    checkScreenReader();
    
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsEnabled
    );
    
    return () => {
      if (Platform.OS !== 'web') {
        subscription?.remove();
      }
    };
  }, []);
  
  return isEnabled;
};

// Hook for accessible glass styling
const useAccessibleGlass = () => {
  const colorScheme = useColorScheme();
  const isScreenReaderEnabled = useScreenReaderEnabled();
  
  return useMemo(() => {
    const isDark = colorScheme === 'dark';
    
    // Higher contrast for accessibility
    const contrastRatio = isScreenReaderEnabled ? 7.0 : 4.5;
    
    // More opaque background for better readability
    const glassOpacity = isScreenReaderEnabled ? 0.95 : 0.85;
    
    // Text colors with proper contrast
    const textColor = isDark 
      ? (isScreenReaderEnabled ? '#FFFFFF' : '#F0F0F0')
      : (isScreenReaderEnabled ? '#000000' : '#1A1A1A');
    
    const backgroundColor = isDark
      ? `rgba(30, 30, 30, ${glassOpacity})`
      : `rgba(255, 255, 255, ${glassOpacity})`;
    
    return {
      contrastRatio,
      glassOpacity,
      textColor,
      backgroundColor,
      isDark
    };
  }, [colorScheme, isScreenReaderEnabled]);
};

const AccessibleGlassCard = memo<AccessibleGlassCardProps>(({ 
  children, 
  accessibilityLabel = "Pet information card",
  accessibilityHint,
  style,
  intensity,
  testID
}) => {
  const { 
    contrastRatio, 
    textColor, 
    backgroundColor, 
    isDark 
  } = useAccessibleGlass();
  const isScreenReaderEnabled = useScreenReaderEnabled();
  
  // Reduce blur intensity for screen readers
  const effectiveIntensity = isScreenReaderEnabled ? 5 : (intensity || 15);
  
  const accessibleStyle = useMemo(() => ({
    backgroundColor,
    ...style
  }), [backgroundColor, style]);
  
  return (
    <GlassContainer
      intensity={effectiveIntensity}
      tint={isDark ? 'dark' : 'light'}
      style={accessibleStyle}
    >
      <View
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="text"
        testID={testID}
        style={styles.contentContainer}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Text) {
            const childProps = child.props as any;
            return React.cloneElement(child as React.ReactElement<any>, {
              style: [
                childProps.style,
                {
                  color: textColor,
                  fontWeight: contrastRatio < 4.5 ? 'bold' : childProps.style?.fontWeight || 'normal'
                }
              ]
            });
          }
          return child;
        })}
      </View>
    </GlassContainer>
  );
});

AccessibleGlassCard.displayName = 'AccessibleGlassCard';

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
});

export default AccessibleGlassCard;
export { useAccessibleGlass, useScreenReaderEnabled };