import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';

interface FilterChip {
  id: string;
  label: string;
  selected: boolean;
}

interface FilterChipsProps {
  items: string[];
  selectedItems?: string[];
  onItemPress?: (item: string) => void;
  onClearAll?: () => void;
}

export default function FilterChips({ 
  items, 
  selectedItems = [], 
  onItemPress,
  onClearAll 
}: FilterChipsProps) {
  const chips: FilterChip[] = items.map(item => ({
    id: item,
    label: item,
    selected: selectedItems.includes(item),
  }));

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.chip,
              chip.selected && styles.chipSelected,
            ]}
            onPress={() => onItemPress?.(chip.id)}
          >
            <Text
              style={[
                styles.chipText,
                chip.selected && styles.chipTextSelected,
              ]}
            >
              {chip.label}
            </Text>
            {chip.selected && (
              <X color="#FFFFFF" size={14} style={styles.chipIcon} />
            )}
          </TouchableOpacity>
        ))}
        
        {selectedItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={onClearAll}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipIcon: {
    marginLeft: 6,
  },
  clearAllButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});