import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LocationData } from '../hooks/location-store';

interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'safe' | 'alert' | 'danger';
  active: boolean;
  color: string;
}

interface GeofenceManagerProps {
  geofences: GeofenceZone[];
  onCreateGeofence?: (zone: Omit<GeofenceZone, 'id'>) => void;
  currentLocation: LocationData | null;
}

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  geofences,
  onCreateGeofence,
  currentLocation,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newZone, setNewZone] = useState<{
    name: string;
    radius: number;
    type: 'safe' | 'alert' | 'danger';
  }>({
    name: '',
    radius: 500,
    type: 'safe',
  });

  const scaleAnim = useSharedValue(1);

  const handleCreateZone = useCallback(() => {
    if (!currentLocation) {
      Alert.alert('Error', 'Current location not available');
      return;
    }

    if (!newZone.name.trim()) {
      Alert.alert('Error', 'Please enter a zone name');
      return;
    }

    const zoneColors = {
      safe: '#4ECDC4',
      alert: '#FFD740',
      danger: '#FF5252',
    };

    const zone: Omit<GeofenceZone, 'id'> = {
      name: newZone.name.trim(),
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius: newZone.radius,
      type: newZone.type,
      active: true,
      color: zoneColors[newZone.type],
    };

    if (onCreateGeofence) {
      onCreateGeofence(zone);
    }

    // Reset form
    setNewZone({
      name: '',
      radius: 500,
      type: 'safe',
    });
    setIsCreating(false);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [currentLocation, newZone, onCreateGeofence]);

  const handleQuickZone = useCallback((type: 'home' | 'park' | 'vet') => {
    if (!currentLocation) {
      Alert.alert('Error', 'Current location not available');
      return;
    }

    const quickZones = {
      home: { name: 'Home Safe Zone', radius: 100, type: 'safe' as const, color: '#4ECDC4' },
      park: { name: 'Dog Park', radius: 200, type: 'safe' as const, color: '#4ECDC4' },
      vet: { name: 'Veterinary Clinic', radius: 50, type: 'alert' as const, color: '#FFD740' },
    };

    const zone = quickZones[type];
    const geofence: Omit<GeofenceZone, 'id'> = {
      ...zone,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      active: true,
    };

    if (onCreateGeofence) {
      onCreateGeofence(geofence);
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [currentLocation, onCreateGeofence]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1);
  };

  const GeofenceItem = ({ zone }: { zone: GeofenceZone }) => (
    <View style={styles.geofenceItem}>
      <View style={[styles.zoneIndicator, { backgroundColor: zone.color }]} />
      <View style={styles.zoneInfo}>
        <Text style={styles.zoneName}>{zone.name}</Text>
        <Text style={styles.zoneDetails}>
          {zone.radius}m • {zone.type} • {zone.active ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <TouchableOpacity style={styles.zoneToggle}>
        <Ionicons
          name={zone.active ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={zone.active ? zone.color : '#666'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={70} style={styles.manager}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="shield-outline" size={24} color="#FFF" />
          <Text style={styles.title}>Geofences ({geofences.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsCreating(!isCreating)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View style={animatedStyle}>
              <Ionicons
                name={isCreating ? 'close' : 'add'}
                size={20}
                color="#FFF"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Geofence List */}
        {geofences.length > 0 && (
          <View style={styles.geofenceList}>
            {geofences.slice(0, 3).map((zone) => (
              <GeofenceItem key={zone.id} zone={zone} />
            ))}
            {geofences.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {geofences.length} zones
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#667EEA" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions */}
        {!isCreating && (
          <View style={styles.quickActions}>
            <Text style={styles.quickTitle}>Quick Zones</Text>
            <View style={styles.quickButtons}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickZone('home')}
              >
                <Ionicons name="home" size={20} color="#4ECDC4" />
                <Text style={styles.quickButtonText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickZone('park')}
              >
                <MaterialCommunityIcons name="tree" size={20} color="#4ECDC4" />
                <Text style={styles.quickButtonText}>Park</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickZone('vet')}
              >
                <MaterialCommunityIcons name="medical-bag" size={20} color="#FFD740" />
                <Text style={styles.quickButtonText}>Vet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Create Zone Form */}
        {isCreating && (
          <View style={styles.createForm}>
            <Text style={styles.formTitle}>Create New Zone</Text>
            
            <TextInput
              style={styles.nameInput}
              placeholder="Zone name (e.g., Home, Park)"
              placeholderTextColor="#AAA"
              value={newZone.name}
              onChangeText={(text) => setNewZone(prev => ({ ...prev, name: text }))}
            />

            {/* Zone Type Selector */}
            <View style={styles.typeSelector}>
              {(['safe', 'alert', 'danger'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newZone.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewZone(prev => ({ ...prev, type }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newZone.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Radius Selector */}
            <View style={styles.radiusSelector}>
              <Text style={styles.radiusLabel}>Radius: {newZone.radius}m</Text>
              <View style={styles.radiusButtons}>
                {[100, 200, 500, 1000].map((radius) => (
                  <TouchableOpacity
                    key={radius}
                    style={[
                      styles.radiusButton,
                      newZone.radius === radius && styles.radiusButtonActive,
                    ]}
                    onPress={() => setNewZone(prev => ({ ...prev, radius }))}
                  >
                    <Text
                      style={[
                        styles.radiusButtonText,
                        newZone.radius === radius && styles.radiusButtonTextActive,
                      ]}
                    >
                      {radius}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateZone}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.createButtonText}>Create Zone</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 200 : 180,
    right: 20,
    maxWidth: 320,
    zIndex: 1000,
  },
  manager: {
    backgroundColor: 'rgba(26,26,46,0.9)',
    borderRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geofenceList: {
    marginBottom: 16,
  },
  geofenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  zoneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  zoneDetails: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  zoneToggle: {
    padding: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: '#667EEA',
    fontSize: 12,
    marginRight: 4,
  },
  quickActions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  quickTitle: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  quickButtonText: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  createForm: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  formTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#667EEA',
  },
  typeButtonText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  radiusSelector: {
    marginBottom: 16,
  },
  radiusLabel: {
    color: '#FFF',
    fontSize: 12,
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  radiusButtonText: {
    color: '#AAA',
    fontSize: 11,
  },
  radiusButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});