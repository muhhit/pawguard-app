import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { Pet } from '@/hooks/pet-store';
import { LocationData } from '@/hooks/location-store';

export interface MapViewProps {
  style?: ViewStyle;
  onLocationSelect?: (location: LocationData) => void;
  showAddLocationButton?: boolean;
  centerLocation?: LocationData | null;
  pets?: Pet[];
  enableClustering?: boolean;
  enableHeatmap?: boolean;
  userType?: 'owner' | 'public' | 'finder';
}

// Platform-specific component loading with error handling
const MapView: React.FC<MapViewProps> = (props) => {
  try {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const MapViewWeb = require('./MapView.web').default;
      return <MapViewWeb {...props} />;
    } else {
      // Use our custom MapView wrapper that handles react-native-maps
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const MapViewNative = require('./MapView.native').default;
      return <MapViewNative {...props} />;
    }
  } catch (error) {
    console.error('MapView loading error:', error);
    // Fallback to web version if native fails
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MapViewWeb = require('./MapView.web').default;
    return <MapViewWeb {...props} />;
  }
};

export default MapView;

