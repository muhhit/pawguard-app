import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Search, Users, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ActiveSearches() {
  const router = useRouter();
  // Mock active searches data
  const activeSearches = [
    {
      id: '1',
      petName: 'Luna',
      petType: 'Kedi',
      volunteers: 12,
      searchRadius: '2 km',
      status: 'active',
      progress: 65,
    },
    {
      id: '2',
      petName: 'Max',
      petType: 'Köpek',
      volunteers: 8,
      searchRadius: '1.5 km',
      status: 'urgent',
      progress: 30,
    },
    {
      id: '3',
      petName: 'Bella',
      petType: 'Köpek',
      volunteers: 15,
      searchRadius: '3 km',
      status: 'completed',
      progress: 100,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'urgent':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      default:
        return '#10B981';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif Arama';
      case 'urgent':
        return 'Acil';
      case 'completed':
        return 'Tamamlandı';
      default:
        return 'Aktif Arama';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aktif Aramalar</Text>
        <Text style={styles.subtitle}>{activeSearches.filter(s => s.status !== 'completed').length} devam eden</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.searchesContainer}
      >
        {activeSearches.map((search) => (
          <TouchableOpacity 
            key={search.id} 
            style={styles.searchCard}
            onPress={() => {
              console.log('Active search clicked:', search.petName);
              router.push({
                pathname: '/pet-details',
                params: {
                  petId: search.id,
                  petName: search.petName,
                  petBreed: search.petType,
                  distance: search.searchRadius.replace(' km', ''),
                  reward: '0',
                  status: search.status === 'urgent' ? 'urgent' : 'normal'
                }
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.searchHeader}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(search.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(search.status)}</Text>
              </View>
              {search.status === 'completed' && (
                <Trophy color="#F59E0B" size={16} />
              )}
            </View>
            
            <Text style={styles.petName}>{search.petName}</Text>
            <Text style={styles.petType}>{search.petType}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${search.progress}%`,
                      backgroundColor: getStatusColor(search.status)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{search.progress}%</Text>
            </View>
            
            <View style={styles.searchFooter}>
              <View style={styles.volunteersInfo}>
                <Users color="#64748B" size={14} />
                <Text style={styles.volunteersText}>{search.volunteers} gönüllü</Text>
              </View>
              <View style={styles.radiusInfo}>
                <Search color="#64748B" size={14} />
                <Text style={styles.radiusText}>{search.searchRadius}</Text>
              </View>
            </View>
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
  searchesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  searchCard: {
    width: 220,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 35,
    textAlign: 'right',
  },
  searchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volunteersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  volunteersText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radiusText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});