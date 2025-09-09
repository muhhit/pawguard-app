import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { LocationData } from '../hooks/location-store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ARDirectionsProps {
  targetLocation: {
    latitude: number;
    longitude: number;
  };
  currentLocation: LocationData | null;
  petName: string;
  onClose?: () => void;
}

interface AROverlayData {
  distance: number;
  bearing: number;
  direction: string;
  estimatedTime: number;
}

export const ARDirections: React.FC<ARDirectionsProps> = ({
  targetLocation,
  currentLocation,
  petName,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [arData, setArData] = useState<AROverlayData | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const cameraRef = useRef<CameraView>(null);
  
  const pulseAnim = useSharedValue(1);
  const rotateAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    // Request camera permissions
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Start animations
    pulseAnim.value = withRepeat(
      withTiming(1.2, { duration: 1500 }),
      -1,
      true
    );

    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (currentLocation && targetLocation) {
      const data = calculateARData(currentLocation, targetLocation);
      setArData(data);
    }
  }, [currentLocation, targetLocation]);

  const calculateARData = (
    current: LocationData,
    target: { latitude: number; longitude: number }
  ): AROverlayData => {
    // Calculate distance using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (current.latitude * Math.PI) / 180;
    const φ2 = (target.latitude * Math.PI) / 180;
    const Δφ = ((target.latitude - current.latitude) * Math.PI) / 180;
    const Δλ = ((target.longitude - current.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Calculate bearing
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    const normalizedBearing = (bearing + 360) % 360;

    // Get direction text
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const directionIndex = Math.round(normalizedBearing / 22.5) % 16;
    const direction = directions[directionIndex];

    // Estimate walking time (assuming 5 km/h walking speed)
    const estimatedTime = Math.round((distance / 1000) * 12); // minutes

    return {
      distance,
      bearing: normalizedBearing,
      direction,
      estimatedTime,
    };
  };

  const getArrowPosition = () => {
    if (!arData) return { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };
    
    // Calculate arrow position based on bearing and device heading
    const relativeBearing = arData.bearing - deviceHeading;
    const radians = (relativeBearing * Math.PI) / 180;
    
    // Position arrow in a circle around center
    const radius = 100;
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;
    
    const x = centerX + radius * Math.sin(radians);
    const y = centerY - radius * Math.cos(radians);
    
    return { x, y };
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const arrowStyle = useAnimatedStyle(() => {
    const position = getArrowPosition();
    return {
      transform: [
        { translateX: position.x - 25 },
        { translateY: position.y - 25 },
        { rotate: `${arData?.bearing || 0}deg` },
        { scale: scaleAnim.value },
      ],
    };
  });

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {Platform.OS !== 'web' && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
      )}
      
      {/* Web fallback */}
      {Platform.OS === 'web' && (
        <View style={[styles.camera, styles.webFallback]}>
          <Text style={styles.webFallbackText}>AR Camera View</Text>
          <Text style={styles.webFallbackSubtext}>(Camera not available on web)</Text>
        </View>
      )}

      {/* AR Overlay */}
      <View style={styles.overlay}>
        {/* Target Information */}
        <BlurView intensity={50} style={styles.targetInfo}>
          <View style={styles.targetHeader}>
            <MaterialCommunityIcons name="paw" size={24} color="#FFD700" />
            <Text style={styles.targetName}>{petName}</Text>
          </View>
          
          {arData && (
            <View style={styles.targetDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={16} color="#4ECDC4" />
                <Text style={styles.detailText}>{formatDistance(arData.distance)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="compass" size={16} color="#667EEA" />
                <Text style={styles.detailText}>{arData.direction}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color="#FF9F40" />
                <Text style={styles.detailText}>{formatTime(arData.estimatedTime)}</Text>
              </View>
            </View>
          )}
        </BlurView>

        {/* Direction Arrow */}
        {arData && (
          <Animated.View style={[styles.directionArrow, arrowStyle]}>
            <Animated.View style={pulseStyle}>
              <LinearGradient
                colors={['#FF5252', '#FF9F40']}
                style={styles.arrowGradient}
              >
                <Ionicons name="arrow-up" size={32} color="#FFF" />
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        )}

        {/* Compass */}
        <View style={styles.compass}>
          <Animated.View style={[styles.compassRing, rotateStyle]}>
            <View style={styles.compassNorth}>
              <Text style={styles.compassText}>N</Text>
            </View>
          </Animated.View>
          <View style={styles.compassCenter}>
            <MaterialCommunityIcons name="crosshairs" size={20} color="#FFF" />
          </View>
        </View>

        {/* Distance Indicator */}
        {arData && arData.distance < 50 && (
          <BlurView intensity={70} style={styles.arrivalNotice}>
            <Animated.View style={pulseStyle}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4ECDC4" />
            </Animated.View>
            <Text style={styles.arrivalText}>You're very close!</Text>
            <Text style={styles.arrivalSubtext}>Look around for {petName}</Text>
          </BlurView>
        )}

        {/* Instructions */}
        <BlurView intensity={30} style={styles.instructions}>
          <Text style={styles.instructionText}>
            Point your camera towards the direction of the arrow
          </Text>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  camera: {
    flex: 1,
  },
  webFallback: {
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFallbackText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  webFallbackSubtext: {
    color: '#AAA',
    fontSize: 14,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT / 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  targetInfo: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(26,26,46,0.9)',
    borderRadius: 16,
    padding: 16,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  targetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  directionArrow: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  arrowGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  compass: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 140,
    right: 20,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  compassNorth: {
    backgroundColor: '#FF5252',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  compassCenter: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26,26,46,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalNotice: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(78,205,196,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  arrivalText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  arrivalSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  instructions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 12,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
});