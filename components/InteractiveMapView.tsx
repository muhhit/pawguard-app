import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/location-store';
import { usePets, Pet } from '@/hooks/pet-store';
import { useLanguage } from '@/hooks/language-store';
import { normalizePet } from '@/utils/normalizePet';
import MapView from './MapView';
import GlassContainer from './GlassContainer';

interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  type: 'lost' | 'found' | 'sighting' | 'user';
  pet?: Pet;
  title: string;
  subtitle?: string;
  reward?: number;
  timePosted?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

interface MapCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  pins: MapPin[];
}

interface FilterOptions {
  petType: 'all' | 'dog' | 'cat' | 'bird' | 'other';
  rewardRange: [number, number];
  timeRange: 'all' | '24h' | '7d' | '30d';
  urgency: 'all' | 'critical' | 'high' | 'medium' | 'low';
  showFound: boolean;
  searchRadius: number; // in kilometers
}

interface InteractiveMapViewProps {
  onPetSelect?: (pet: Pet) => void;
  showFilters?: boolean;
  initialFilters?: Partial<FilterOptions>;
}

const { height: screenHeight } = Dimensions.get('window');

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  onPetSelect,
  showFilters = true,
  initialFilters = {},
}) => {
  const insets = useSafeAreaInsets();
  const { currentLocation, getCurrentLocation, calculateDistance } = useLocation();
  const { nearbyPets, pets } = usePets();
  const { t } = useLanguage();

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<MapCluster | null>(null);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterOptions>({
    petType: 'all',
    rewardRange: [0, 10000],
    timeRange: 'all',
    urgency: 'all',
    showFound: true,
    searchRadius: 10,
    ...initialFilters,
  });

  // Initialize location
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Convert pets to map pins
  const mapPins = useMemo<MapPin[]>(() => {
    const allPets = [...nearbyPets, ...pets];
    const pins: MapPin[] = [];

    // Add user location pin
    if (currentLocation) {
      pins.push({
        id: 'user-location',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        type: 'user',
        title: t('map.yourLocation'),
        subtitle: t('map.currentPosition'),
      });
    }

    // Add pet pins
    allPets.forEach((rawPet) => {
      const pet = normalizePet(rawPet);
      if (!pet.last_location) return;

      // Apply filters
      if (filters.petType !== 'all' && pet.type !== filters.petType) return;
      if (pet.reward_amount < filters.rewardRange[0] || pet.reward_amount > filters.rewardRange[1]) return;
      if (!filters.showFound && pet.is_found) return;

      // Time filter
      if (filters.timeRange !== 'all') {
        const petTime = new Date(pet.created_at).getTime();
        const now = Date.now();
        const timeLimit = {
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
        }[filters.timeRange];
        
        if (now - petTime > timeLimit) return;
      }

      // Distance filter
      if (currentLocation) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          pet.last_location.lat,
          pet.last_location.lng
        );
        if (distance > filters.searchRadius) return;
      }

      // Determine urgency based on time and reward
      const daysSincePosted = Math.floor((Date.now() - new Date(pet.created_at).getTime()) / (1000 * 60 * 60 * 24));
      let urgency: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      
      if (daysSincePosted === 0 && pet.reward_amount > 500) urgency = 'critical';
      else if (daysSincePosted <= 1 || pet.reward_amount > 300) urgency = 'high';
      else if (daysSincePosted <= 7) urgency = 'medium';
      else urgency = 'low';

      if (filters.urgency !== 'all' && urgency !== filters.urgency) return;

      pins.push({
        id: pet.id,
        latitude: pet.last_location.lat,
        longitude: pet.last_location.lng,
        type: pet.is_found ? 'found' : 'lost',
        pet,
        title: pet.name,
        subtitle: `${pet.type} • ${pet.breed || t('map.mixedBreed')}`,
        reward: pet.reward_amount,
        timePosted: pet.created_at,
        urgency,
      });
    });

    return pins;
  }, [nearbyPets, pets, currentLocation, filters, calculateDistance, t]);

  // Create clusters for nearby pins
  const mapClusters = useMemo<MapCluster[]>(() => {
    const clusters: MapCluster[] = [];
    const processedPins = new Set<string>();
    const CLUSTER_RADIUS = 0.01; // ~1km

    mapPins.forEach((pin) => {
      if (processedPins.has(pin.id) || pin.type === 'user') return;

      const nearbyPins = mapPins.filter((otherPin) => {
        if (otherPin.id === pin.id || processedPins.has(otherPin.id) || otherPin.type === 'user') return false;
        
        const distance = Math.sqrt(
          Math.pow(pin.latitude - otherPin.latitude, 2) + 
          Math.pow(pin.longitude - otherPin.longitude, 2)
        );
        
        return distance <= CLUSTER_RADIUS;
      });

      if (nearbyPins.length > 0) {
        const allPins = [pin, ...nearbyPins];
        const centerLat = allPins.reduce((sum, p) => sum + p.latitude, 0) / allPins.length;
        const centerLng = allPins.reduce((sum, p) => sum + p.longitude, 0) / allPins.length;

        clusters.push({
          id: `cluster-${pin.id}`,
          latitude: centerLat,
          longitude: centerLng,
          count: allPins.length,
          pins: allPins,
        });

        allPins.forEach(p => processedPins.add(p.id));
      }
    });

    return clusters;
  }, [mapPins]);

  // Get pins to display (individual pins + clusters)
  const displayPins = useMemo(() => {
    const clusteredPinIds = new Set(mapClusters.flatMap(c => c.pins.map(p => p.id)));
    const individualPins = mapPins.filter(pin => !clusteredPinIds.has(pin.id));
    return individualPins;
  }, [mapPins, mapClusters]);

  const handlePinPress = useCallback((pin: MapPin) => {
    setSelectedPin(pin);
    if (pin.pet && onPetSelect) {
      onPetSelect(pin.pet);
    }
  }, [onPetSelect]);

  const handleClusterPress = useCallback((cluster: MapCluster) => {
    setSelectedCluster(cluster);
  }, []);



  const updateFilter = useCallback(<K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFCC00';
      case 'low': return '#34C759';
      default: return '#007AFF';
    }
  };

  const getPinColor = (type: string, urgency?: string) => {
    switch (type) {
      case 'lost': return urgency ? getUrgencyColor(urgency) : '#FF3B30';
      case 'found': return '#34C759';
      case 'sighting': return '#007AFF';
      case 'user': return '#5856D6';
      default: return '#8E8E93';
    }
  };

  const filteredPetsCount = displayPins.filter(p => p.type === 'lost').length + 
    mapClusters.reduce((sum, c) => sum + c.pins.filter(p => p.type === 'lost').length, 0);

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
        pets={displayPins.filter(p => p.pet).map(p => p.pet!)}
        enableClustering={true}
        enableHeatmap={false}
        userType="public"
        onLocationSelect={(location) => {
          console.log('Location selected:', location);
        }}
      />

      {/* Search radius indicator */}
      {currentLocation && (
        <View style={[styles.radiusIndicator, { top: insets.top + 60 }]}>
          <Text style={styles.radiusText}>
            {t('map.searchRadius')}: {filters.searchRadius}km
          </Text>
        </View>
      )}

      {/* Pet count display */}
      <View style={[styles.petCount, { top: insets.top + 20 }]}>
        <Ionicons name="location" size={16} color="#FFF" />
        <Text style={styles.petCountText}>
          {filteredPetsCount} {t('map.lostPetsNearby')}
        </Text>
      </View>

      {/* Filter button */}
      {showFilters && (
        <TouchableOpacity
          style={[styles.filterButton, { top: insets.top + 20 }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={20} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Selected pin info */}
      {selectedPin && (
        <GlassContainer style={styles.selectedPinInfo}>
          <View style={styles.pinInfoHeader}>
            <View style={styles.pinInfoMain}>
              <Text style={styles.pinInfoTitle}>{selectedPin.title}</Text>
              {selectedPin.subtitle && (
                <Text style={styles.pinInfoSubtitle}>{selectedPin.subtitle}</Text>
              )}
              {selectedPin.reward && selectedPin.reward > 0 && (
                <Text style={styles.pinInfoReward}>
                  {t('map.reward')}: ₺{selectedPin.reward}
                </Text>
              )}
              {selectedPin.urgency && selectedPin.type === 'lost' && (
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(selectedPin.urgency) }]}>
                  <Text style={styles.urgencyText}>
                    {t(selectedPin.urgency.toUpperCase())}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPin(null)}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {selectedPin.pet && (
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                if (onPetSelect && selectedPin.pet) {
                  onPetSelect(selectedPin.pet);
                }
                setSelectedPin(null);
              }}
            >
              <Text style={styles.viewDetailsText}>{t('map.viewDetails')}</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          )}
        </GlassContainer>
      )}

      {/* Cluster modal */}
      <Modal
        visible={!!selectedCluster}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCluster(null)}
      >
        <View style={styles.modalOverlay}>
          <GlassContainer style={styles.clusterModal}>
            <View style={styles.clusterHeader}>
              <Text style={styles.clusterTitle}>
                {selectedCluster?.count} {t('map.petsInThisArea')}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCluster(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.clusterList}>
              {selectedCluster?.pins.map((pin) => (
                <TouchableOpacity
                  key={pin.id}
                  style={styles.clusterItem}
                  onPress={() => {
                    setSelectedCluster(null);
                    handlePinPress(pin);
                  }}
                >
                  <View style={[styles.pinTypeIndicator, { backgroundColor: getPinColor(pin.type, pin.urgency) }]} />
                  <View style={styles.clusterItemInfo}>
                    <Text style={styles.clusterItemTitle}>{pin.title}</Text>
                    {pin.subtitle && (
                      <Text style={styles.clusterItemSubtitle}>{pin.subtitle}</Text>
                    )}
                    {pin.reward && pin.reward > 0 && (
                      <Text style={styles.clusterItemReward}>₺{pin.reward}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassContainer>
        </View>
      </Modal>

      {/* Filter modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassContainer style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>{t('map.mapFilters')}</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterContent}>
              {/* Pet Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>{t('map.petType')}</Text>
                <View style={styles.filterOptions}>
                  {['all', 'dog', 'cat', 'bird', 'other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        filters.petType === type && styles.filterOptionActive
                      ]}
                      onPress={() => updateFilter('petType', type as any)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.petType === type && styles.filterOptionTextActive
                      ]}>
                        {t(`map.${type}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>{t('map.timePosted')}</Text>
                <View style={styles.filterOptions}>
                  {[{ key: 'all', label: 'All time' }, { key: '24h', label: 'Last 24 hours' }, { key: '7d', label: 'Last 7 days' }, { key: '30d', label: 'Last 30 days' }].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.filterOption,
                        filters.timeRange === option.key && styles.filterOptionActive
                      ]}
                      onPress={() => updateFilter('timeRange', option.key as any)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.timeRange === option.key && styles.filterOptionTextActive
                      ]}>
                        {t(option.label)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Urgency Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>{t('map.urgencyLevel')}</Text>
                <View style={styles.filterOptions}>
                  {['all', 'critical', 'high', 'medium', 'low'].map((urgency) => (
                    <TouchableOpacity
                      key={urgency}
                      style={[
                        styles.filterOption,
                        filters.urgency === urgency && styles.filterOptionActive,
                        urgency !== 'all' && { borderColor: getUrgencyColor(urgency) }
                      ]}
                      onPress={() => updateFilter('urgency', urgency as any)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        filters.urgency === urgency && styles.filterOptionTextActive
                      ]}>
                        {t(`map.${urgency}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Search Radius */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {t('map.searchRadius')}: {filters.searchRadius}km
                </Text>
                <View style={styles.radiusOptions}>
                  {[1, 5, 10, 25, 50].map((radius) => (
                    <TouchableOpacity
                      key={radius}
                      style={[
                        styles.radiusOption,
                        filters.searchRadius === radius && styles.radiusOptionActive
                      ]}
                      onPress={() => updateFilter('searchRadius', radius)}
                    >
                      <Text style={[
                        styles.radiusOptionText,
                        filters.searchRadius === radius && styles.radiusOptionTextActive
                      ]}>
                        {radius}km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Show Found Pets Toggle */}
              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => updateFilter('showFound', !filters.showFound)}
              >
                <Text style={styles.toggleText}>{t('map.showFoundPets')}</Text>
                <View style={[styles.toggle, filters.showFound && styles.toggleActive]}>
                  {filters.showFound && <View style={styles.toggleIndicator} />}
                </View>
              </TouchableOpacity>
            </ScrollView>
          </GlassContainer>
        </View>
      </Modal>
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
  petCount: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  petCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  radiusIndicator: {
    position: 'absolute',
    left: 20,
    backgroundColor: 'rgba(0,122,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  radiusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '500',
  },
  filterButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPinInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
  },
  pinInfoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  pinInfoMain: {
    flex: 1,
    marginRight: 12,
  },
  pinInfoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  pinInfoSubtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
  },
  pinInfoReward: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  urgencyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  viewDetailsText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  clusterModal: {
    maxHeight: screenHeight * 0.7,
    margin: 20,
    borderRadius: 16,
  },
  clusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  clusterTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  clusterList: {
    maxHeight: screenHeight * 0.5,
  },
  clusterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pinTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  clusterItemInfo: {
    flex: 1,
  },
  clusterItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  clusterItemSubtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 4,
  },
  clusterItemReward: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  filterModal: {
    maxHeight: screenHeight * 0.8,
    margin: 20,
    borderRadius: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    fontWeight: '600',
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  radiusOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radiusOptionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  radiusOptionTextActive: {
    fontWeight: '600',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    alignSelf: 'flex-end',
  },
});