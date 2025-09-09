import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface LocationTrackerProps {
  isTracking: boolean;
  onToggleTracking: (tracking: boolean) => void;
  accuracy: number;
  batteryOptimized?: boolean;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  isTracking,
  onToggleTracking,
  accuracy,
  batteryOptimized = false,
}) => {
  const [trackingMode, setTrackingMode] = useState<'high' | 'balanced' | 'battery'>('balanced');
  const [dataUsage, setDataUsage] = useState<number>(0);
  const pulseAnim = useSharedValue(1);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    if (isTracking) {
      // Pulse animation when tracking
      pulseAnim.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
      
      // Rotate animation for active tracking
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
    } else {
      pulseAnim.value = withSpring(1);
      rotateAnim.value = withSpring(0);
    }
  }, [isTracking]);

  const handleToggleTracking = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleTracking(!isTracking);
  };

  const handleModeChange = () => {
    const modes: ('high' | 'balanced' | 'battery')[] = ['high', 'balanced', 'battery'];
    const currentIndex = modes.indexOf(trackingMode);
    const newMode = modes[(currentIndex + 1) % 3];
    setTrackingMode(newMode);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const getAccuracyColor = (acc: number): string => {
    if (acc <= 5) return '#4ECDC4'; // Excellent
    if (acc <= 10) return '#FFD740'; // Good
    if (acc <= 20) return '#FF9F40'; // Fair
    return '#FF5252'; // Poor
  };

  const getAccuracyText = (acc: number): string => {
    if (acc <= 5) return 'Excellent';
    if (acc <= 10) return 'Good';
    if (acc <= 20) return 'Fair';
    return 'Poor';
  };

  const getModeConfig = (mode: 'high' | 'balanced' | 'battery') => {
    switch (mode) {
      case 'high':
        return {
          icon: 'flash',
          color: '#FF5252',
          label: 'High Precision',
          description: '1s updates, GPS only',
        };
      case 'balanced':
        return {
          icon: 'speedometer',
          color: '#FFD740',
          label: 'Balanced',
          description: '5s updates, GPS + Network',
        };
      case 'battery':
        return {
          icon: 'battery-charging',
          color: '#4ECDC4',
          label: 'Battery Saver',
          description: '30s updates, Network priority',
        };
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const modeConfig = getModeConfig(trackingMode);

  return (
    <View style={styles.container}>
      <BlurView intensity={70} style={styles.tracker}>
        {/* Main Tracking Button */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleToggleTracking}
        >
          <Animated.View style={[styles.trackingButton, pulseStyle]}>
            <LinearGradient
              colors={isTracking ? ['#4ECDC4', '#44A08D'] : ['#666', '#444']}
              style={styles.buttonGradient}
            >
              <Animated.View style={rotateStyle}>
                <MaterialCommunityIcons
                  name={isTracking ? 'crosshairs-gps' : 'crosshairs'}
                  size={32}
                  color="#FFF"
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Tracking Info */}
        <View style={styles.trackingInfo}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isTracking ? '#4ECDC4' : '#666' }]} />
            <Text style={styles.statusText}>
              {isTracking ? 'Live Tracking' : 'Tracking Stopped'}
            </Text>
          </View>

          {/* Accuracy Display */}
          {isTracking && accuracy > 0 && (
            <View style={styles.accuracyRow}>
              <Ionicons name="location" size={16} color={getAccuracyColor(accuracy)} />
              <Text style={[styles.accuracyText, { color: getAccuracyColor(accuracy) }]}>
                {getAccuracyText(accuracy)} ({accuracy.toFixed(1)}m)
              </Text>
            </View>
          )}

          {/* Mode Selector */}
          <TouchableOpacity style={styles.modeSelector} onPress={handleModeChange}>
            <Ionicons name={modeConfig.icon as any} size={16} color={modeConfig.color} />
            <Text style={styles.modeText}>{modeConfig.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#AAA" />
          </TouchableOpacity>

          {/* Data Usage */}
          <View style={styles.dataUsage}>
            <MaterialCommunityIcons name="database" size={14} color="#AAA" />
            <Text style={styles.dataText}>{dataUsage.toFixed(1)} MB used</Text>
          </View>
        </View>
      </BlurView>

      {/* Mode Details Popup */}
      {isTracking && (
        <View style={styles.modeDetails}>
          <BlurView intensity={50} style={styles.modeDetailsBlur}>
            <Text style={styles.modeDetailsText}>{modeConfig.description}</Text>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    zIndex: 1000,
  },
  tracker: {
    backgroundColor: 'rgba(26,26,46,0.9)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 280,
  },
  mainButton: {
    marginRight: 16,
  },
  trackingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  buttonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trackingInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  modeText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 6,
    marginRight: 'auto',
    fontWeight: '500',
  },
  dataUsage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataText: {
    color: '#AAA',
    fontSize: 11,
    marginLeft: 6,
  },
  modeDetails: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
  },
  modeDetailsBlur: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 12,
  },
  modeDetailsText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
});