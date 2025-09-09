import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MapPin, Clock, AlertTriangle } from 'lucide-react-native';
import { usePets } from '@/hooks/pet-store';
import { useRouter } from 'expo-router';

export default function NearbyAlerts() {
  const { pets } = usePets();
  const router = useRouter();
  
  // Filter for missing pets
  const missingPets = pets.filter(pet => !pet.is_found);
  
  // Mock nearby alerts data
  const nearbyAlerts = [
    {
      id: '1',
      type: 'missing',
      petName: 'Buddy',
      petType: 'Köpek',
      distance: '0.5 km',
      timeAgo: '2 saat önce',
      reward: '500 TL',
    },
    {
      id: '2',
      type: 'sighting',
      petName: 'Mia',
      petType: 'Kedi',
      distance: '1.2 km',
      timeAgo: '45 dakika önce',
      reward: '300 TL',
    },
    {
      id: '3',
      type: 'found',
      petName: 'Charlie',
      petType: 'Köpek',
      distance: '0.8 km',
      timeAgo: '1 saat önce',
      reward: '200 TL',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'missing':
        return <AlertTriangle color="#F59E0B" size={16} />;
      case 'sighting':
        return <MapPin color="#10B981" size={16} />;
      case 'found':
        return <Clock color="#6B7280" size={16} />;
      default:
        return <AlertTriangle color="#F59E0B" size={16} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'missing':
        return '#FEF3C7';
      case 'sighting':
        return '#D1FAE5';
      case 'found':
        return '#F3F4F6';
      default:
        return '#FEF3C7';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yakındaki Uyarılar</Text>
        <Text style={styles.subtitle}>{nearbyAlerts.length} aktif uyarı</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alertsContainer}
      >
        {nearbyAlerts.map((alert) => (
          <TouchableOpacity 
            key={alert.id} 
            style={[
              styles.alertCard,
              { backgroundColor: getAlertColor(alert.type) }
            ]}
            onPress={() => {
              console.log('Nearby alert clicked:', alert.petName);
              router.push({
                pathname: '/pet-details',
                params: {
                  petId: alert.id,
                  petName: alert.petName,
                  petBreed: alert.petType,
                  distance: alert.distance.replace(' km', ''),
                  reward: alert.reward.replace('TL', '').replace(' ', ''),
                  status: alert.type === 'missing' ? 'urgent' : 'normal',
                  showOnMap: 'true'
                }
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.alertHeader}>
              {getAlertIcon(alert.type)}
              <Text style={styles.alertType}>
                {alert.type === 'missing' ? 'Kayıp' : 
                 alert.type === 'sighting' ? 'Görüldü' : 'Bulundu'}
              </Text>
            </View>
            
            <Text style={styles.petName}>{alert.petName}</Text>
            <Text style={styles.petType}>{alert.petType}</Text>
            
            <View style={styles.alertFooter}>
              <View style={styles.locationInfo}>
                <MapPin color="#64748B" size={12} />
                <Text style={styles.distance}>{alert.distance}</Text>
              </View>
              <Text style={styles.timeAgo}>{alert.timeAgo}</Text>
            </View>
            
            {alert.reward && (
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>Ödül: {alert.reward}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  alertsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  alertCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  alertType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  petType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 12,
    color: '#64748B',
  },
  rewardBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});