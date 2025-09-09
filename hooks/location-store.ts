import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  address?: string;
}

export interface LocationPermissions {
  foreground: boolean;
  background: boolean;
}

interface LocationStore {
  currentLocation: LocationData | null;
  permissions: LocationPermissions;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  requestBackgroundPermissions: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  watchLocation: () => void;
  stopWatching: () => void;
  reverseGeocode: (latitude: number, longitude: number) => Promise<string>;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  searchLocation: (query: string) => Promise<LocationData[]>;
}

export const [LocationProvider, useLocation] = createContextHook((): LocationStore => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [permissions, setPermissions] = useState<LocationPermissions>({
    foreground: false,
    background: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const locationSubscriptionRef = useRef<any>(null);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, assume permissions are available (will be checked when requesting location)
        setPermissions({
          foreground: true,
          background: false, // Background not supported on web
        });
        return;
      }

      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      
      setPermissions({
        foreground: foregroundStatus.granted,
        background: backgroundStatus.granted,
      });
    } catch (err) {
      console.error('Error checking location permissions:', err);
      // Set default permissions on error
      setPermissions({
        foreground: false,
        background: false,
      });
    }
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        // For web, we'll check permissions when actually requesting location
        setPermissions(prev => ({ ...prev, foreground: true }));
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissions(prev => ({ ...prev, foreground: granted }));
      
      if (!granted) {
        setError('Location permission denied. Please enable location access in settings.');
      }
      
      return granted;
    } catch (err) {
      let errorMessage = 'Failed to request location permissions';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
      console.error('Error requesting location permissions:', errorMessage, err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestBackgroundPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        console.log('Background location not supported on web');
        return false;
      }

      setIsLoading(true);
      setError(null);

      // First ensure we have foreground permissions
      const foregroundGranted = await requestPermissions();
      if (!foregroundGranted) {
        return false;
      }

      const { status } = await Location.requestBackgroundPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissions(prev => ({ ...prev, background: granted }));
      
      if (!granted) {
        setError('Background location permission denied. This is needed for location alerts.');
      }
      
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request background location permissions';
      setError(errorMessage);
      console.error('Error requesting background location permissions:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions]);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        // Use web geolocation API
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            const errorMsg = 'Geolocation is not supported by this browser';
            setError(errorMsg);
            console.error(errorMsg);
            resolve(null);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              try {
                const locationData: LocationData = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                };
                setCurrentLocation(locationData);
                setError(null);
                console.log('Web location obtained successfully:', locationData);
                resolve(locationData);
              } catch (parseError) {
                console.error('Error parsing location data:', parseError);
                setError('Failed to process location data');
                resolve(null);
              }
            },
            (error) => {
              console.log('Web geolocation error, continuing without location');
              setError('Location unavailable');
              resolve(null);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 300000
            }
          );
        });
      }

      // Native implementation
      if (!permissions.foreground) {
        const granted = await requestPermissions();
        if (!granted) {
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (err) {
      let errorMessage = 'Failed to get current location';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Handle GeolocationPositionError and other objects
        if ('code' in err) {
          const code = (err as any).code;
          const message = (err as any).message || 'Unknown error';
          switch (code) {
            case 1:
              errorMessage = 'Location access denied';
              break;
            case 2:
              errorMessage = 'Location unavailable';
              break;
            case 3:
              errorMessage = 'Location request timeout';
              break;
            default:
              errorMessage = `Location error (${code}): ${message}`;
              break;
          }
        } else {
          errorMessage = 'Location service error';
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Error getting current location:', errorMessage, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissions.foreground, requestPermissions]);

  const watchLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Location watching not supported on web');
        return;
      }

      if (!permissions.foreground) {
        const granted = await requestPermissions();
        if (!granted) {
          return;
        }
      }

      // Stop existing subscription
      if (locationSubscriptionRef.current) {
        try {
          // Handle different subscription types
          if (typeof locationSubscriptionRef.current.remove === 'function') {
            locationSubscriptionRef.current.remove();
          } else if (typeof locationSubscriptionRef.current === 'function') {
            locationSubscriptionRef.current();
          } else if (locationSubscriptionRef.current && typeof locationSubscriptionRef.current.unsubscribe === 'function') {
            locationSubscriptionRef.current.unsubscribe();
          }
        } catch (error) {
          console.log('Error stopping existing subscription:', error);
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update when moved 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          setCurrentLocation(locationData);
        }
      );

      locationSubscriptionRef.current = subscription;
    } catch (err) {
      let errorMessage = 'Failed to start location watching';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        if ('code' in err && 'message' in err) {
          errorMessage = `Location watch error (${err.code}): ${err.message}`;
        } else {
          errorMessage = JSON.stringify(err);
        }
      }
      
      setError(errorMessage);
      console.error('Error watching location:', errorMessage, err);
    }
  }, [permissions.foreground, requestPermissions]);

  const stopWatching = useCallback(() => {
    if (locationSubscriptionRef.current) {
      try {
        // Handle different subscription types
        if (typeof locationSubscriptionRef.current.remove === 'function') {
          locationSubscriptionRef.current.remove();
        } else if (typeof locationSubscriptionRef.current === 'function') {
          locationSubscriptionRef.current();
        } else if (locationSubscriptionRef.current && typeof locationSubscriptionRef.current.unsubscribe === 'function') {
          locationSubscriptionRef.current.unsubscribe();
        }
      } catch (error) {
        console.log('Location subscription already removed or invalid:', error);
      }
      locationSubscriptionRef.current = null;
    }
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        // Fallback for web - return coordinates as string
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
        ].filter(Boolean);
        
        return parts.join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }, []);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }, []);

  const searchLocation = useCallback(async (query: string): Promise<LocationData[]> => {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - return empty array
        console.log('Location search not supported on web');
        return [];
      }

      const results = await Location.geocodeAsync(query);
      
      return results.map(result => ({
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: null,
        timestamp: Date.now(),
      }));
    } catch (err) {
      console.error('Error searching location:', err);
      return [];
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationSubscriptionRef.current) {
        try {
          // Handle different subscription types
          if (typeof locationSubscriptionRef.current.remove === 'function') {
            locationSubscriptionRef.current.remove();
          } else if (typeof locationSubscriptionRef.current === 'function') {
            locationSubscriptionRef.current();
          } else if (locationSubscriptionRef.current && typeof locationSubscriptionRef.current.unsubscribe === 'function') {
            locationSubscriptionRef.current.unsubscribe();
          }
        } catch (error) {
          console.log('Location subscription cleanup error:', error);
        }
      }
    };
  }, []);

  return useMemo(() => ({
    currentLocation,
    permissions,
    isLoading,
    error,
    requestPermissions,
    requestBackgroundPermissions,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    reverseGeocode,
    calculateDistance,
    searchLocation,
  }), [
    currentLocation,
    permissions,
    isLoading,
    error,
    requestPermissions,
    requestBackgroundPermissions,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    reverseGeocode,
    calculateDistance,
    searchLocation,
  ]);
});