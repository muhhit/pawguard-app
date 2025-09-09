import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, Users, Package } from 'lucide-react-native';
import { type FeedingPoint } from '@/hooks/events-store';

interface FeedingEventProps {
  feedingPoint: FeedingPoint;
  onJoin: (feedingId: string) => void;
  isJoining?: boolean;
}

export const FeedingEvent: React.FC<FeedingEventProps> = ({ 
  feedingPoint, 
  onJoin, 
  isJoining = false 
}) => {
  const { id, location, time, volunteers, description, supplies_needed } = feedingPoint;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <MapPin color="#8B5CF6" size={16} />
            <Text style={styles.locationText}>{location.address}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock color="#64748B" size={14} />
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>
        <View style={styles.volunteersInfo}>
          <View style={styles.volunteersRow}>
            <Users color="#10B981" size={16} />
            <Text style={styles.volunteersText}>{volunteers.length} gönüllü</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>

      {supplies_needed.length > 0 && (
        <View style={styles.suppliesContainer}>
          <View style={styles.suppliesHeader}>
            <Package color="#F59E0B" size={16} />
            <Text style={styles.suppliesTitle}>İhtiyaç Listesi:</Text>
          </View>
          <View style={styles.suppliesRow}>
            {supplies_needed.map((supply, index) => (
              <View key={index} style={styles.supplyChip}>
                <Text style={styles.supplyText}>{supply}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.joinButton, isJoining && styles.joinButtonDisabled]}
        onPress={() => onJoin(id)}
        disabled={isJoining}
      >
        <LinearGradient
          colors={isJoining ? ['#94A3B8', '#64748B'] : ['#10B981', '#059669']}
          style={styles.joinButtonGradient}
        >
          <Text style={styles.joinButtonText}>
            {isJoining ? 'Katılıyor...' : 'Beslemeye Katıl'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  volunteersInfo: {
    alignItems: 'flex-end',
  },
  volunteersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  volunteersText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  suppliesContainer: {
    marginBottom: 16,
  },
  suppliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  suppliesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  suppliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  supplyChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  supplyText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});