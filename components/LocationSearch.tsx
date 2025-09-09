import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, X } from 'lucide-react-native';
import { useLocation, LocationData } from '@/hooks/location-store';

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
  onClose: () => void;
  placeholder?: string;
}

export default function LocationSearch({ onLocationSelect, onClose, placeholder = "Search for an address..." }: LocationSearchProps) {
  const { searchLocation, reverseGeocode } = useLocation();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const locations = await searchLocation(searchQuery);
      
      // Add addresses to results
      const locationsWithAddresses = await Promise.all(
        locations.map(async (location) => {
          const address = await reverseGeocode(location.latitude, location.longitude);
          return { ...location, address };
        })
      );
      
      setResults(locationsWithAddresses);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchLocation, reverseGeocode]);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(text);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const handleLocationPress = useCallback((location: LocationData) => {
    onLocationSelect(location);
    onClose();
  }, [onLocationSelect, onClose]);

  const renderLocationItem = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleLocationPress(item)}
    >
      <MapPin color="#FF6B6B" size={20} />
      <View style={styles.resultContent}>
        <Text style={styles.resultAddress}>{item.address}</Text>
        <Text style={styles.resultCoords}>
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color="#64748B" size={20} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            autoFocus
          />
          {isSearching && <ActivityIndicator size="small" color="#FF6B6B" />}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color="#64748B" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        renderItem={renderLocationItem}
        keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query.trim() && !isSearching ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No locations found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
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
  closeButton: {
    padding: 4,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultAddress: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 4,
  },
  resultCoords: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
});