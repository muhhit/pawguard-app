import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { RealTimeMapView } from '../components/RealTimeMapView';
import { LocationProvider } from '../hooks/location-store';

// Mock data for demonstration
const mockPetLocations = [
  {
    id: '1',
    petId: 'pet_1',
    name: 'Max',
    type: 'dog' as const,
    latitude: 40.9876,
    longitude: 29.0346,
    timestamp: Date.now(),
    accuracy: 5,
    status: 'lost' as const,
    urgency: 'critical' as const,
    reward: 5000,
    lastSeen: '15 minutes ago',
    batteryLevel: 85,
    speed: 0,
    heading: 0,
  },
  {
    id: '2',
    petId: 'pet_2',
    name: 'Luna',
    type: 'cat' as const,
    latitude: 40.9856,
    longitude: 29.0326,
    timestamp: Date.now() - 3600000,
    accuracy: 8,
    status: 'lost' as const,
    urgency: 'high' as const,
    reward: 3000,
    lastSeen: '1 hour ago',
    batteryLevel: 45,
    speed: 2,
    heading: 180,
  },
  {
    id: '3',
    petId: 'pet_3',
    name: 'Charlie',
    type: 'dog' as const,
    latitude: 40.9896,
    longitude: 29.0366,
    timestamp: Date.now() - 7200000,
    accuracy: 12,
    status: 'lost' as const,
    urgency: 'high' as const,
    reward: 10000,
    lastSeen: '2 hours ago',
    batteryLevel: 15,
    speed: 1,
    heading: 90,
  },
  {
    id: '4',
    petId: 'pet_4',
    name: 'Bella',
    type: 'dog' as const,
    latitude: 40.9836,
    longitude: 29.0306,
    timestamp: Date.now() - 1800000,
    accuracy: 3,
    status: 'found' as const,
    urgency: 'medium' as const,
    reward: 2000,
    lastSeen: '30 minutes ago',
    batteryLevel: 92,
    speed: 0,
    heading: 0,
  },
  {
    id: '5',
    petId: 'pet_5',
    name: 'Milo',
    type: 'cat' as const,
    latitude: 40.9916,
    longitude: 29.0386,
    timestamp: Date.now() - 10800000,
    accuracy: 15,
    status: 'lost' as const,
    urgency: 'medium' as const,
    reward: 1500,
    lastSeen: '3 hours ago',
    batteryLevel: 68,
    speed: 0.5,
    heading: 270,
  },
];

const mockGeofences = [
  {
    id: '1',
    name: 'Home Safe Zone',
    latitude: 40.9876,
    longitude: 29.0346,
    radius: 200,
    type: 'safe' as const,
    active: true,
    color: '#4ECDC4',
  },
  {
    id: '2',
    name: 'Dog Park',
    latitude: 40.9856,
    longitude: 29.0326,
    radius: 150,
    type: 'safe' as const,
    active: true,
    color: '#4ECDC4',
  },
  {
    id: '3',
    name: 'Busy Road Alert',
    latitude: 40.9896,
    longitude: 29.0366,
    radius: 100,
    type: 'danger' as const,
    active: true,
    color: '#FF5252',
  },
];

export default function RealTimeMapDemo() {
  const [petLocations, setPetLocations] = useState(mockPetLocations);
  const [geofences, setGeofences] = useState(mockGeofences);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [showAR, setShowAR] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPetLocations(prevLocations => 
        prevLocations.map(pet => {
          if (pet.status === 'lost' && Math.random() > 0.7) {
            // Simulate small movement for lost pets
            const latOffset = (Math.random() - 0.5) * 0.001;
            const lngOffset = (Math.random() - 0.5) * 0.001;
            
            return {
              ...pet,
              latitude: pet.latitude + latOffset,
              longitude: pet.longitude + lngOffset,
              timestamp: Date.now(),
              accuracy: Math.random() * 20 + 3,
              speed: Math.random() * 5,
              heading: Math.random() * 360,
              batteryLevel: Math.max(0, pet.batteryLevel - Math.random() * 2),
            };
          }
          return pet;
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePetSelect = (pet: any) => {
    console.log('Selected pet:', pet);
  };

  const handleGeofenceCreate = (zone: any) => {
    const newZone = {
      ...zone,
      id: Date.now().toString(),
    };
    setGeofences(prev => [...prev, newZone]);
    console.log('Created geofence:', newZone);
  };

  const handleLocationUpdate = (location: any) => {
    console.log('Location update:', location);
    // Handle real-time location updates from WebSocket
  };

  return (
    <LocationProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'} 
          backgroundColor="#1A1A2E" 
        />
        <RealTimeMapView
          petLocations={petLocations}
          geofences={geofences}
          showHeatmap={showHeatmap}
          show3D={show3D}
          showAR={showAR}
          onPetSelect={handlePetSelect}
          onGeofenceCreate={handleGeofenceCreate}
          onLocationUpdate={handleLocationUpdate}
          clustered={true}
          offlineMode={false}
        />
      </SafeAreaView>
    </LocationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
});