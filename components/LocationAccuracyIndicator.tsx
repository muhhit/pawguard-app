import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Lock, Eye, Shield } from 'lucide-react-native';
// import { UserType } from '@/utils/locationPrivacy';
type UserType = 'owner' | 'public' | 'finder';

interface LocationAccuracyIndicatorProps {
  userType: UserType;
  showRadius?: boolean;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

interface AccuracyConfig {
  color: string;
  backgroundColor: string;
  icon: React.ComponentType<any>;
  label: string;
  radius: number;
}

const accuracyConfigs: Record<UserType, AccuracyConfig> = {
  owner: {
    color: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    icon: Eye,
    label: 'Exact Location',
    radius: 65,
  },
  finder: {
    color: '#FFA500',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    icon: Shield,
    label: 'Street Level',
    radius: 174,
  },
  public: {
    color: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    icon: Lock,
    label: 'Neighborhood',
    radius: 1200,
  },
};

const sizeConfigs = {
  small: { iconSize: 12, fontSize: 10, padding: 4 },
  medium: { iconSize: 16, fontSize: 12, padding: 6 },
  large: { iconSize: 20, fontSize: 14, padding: 8 },
};

export function LocationAccuracyIndicator({
  userType,
  showRadius = true,
  showIcon = true,
  showLabel = false,
  size = 'medium',
  animated = true,
}: LocationAccuracyIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = accuracyConfigs[userType];
  const sizeConfig = sizeConfigs[size];
  const IconComponent = config.icon;

  useEffect(() => {
    if (animated && userType !== 'owner') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [animated, userType, pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Accuracy radius circle */}
      {showRadius && (
        <Animated.View
          style={[
            styles.radiusCircle,
            {
              backgroundColor: config.backgroundColor,
              borderColor: config.color,
              transform: animated && userType !== 'owner' ? [{ scale: pulseAnim }] : [],
            },
          ]}
        />
      )}

      {/* Center indicator */}
      <View
        style={[
          styles.centerIndicator,
          {
            backgroundColor: config.color,
            padding: sizeConfig.padding,
          },
        ]}
      >
        {showIcon && (
          <IconComponent
            color="#FFFFFF"
            size={sizeConfig.iconSize}
          />
        )}
      </View>

      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeConfig.fontSize,
                color: config.color,
              },
            ]}
          >
            {config.label}
          </Text>
        </View>
      )}
    </View>
  );
}

// Legend component for explaining the colors
export function LocationAccuracyLegend() {
  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Location Accuracy</Text>
      {Object.entries(accuracyConfigs).map(([userType, config]) => {
        const IconComponent = config.icon;
        return (
          <View key={userType} style={styles.legendItem}>
            <View
              style={[
                styles.legendIcon,
                { backgroundColor: config.color },
              ]}
            >
              <IconComponent color="#FFFFFF" size={12} />
            </View>
            <Text style={styles.legendText}>
              {config.label} ({config.radius}m)
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Floating accuracy indicator for map overlay
export function FloatingAccuracyIndicator({
  userType,
  onPress,
}: {
  userType: UserType;
  onPress?: () => void;
}) {
  const config = accuracyConfigs[userType];
  const IconComponent = config.icon;

  return (
    <View style={styles.floatingContainer}>
      <View
        style={[
          styles.floatingIndicator,
          { backgroundColor: config.color },
        ]}
      >
        <IconComponent color="#FFFFFF" size={16} />
        <Text style={styles.floatingText}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radiusCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.6,
  },
  centerIndicator: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  labelContainer: {
    position: 'absolute',
    top: -25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  legendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  floatingContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 1000,
  },
  floatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default LocationAccuracyIndicator;