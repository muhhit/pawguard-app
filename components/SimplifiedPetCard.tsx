import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, MapPin, Phone } from 'lucide-react-native';
import OptimizedImage from './OptimizedImage';

interface SimplifiedPetCardProps {
  pet: {
    id: string;
    name: string;
    breed: string;
    photos: string[];
    location: string;
    timeAgo: string;
    isVerified: boolean;
    ownerPhone?: string;
    reward?: number;
    urgency: 'low' | 'high' | 'critical';
  };
  onPress: () => void;
  onCall: () => void;
  onLike: () => void;
}

export const SimplifiedPetCard: React.FC<SimplifiedPetCardProps> = ({ 
  pet, 
  onPress, 
  onCall, 
  onLike 
}) => {
  const getUrgencyColor = () => {
    switch (pet.urgency) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <BlurView intensity={20} style={styles.cardBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.cardGradient}
        >
          {/* Urgency Indicator */}
          <View 
            style={[styles.urgencyBar, { backgroundColor: getUrgencyColor() }]}
          />

          {/* Pet Image */}
          <View style={styles.imageContainer}>
            <OptimizedImage
              source={{ uri: pet.photos[0] }}
              style={styles.petImage}
              placeholder="loading"
            />
            {pet.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>

          {/* Pet Info */}
          <View style={styles.petInfo}>
            <View style={styles.petHeader}>
              <Text style={styles.petName}>{pet.name}</Text>
              {pet.reward && (
                <Text style={styles.reward}>₺{pet.reward}</Text>
              )}
            </View>
            
            <Text style={styles.petBreed}>{pet.breed}</Text>
            
            <View style={styles.locationRow}>
              <MapPin color="#64748B" size={14} />
              <Text style={styles.location}>{pet.location}</Text>
              <Text style={styles.timeAgo}>• {pet.timeAgo}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={(e) => {
                e.stopPropagation();
                onLike();
              }}
            >
              <Heart color="#EF4444" size={20} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.callButton}
              onPress={(e) => {
                e.stopPropagation();
                onCall();
              }}
            >
              <Phone color="#FFFFFF" size={18} />
              <Text style={styles.callText}>Ara</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardBlur: {
    borderRadius: 16,
  },
  cardGradient: {
    padding: 16,
    position: 'relative',
  },
  urgencyBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  petInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  reward: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  petBreed: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: '#64748B',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  callText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SimplifiedPetCard;