import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/location-store';
import MapView from './MapView';

interface PetLocation {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  latitude: number;
  longitude: number;
  timestamp: number;
  status: 'lost' | 'found' | 'safe' | 'alert';
  reward?: number;
}

interface RealTimeMapViewProps {
  petLocations: PetLocation[];
  showHeatmap?: boolean;
  onPetSelect?: (pet: PetLocation) => void;
  clustered?: boolean;
  geofences?: any[];
  show3D?: boolean;
  showAR?: boolean;
  onGeofenceCreate?: (geofence: any) => void;
  onLocationUpdate?: (location: any) => void;
  offlineMode?: boolean;
}

export const RealTimeMapView: React.FC<RealTimeMapViewProps> = ({
  petLocations = [],
  showHeatmap = false,
  onPetSelect,
  clustered = true,
  geofences = [],
  show3D = false,
  showAR = false,
  onGeofenceCreate,
  onLocationUpdate,
  offlineMode = false,
}) => {
  const { currentLocation } = useLocation();
  const [selectedPet, setSelectedPet] = useState<PetLocation | null>(null);



  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        centerLocation={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: '',
          timestamp: Date.now(),
          accuracy: 0
        } : null}
        pets={petLocations.map(pet => ({
          id: pet.id,
          name: pet.name,
          type: pet.type as 'dog' | 'cat',
          owner_id: '',
          breed: '',
          age: '0',
          weight: 0,
          color: '',
          description: '',
          microchip_id: '',
          is_lost: pet.status === 'lost',
          is_found: pet.status === 'found',
          last_location: {
            lat: pet.latitude,
            lng: pet.longitude,
            address: '',
            timestamp: pet.timestamp
          },
          reward_amount: pet.reward || 0,
          photos: [],
          medical_records: [],
          created_at: '',
          updated_at: ''
        }))}
        enableClustering={clustered}
        enableHeatmap={showHeatmap}
        userType="public"
      />

      {/* Simple status display */}
      {selectedPet && (
        <View style={styles.selectedPetInfo}>
          <Text style={styles.selectedPetName}>{selectedPet.name}</Text>
          <Text style={styles.selectedPetType}>{selectedPet.type}</Text>
          {selectedPet.reward && (
            <Text style={styles.selectedPetReward}>Reward: ₺{selectedPet.reward}</Text>
          )}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedPet(null)}
          >
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Pet count display */}
      <View style={styles.petCount}>
        <Text style={styles.petCountText}>
          {petLocations.length} pets {petLocations.filter(p => p.status === 'lost').length > 0 && `(${petLocations.filter(p => p.status === 'lost').length} lost)`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  selectedPetInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPetName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  selectedPetType: {
    color: '#AAA',
    fontSize: 14,
    marginRight: 12,
  },
  selectedPetReward: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCount: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  petCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});