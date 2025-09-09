import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { MapPin, Navigation, Shield, Clock, Search, Settings, List, Map, AlertTriangle, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePets, Pet } from "@/hooks/pet-store";
import { useLocation, LocationData } from "@/hooks/location-store";
import { useNotifications } from "@/hooks/notification-store";
import { useReferrals } from "@/hooks/referral-store";
import MapView from "@/components/MapView";
import LocationSearch from "@/components/LocationSearch";
import PetCard from "@/components/PetCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { NoNearbyPetsEmpty, ErrorEmpty } from "@/components/EmptyStates";
import { useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

function TrackingScreen() {
  const params = useLocalSearchParams<{
    showPetOnMap?: string;
    petId?: string;
    petName?: string;
    petLat?: string;
    petLng?: string;
  }>();
  
  const { pets, nearbyPets } = usePets();
  const { 
    currentLocation, 
    getCurrentLocation, 
    watchLocation, 
    stopWatching, 
    calculateDistance, 
    reverseGeocode,
    requestBackgroundPermissions,
    permissions 
  } = useLocation();
  const { sendNearbyPetAlert, hasPermission: hasNotificationPermission } = useNotifications();
  const { sendEmergencyBroadcast } = useReferrals();
  
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState<boolean>(false);
  const [petDistances, setPetDistances] = useState<Record<string, number>>({});
  const [petAddresses, setPetAddresses] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [focusedPetLocation, setFocusedPetLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [isLoadingPets, setIsLoadingPets] = useState<boolean>(false);
  
  // Mock live data for modern design
  const liveStats = {
    activeSearches: 24,
    foundRate: 89,
    volunteers: 847
  };
  
  const liveUpdates = [
    {
      id: '1',
      type: 'sighting',
      petName: 'Max',
      location: 'Kadıköy, Moda Sahil',
      timeAgo: '3 dk önce',
      description: 'Beyaz tekir, mavi tasmalı',
      icon: MapPin,
      color: '#3B82F6'
    },
    {
      id: '2',
      type: 'found',
      petName: 'Minnoş',
      location: 'Üsküdar',
      timeAgo: '15 dk önce',
      description: 'Bulundu ve ailesine kavuştu',
      icon: Heart,
      color: '#10B981'
    }
  ];

  // Handle incoming pet location from home screen
  useEffect(() => {
    if (params.showPetOnMap === 'true' && params.petLat && params.petLng) {
      const petLocation: LocationData = {
        latitude: parseFloat(params.petLat),
        longitude: parseFloat(params.petLng),
        accuracy: null,
        timestamp: Date.now(),
        address: `Pet Location: ${params.petName || 'Unknown'}`,
      };
      setFocusedPetLocation(petLocation);
      
      // Set the selected pet if we have the ID
      if (params.petId) {
        setSelectedPetId(params.petId);
      }
      
      console.log('Focusing on pet location:', petLocation);
    }
  }, [params.showPetOnMap, params.petLat, params.petLng, params.petId, params.petName]);

  // Start location tracking on mount with error handling
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setIsLoadingLocation(true);
        await getCurrentLocation();
        if (Platform.OS !== 'web') {
          watchLocation();
        }
      } catch (error) {
        console.error('Failed to initialize location:', error);
        // Continue without location - the app should still work
      } finally {
        setIsLoadingLocation(false);
      }
    };
    
    initializeLocation();
    
    return () => {
      try {
        stopWatching();
      } catch (error) {
        console.error('Error stopping location watch:', error);
      }
    };
  }, [getCurrentLocation, watchLocation, stopWatching]);

  // Calculate distances to pets when location changes
  useEffect(() => {
    if (currentLocation && nearbyPets.length > 0) {
      setIsLoadingPets(true);
      const distances: Record<string, number> = {};
      nearbyPets.forEach(pet => {
        if (pet.last_location) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            pet.last_location.lat,
            pet.last_location.lng
          );
          distances[pet.id] = distance;
        }
      });
      setPetDistances(distances);
      setIsLoadingPets(false);
    }
  }, [currentLocation, nearbyPets, calculateDistance]);

  // Get addresses for pet locations
  useEffect(() => {
    const getAddresses = async () => {
      const addresses: Record<string, string> = {};
      for (const pet of nearbyPets) {
        if (pet.last_location) {
          try {
            const address = await reverseGeocode(pet.last_location.lat, pet.last_location.lng);
            addresses[pet.id] = address;
          } catch (error) {
            console.error('Error getting address for pet:', pet.id, error);
          }
        }
      }
      setPetAddresses(addresses);
    };

    if (nearbyPets.length > 0) {
      getAddresses();
    }
  }, [nearbyPets, reverseGeocode]);

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate initial data loading

    return () => clearTimeout(timer);
  }, []);

  const selectedPet = nearbyPets.find((pet) => pet.id === selectedPetId) || nearbyPets[0];
  const selectedPetLocation = selectedPet?.last_location ? {
    latitude: selectedPet.last_location.lat,
    longitude: selectedPet.last_location.lng,
    accuracy: null,
    timestamp: Date.now(),
    address: petAddresses[selectedPet.id],
  } : null;

  const handleRequestBackgroundPermissions = useCallback(async () => {
    const granted = await requestBackgroundPermissions();
    if (granted) {
      Alert.alert(
        'Background Location Enabled',
        'You will now receive alerts when lost pets are spotted near you.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Permission Required',
        'Background location access is needed to send you alerts about lost pets in your area.',
        [{ text: 'OK' }]
      );
    }
  }, [requestBackgroundPermissions]);

  const handleLocationSearch = useCallback((location: LocationData) => {
    console.log('Selected location:', location);
    // Here you could center the map on the selected location
  }, []);

  const handleTestNotification = useCallback(async () => {
    if (selectedPet && petDistances[selectedPet.id] && hasNotificationPermission) {
      await sendNearbyPetAlert(selectedPet, petDistances[selectedPet.id]);
      Alert.alert(
        'Test Notification Sent',
        `Sent a test notification for ${selectedPet.name}`,
        [{ text: 'OK' }]
      );
    } else if (!hasNotificationPermission) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in Settings to receive alerts.',
        [{ text: 'OK' }]
      );
    }
  }, [selectedPet, petDistances, hasNotificationPermission, sendNearbyPetAlert]);

  const handleEmergencyBroadcast = useCallback(async () => {
    if (!selectedPet || !selectedPet.last_location) {
      Alert.alert('Error', 'No pet selected or location available');
      return;
    }

    Alert.alert(
      'Send Emergency Broadcast? 🚨',
      `This will notify all users within 3 miles about ${selectedPet.name}. This feature should only be used for genuine emergencies.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            await sendEmergencyBroadcast(selectedPet.id, {
              lat: selectedPet.last_location!.lat,
              lng: selectedPet.last_location!.lng
            });
          }
        }
      ]
    );
  }, [selectedPet, sendEmergencyBroadcast]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Memoized pets data with distances for FlashList
  const petsWithDistances = useMemo(() => {
    return nearbyPets.map(pet => ({
      ...pet,
      distance: petDistances[pet.id],
    })).sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return 0;
    });
  }, [nearbyPets, petDistances]);

  const renderPetCard = useCallback(({ item }: { item: Pet & { distance?: number } }) => {
    return (
      <PetCard 
        pet={item} 
        distance={item.distance} 
        showDistance={true}
        userType="public"
      />
    );
  }, []);

  const getItemType = useCallback(() => {
    return 'pet-card';
  }, []);

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          fullScreen
          text="Kayıp dostları arıyoruz..."
          variant="glass"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Stats Cards */}
      <View style={styles.statsContainer}>
        {isLoadingLocation ? (
          <LoadingSpinner 
            size="small" 
            text="Konum bilgileri yükleniyor..."
            variant="minimal"
          />
        ) : (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{liveStats.activeSearches}</Text>
              <Text style={styles.statLabel}>Aktif Arama</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{liveStats.foundRate}%</Text>
              <Text style={styles.statLabel}>Bulunma Oranı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{liveStats.volunteers}</Text>
              <Text style={styles.statLabel}>Gönüllü</Text>
            </View>
          </>
        )}
      </View>

      {/* Live Feed */}
      <View style={styles.liveSection}>
        <View style={styles.liveFeedHeader}>
          <Text style={styles.liveFeedTitle}>Canlı Güncellemeler</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Canlı</Text>
          </View>
        </View>
        
        <ScrollView style={styles.updatesContainer} showsVerticalScrollIndicator={false}>
          {liveUpdates.map((update) => {
            const IconComponent = update.icon;
            return (
              <View key={update.id} style={styles.updateCard}>
                <View style={[styles.updateIcon, { backgroundColor: `${update.color}20` }]}>
                  <IconComponent color={update.color} size={20} />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>
                    {update.type === 'sighting' ? 'Yeni Görülme: ' : 'Bulundu: '}{update.petName}
                  </Text>
                  <Text style={styles.updateLocation}>{update.location} • {update.timeAgo}</Text>
                  {update.description && (
                    <View style={styles.updateDescription}>
                      <Text style={styles.updateDescriptionText}>"{update.description}"</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Heat Map Preview */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        style={styles.heatMapCard}
      >
        <View style={styles.heatMapHeader}>
          <Text style={styles.heatMapTitle}>Yoğunluk Haritası</Text>
          <Map color="#FFFFFF" size={20} />
        </View>
        <View style={styles.heatMapGrid}>
          {Array.from({ length: 16 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.heatMapCell,
                { opacity: 0.1 + Math.random() * 0.4 }
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {nearbyPets.length === 0 ? (
        <NoNearbyPetsEmpty onRefresh={() => {
          console.log('Refreshing nearby pets...');
          // Add refresh logic here
        }} />
      ) : (
        <>
          {viewMode === 'map' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.petSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {nearbyPets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.petTab,
                        selectedPetId === pet.id && styles.selectedPetTab,
                      ]}
                      onPress={() => setSelectedPetId(pet.id)}
                    >
                      <View style={styles.petTabContent}>
                        <Text
                          style={[
                            styles.petTabText,
                            selectedPetId === pet.id && styles.selectedPetTabText,
                          ]}
                        >
                          {pet.name}
                        </Text>
                        {petDistances[pet.id] && (
                          <Text
                            style={[
                              styles.petTabDistance,
                              selectedPetId === pet.id && styles.selectedPetTabDistance,
                            ]}
                          >
                            {formatDistance(petDistances[pet.id])}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.mapContainer}>
                {isLoadingPets ? (
                  <View style={styles.mapLoadingContainer}>
                    <LoadingSpinner 
                      text="Harita yükleniyor..."
                      variant="minimal"
                    />
                  </View>
                ) : (
                  <MapView 
                    centerLocation={focusedPetLocation || selectedPetLocation}
                    pets={nearbyPets}
                    enableClustering={nearbyPets.length >= 50}
                    enableHeatmap={nearbyPets.length > 10}
                    userType="public"
                  />
                )}
              </View>

              {selectedPet && (
                <View style={styles.locationInfo}>
                  <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                      <MapPin color="#FF6B6B" size={20} />
                      <Text style={styles.infoTitle}>Last Seen Location</Text>
                    </View>
                    <Text style={styles.petName}>{selectedPet.name}</Text>
                    {selectedPetLocation?.address && (
                      <Text style={styles.address}>{selectedPetLocation.address}</Text>
                    )}
                    {petDistances[selectedPet.id] && (
                      <View style={styles.distanceInfo}>
                        <Navigation color="#64748B" size={16} />
                        <Text style={styles.distanceText}>
                          {formatDistance(petDistances[selectedPet.id])} from your location
                        </Text>
                      </View>
                    )}
                    <View style={styles.timestamp}>
                      <Clock color="#64748B" size={16} />
                      <Text style={styles.timestampText}>
                        Reported: {new Date(selectedPet.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                      <Shield color="#F59E0B" size={20} />
                      <Text style={styles.infoTitle}>Pet Status</Text>
                    </View>
                    <View style={styles.safetyStatus}>
                      <View style={[styles.statusDot, { backgroundColor: "#F59E0B" }]} />
                      <Text style={[styles.safetyText, { color: "#F59E0B" }]}>Missing</Text>
                    </View>
                    <Text style={styles.safetySubtext}>
                      {selectedPet.reward_amount > 0 
                        ? `Reward: ${selectedPet.reward_amount}` 
                        : 'Help reunite this pet with their family'}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.actions}>
                {!permissions.background && (
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={handleRequestBackgroundPermissions}
                  >
                    <Text style={styles.actionButtonText}>Enable Location Alerts</Text>
                  </TouchableOpacity>
                )}
                
                {permissions.background && (
                  <View style={styles.permissionGranted}>
                    <Shield color="#10B981" size={20} />
                    <Text style={styles.permissionText}>Location alerts enabled</Text>
                  </View>
                )}
                
                {selectedPet && hasNotificationPermission && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.secondaryButton]} 
                    onPress={handleTestNotification}
                  >
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Test Notification</Text>
                  </TouchableOpacity>
                )}
                
                {selectedPet && selectedPet.last_location && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.emergencyButton]} 
                    onPress={handleEmergencyBroadcast}
                  >
                    <AlertTriangle color="#FFFFFF" size={20} />
                    <Text style={styles.actionButtonText}>Emergency Broadcast</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  {petsWithDistances.length} lost pets nearby
                </Text>
                <Text style={styles.listSubtitle}>
                  Sorted by distance from your location
                </Text>
              </View>
              
              {isLoadingPets ? (
                <LoadingSpinner 
                  text="Kayıp dostlar yükleniyor..."
                  style={{ marginTop: 40 }}
                />
              ) : (
                <FlashList
                  data={petsWithDistances}
                  renderItem={renderPetCard}
                  getItemType={getItemType}
                  estimatedItemSize={120}
                  removeClippedSubviews={true}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flashListContent}
                  testID="pets-flash-list"
                />
              )}
            </View>
          )}
        </>
      )}
      
      {/* Location Search Modal */}
      <Modal
        visible={showLocationSearch}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LocationSearch
          onLocationSelect={handleLocationSearch}
          onClose={() => setShowLocationSearch(false)}
          placeholder="Search for addresses or places..."
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  liveSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  liveFeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveFeedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    color: '#64748B',
  },
  updatesContainer: {
    maxHeight: 200,
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  updateLocation: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  updateDescription: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
  },
  updateDescriptionText: {
    fontSize: 12,
    color: '#64748B',
  },
  heatMapCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  heatMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heatMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heatMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heatMapCell: {
    width: (width - 80) / 4 - 6,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  petSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  petTab: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedPetTab: {
    backgroundColor: "#FF6B6B",
  },
  petTabContent: {
    alignItems: "center",
  },
  petTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  petTabDistance: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  selectedPetTabDistance: {
    color: "#FFFFFF",
  },
  selectedPetTabText: {
    color: "#FFFFFF",
  },
  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 14,
    color: "#64748B",
  },
  settingsButton: {
    backgroundColor: "#F1F5F9",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationInfo: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  timestamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timestampText: {
    fontSize: 14,
    color: "#64748B",
  },
  safetyStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  safetyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  safetySubtext: {
    fontSize: 14,
    color: "#64748B",
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#64748B",
  },
  emergencyButton: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  permissionGranted: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  activeToggleButton: {
    backgroundColor: "#FF6B6B",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  flashListContent: {
    paddingBottom: 20,
  },
  mapStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
});

export default TrackingScreen;