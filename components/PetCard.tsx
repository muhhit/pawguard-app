import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import OptimizedImage from '@/components/OptimizedImage';
import { MapPin, Clock, DollarSign, Lock } from 'lucide-react-native';
import { Pet } from '@/hooks/pet-store';
import { useLanguage } from '@/hooks/language-store';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { useMemoizedValue } from '@/utils/performance';
// import { getLocationForUser, type UserType } from '@/utils/locationPrivacy';
type UserType = 'owner' | 'public' | 'finder';

// Mock function for now to avoid h3-js encoding issues
const getLocationForUser = (petId: string, userType: UserType, lat: number, lng: number) => {
  return {
    lat,
    lng,
    precision: userType === 'owner' ? 'exact' as const : userType === 'finder' ? 'medium' as const : 'fuzzy' as const,
    isDelayed: userType !== 'owner'
  };
};

interface PetCardProps {
  pet: Pet;
  distance?: number;
  showDistance?: boolean;
  userType?: UserType;
  currentUserLat?: number;
  currentUserLng?: number;
}

const PetCard = memo<PetCardProps>(({ 
  pet, 
  distance, 
  showDistance = false, 
  userType = 'public',
  currentUserLat,
  currentUserLng 
}) => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  
  // Memoized handlers and calculations for better performance
  const handlePress = useMemoizedValue(() => () => {
    router.push({ 
      pathname: '/pet-details', 
      params: { 
        id: pet.id,
        showOnMap: 'true'
      } 
    });
  }, [pet.id]);

  const formatDistance = useMemoizedValue(() => (dist: number): string => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m away`;
    }
    return `${dist.toFixed(1)}km away`;
  }, []);

  // Determine user type based on ownership and context
  const actualUserType = useMemoizedValue((): UserType => {
    if (user?.id === pet.owner_id) {
      return 'owner';
    }
    if (userType === 'finder') {
      return 'finder';
    }
    return 'public';
  }, [user?.id, pet.owner_id, userType]);

  // Get privacy-adjusted location
  const locationInfo = useMemoizedValue(() => {
    if (!pet.last_location?.lat || !pet.last_location?.lng) {
      return null;
    }

    const processedLocation = getLocationForUser(
      pet.id,
      actualUserType,
      pet.last_location.lat,
      pet.last_location.lng
    );

    return {
      ...processedLocation,
      userType: actualUserType
    };
  }, [pet.id, pet.last_location, actualUserType]);

  const timeAgo = useMemoizedValue(() => {
    if (!pet?.created_at) return 'Unknown time';
    
    const date = new Date(pet.created_at);
    const now = new Date();
    
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }, [pet?.created_at]);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      testID={`pet-card-${pet.id}`}
      activeOpacity={0.7}
    >
      <OptimizedImage 
        source={pet?.photos?.[0] || 'https://via.placeholder.com/120x90/E2E8F0/64748B?text=Pet'}
        optimization="card"
        style={styles.image} 
        resizeMode="cover"
        placeholder={true}
        fallback="https://via.placeholder.com/120x90/E2E8F0/64748B?text=Pet"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{pet?.name || 'Unknown Pet'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: pet?.is_found ? '#DCFCE7' : '#FEF3C7' }]}>
            <View style={[styles.statusDot, { backgroundColor: pet?.is_found ? '#10B981' : '#F59E0B' }]} />
            <Text style={[styles.statusText, { color: pet?.is_found ? '#059669' : '#D97706' }]}>
              {pet?.is_found ? 'Found' : 'Missing'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.breed} numberOfLines={1}>{pet?.breed || pet?.type || 'Unknown Breed'}</Text>
        
        <View style={styles.details}>
          {showDistance && distance !== undefined && (
            <View style={styles.detailItem}>
              <MapPin color="#64748B" size={14} />
              <Text style={styles.detailText}>{formatDistance(distance)}</Text>
              {locationInfo && locationInfo.precision !== 'exact' && (
                <Lock color="#64748B" size={12} style={styles.privacyIcon} />
              )}
            </View>
          )}
          
          {locationInfo && !showDistance && (
            <View style={styles.detailItem}>
              <MapPin color="#64748B" size={14} />
              <Text style={styles.detailText}>
                {locationInfo.precision === 'exact' ? 'Exact location' :
                 locationInfo.precision === 'medium' ? 'Nearby area' : 'General area'}
              </Text>
              {locationInfo.precision !== 'exact' && (
                <Lock color="#64748B" size={12} style={styles.privacyIcon} />
              )}
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Clock color="#64748B" size={14} />
            <Text style={styles.detailText}>{timeAgo}</Text>
          </View>
          
          {(pet?.reward_amount || 0) > 0 && (
            <View style={styles.detailItem}>
              <DollarSign color="#10B981" size={14} />
              <Text style={[styles.detailText, { color: '#10B981', fontWeight: '600' }]}>
                {formatCurrency(pet?.reward_amount || 0)} reward
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

PetCard.displayName = 'PetCard';

export default PetCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  breed: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  privacyIcon: {
    marginLeft: 2,
    opacity: 0.7,
  },
});