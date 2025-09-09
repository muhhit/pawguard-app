import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { X, Search, MapPin, ChevronRight } from 'lucide-react-native';
import { 
  TURKISH_NEIGHBORHOODS, 
  getCities, 
  getNeighborhoodsByCity,
  getRegionsByCity,
  type Neighborhood 
} from '@/constants/neighborhoods';

interface NeighborhoodSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (neighborhood: Neighborhood) => void;
  selectedNeighborhood?: Neighborhood;
}

export default function NeighborhoodSelectionModal({
  visible,
  onClose,
  onSelect,
  selectedNeighborhood,
}: NeighborhoodSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const cities = useMemo(() => getCities(), []);

  const regions = useMemo(() => {
    if (!selectedCity) return [];
    return getRegionsByCity(selectedCity);
  }, [selectedCity]);

  const filteredNeighborhoods = useMemo(() => {
    let neighborhoods = TURKISH_NEIGHBORHOODS;

    // Filter by city
    if (selectedCity) {
      neighborhoods = getNeighborhoodsByCity(selectedCity);
    }

    // Filter by region
    if (selectedRegion) {
      neighborhoods = neighborhoods.filter(n => n.region === selectedRegion);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      neighborhoods = neighborhoods.filter(n => 
        n.name.toLowerCase().includes(query) ||
        n.city.toLowerCase().includes(query) ||
        n.region.toLowerCase().includes(query)
      );
    }

    return neighborhoods;
  }, [selectedCity, selectedRegion, searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedRegion('');
  };

  const handleSelect = (neighborhood: Neighborhood) => {
    onSelect(neighborhood);
    onClose();
    handleReset();
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MapPin color="#FF6B6B" size={24} />
            <Text style={styles.headerTitle}>Mahalle Seçin</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color="#94A3B8" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Mahalle, şehir veya bölge ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedCity && !selectedRegion && !searchQuery && styles.filterChipActive
              ]}
              onPress={handleReset}
            >
              <Text style={[
                styles.filterChipText,
                !selectedCity && !selectedRegion && !searchQuery && styles.filterChipTextActive
              ]}>
                Tümü
              </Text>
            </TouchableOpacity>

            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.filterChip,
                  selectedCity === city && styles.filterChipActive
                ]}
                onPress={() => {
                  setSelectedCity(selectedCity === city ? '' : city);
                  setSelectedRegion('');
                }}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCity === city && styles.filterChipTextActive
                ]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Region filters (if city selected) */}
        {selectedCity && regions.length > 0 && (
          <View style={styles.regionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {regions.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionChip,
                    selectedRegion === region && styles.regionChipActive
                  ]}
                  onPress={() => {
                    setSelectedRegion(selectedRegion === region ? '' : region);
                  }}
                >
                  <Text style={[
                    styles.regionChipText,
                    selectedRegion === region && styles.regionChipTextActive
                  ]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results */}
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {filteredNeighborhoods.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin color="#CBD5E1" size={48} />
              <Text style={styles.emptyStateTitle}>Mahalle bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Arama kriterlerinizi değiştirmeyi deneyin
              </Text>
            </View>
          ) : (
            filteredNeighborhoods.map((neighborhood) => (
              <TouchableOpacity
                key={neighborhood.id}
                style={[
                  styles.neighborhoodItem,
                  selectedNeighborhood?.id === neighborhood.id && styles.neighborhoodItemSelected
                ]}
                onPress={() => handleSelect(neighborhood)}
              >
                <View style={styles.neighborhoodInfo}>
                  <Text style={styles.neighborhoodName}>{neighborhood.name}</Text>
                  <Text style={styles.neighborhoodDetails}>
                    {neighborhood.city} • {neighborhood.region}
                  </Text>
                </View>
                <ChevronRight color="#94A3B8" size={20} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Selected neighborhood info */}
        {selectedNeighborhood && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Seçili Mahalle:</Text>
            <Text style={styles.selectedText}>
              {selectedNeighborhood.name}, {selectedNeighborhood.city}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
    marginRight: 4,
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  regionsContainer: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  regionChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
    marginRight: 4,
  },
  regionChipActive: {
    backgroundColor: '#4F46E5',
  },
  regionChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  regionChipTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  neighborhoodItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  neighborhoodItemSelected: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  neighborhoodInfo: {
    flex: 1,
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  neighborhoodDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});