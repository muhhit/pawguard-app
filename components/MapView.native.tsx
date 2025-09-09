import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Navigation, Plus, MapPin } from 'lucide-react-native';
import { useLocation, LocationData } from '@/hooks/location-store';
import { MapViewProps } from './MapView';

// Check if react-native-maps is available
let hasNativeMaps = false;
let MapViewComponent: any = null;
let MarkerComponent: any = null;
let PROVIDER_DEFAULT: any = null;

try {
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const maps = require('react-native-maps');
    MapViewComponent = maps.default;
    MarkerComponent = maps.Marker;
    PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
    hasNativeMaps = true;
  }
} catch (error) {
  console.warn('react-native-maps not available, using fallback:', error);
  hasNativeMaps = false;
}

// Fallback Map Component
const FallbackMap = ({ style, pets = [], currentLocation, selectedLocation, onLocationSelect, showAddLocationButton }: any) => {
  const handleMapPress = () => {
    if (showAddLocationButton && onLocationSelect) {
      // Simulate selecting a location near current location or default
      const baseLocation = currentLocation || { latitude: 41.0082, longitude: 28.9784 };
      const newLocation: LocationData = {
        latitude: baseLocation.latitude + (Math.random() - 0.5) * 0.01,
        longitude: baseLocation.longitude + (Math.random() - 0.5) * 0.01,
        address: 'Selected Location',
        timestamp: Date.now(),
        accuracy: 0
      };
      onLocationSelect(newLocation);
    }
  };

  return (
    <View style={[styles.fallbackContainer, style]}>
      <View style={styles.fallbackHeader}>
        <MapPin color="#8B5CF6" size={32} />
        <Text style={styles.fallbackTitle}>Map View</Text>
        <Text style={styles.fallbackSubtitle}>
          {currentLocation 
            ? `Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
            : 'Location not available'
          }
        </Text>
      </View>

      <View style={styles.fallbackContent}>
        {pets.length > 0 && (
          <View style={styles.petsSection}>
            <Text style={styles.sectionTitle}>Lost Pets Nearby ({pets.length})</Text>
            {pets.slice(0, 3).map((pet: any, index: number) => (
              <View key={pet.id || index} style={styles.petItem}>
                <View style={styles.petMarkerFallback}>
                  <Text style={styles.petMarkerEmoji}>🐕</Text>
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name || 'Pet'}</Text>
                  <Text style={styles.petType}>{pet.type || 'Unknown'}</Text>
                  {pet.last_location && (
                    <Text style={styles.petLocation}>
                      {pet.last_location.lat.toFixed(4)}, {pet.last_location.lng.toFixed(4)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {pets.length > 3 && (
              <Text style={styles.moreText}>+{pets.length - 3} more pets</Text>
            )}
          </View>
        )}

        {selectedLocation && (
          <View style={styles.selectedLocationSection}>
            <Text style={styles.sectionTitle}>Selected Location</Text>
            <Text style={styles.locationText}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {showAddLocationButton && (
          <TouchableOpacity style={styles.selectLocationButton} onPress={handleMapPress}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.selectLocationText}>
              {selectedLocation ? 'Change Location' : 'Select Location'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.fallbackNote}>
        Native maps not available. Install react-native-maps for full map functionality.
      </Text>
    </View>
  );
};

export default function MapViewNative({ 
  style,
  onLocationSelect, 
  showAddLocationButton = false, 
  centerLocation,
  pets = [],
  enableClustering = false,
  enableHeatmap = false,
  userType = 'public'
}: MapViewProps) {
  const { 
    currentLocation, 
    getCurrentLocation, 
    permissions,
    requestPermissions,
    isLoading 
  } = useLocation();
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const handleGetCurrentLocation = useCallback(async () => {
    if (!permissions.foreground) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    await getCurrentLocation();
  }, [permissions.foreground, requestPermissions, getCurrentLocation]);

  const handleLocationSelect = useCallback((location: LocationData) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  }, [onLocationSelect]);

  // Use react-native-maps if available
  const getInitialRegion = () => {
    const location = centerLocation || currentLocation;
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: 41.0082,
      longitude: 28.9784,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  const handleMapPress = useCallback((event: any) => {
    if (showAddLocationButton && onLocationSelect) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      const newLocation: LocationData = {
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        timestamp: Date.now(),
        accuracy: 0
      };
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    }
  }, [showAddLocationButton, onLocationSelect]);

  // If react-native-maps is not available, use fallback
  if (!hasNativeMaps) {
    return (
      <View style={[styles.container, style]}>
        <FallbackMap
          style={styles.map}
          pets={pets}
          currentLocation={currentLocation}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          showAddLocationButton={showAddLocationButton}
        />
        
        {/* Get location button if no current location */}
        {!currentLocation && (
          <View style={styles.addLocationContainer}>
            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={handleGetCurrentLocation}
              disabled={isLoading}
            >
              <Navigation color="#FFFFFF" size={20} />
              <Text style={styles.locationButtonText}>
                {isLoading ? 'Getting Location...' : 'Get My Location'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapViewComponent
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={handleMapPress}
        mapType="standard"
        loadingEnabled={true}
      >
        {/* Current location marker */}
        {currentLocation && (
          <MarkerComponent
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            description={currentLocation.address || 'Current location'}
            pinColor="#45B7D1"
          />
        )}

        {/* Pet markers */}
        {pets.slice(0, 10).map(pet => {
          if (!pet.last_location || !pet.id) return null;
          
          return (
            <MarkerComponent
              key={pet.id}
              coordinate={{
                latitude: pet.last_location.lat,
                longitude: pet.last_location.lng,
              }}
              title={`${pet.name || 'Pet'} (Lost)`}
              description={`${pet.type || 'Pet'} • Tap for details`}
              pinColor="#EF4444"
            />
          );
        })}

        {/* Selected location marker */}
        {selectedLocation && (
          <MarkerComponent
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Selected Location"
            description="Tap to confirm this location"
            pinColor="#10B981"
          />
        )}
      </MapViewComponent>

      {/* Add location button */}
      {showAddLocationButton && (
        <View style={styles.addLocationContainer}>
          <TouchableOpacity style={styles.addLocationButton}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addLocationText}>
              {selectedLocation ? 'Location Selected' : 'Tap on map to select location'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Get location button if no current location */}
      {!currentLocation && (
        <View style={styles.addLocationContainer}>
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={handleGetCurrentLocation}
            disabled={isLoading}
          >
            <Navigation color="#FFFFFF" size={20} />
            <Text style={styles.locationButtonText}>
              {isLoading ? 'Getting Location...' : 'Get My Location'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  fallbackHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  fallbackContent: {
    flex: 1,
  },
  petsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  petMarkerFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  petMarkerEmoji: {
    fontSize: 20,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  petType: {
    fontSize: 14,
    color: '#6B7280',
  },
  petLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  moreText: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedLocationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  selectLocationButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  addLocationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addLocationButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addLocationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});