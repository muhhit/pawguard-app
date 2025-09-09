import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users } from 'lucide-react-native';
import { type DogMatch } from '@/hooks/events-store';

interface DogMatchCardProps {
  match: DogMatch;
  onInvite: (dogId: string) => void;
  isInviting?: boolean;
}

export const DogMatchCard: React.FC<DogMatchCardProps> = ({ 
  match, 
  onInvite, 
  isInviting = false 
}) => {
  const { dog, score, commonTraits, recommendation } = match;
  
  const getScoreColor = (score: number) => {
    if (score > 70) return '#10B981';
    if (score > 50) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreGradient = (score: number): [string, string] => {
    if (score > 70) return ['#10B981', '#059669'];
    if (score > 50) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: dog.photos[0] }} style={styles.dogImage} />
        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>{dog.name}</Text>
          <Text style={styles.dogBreed}>{dog.breed} • {dog.age} yaş</Text>
          <View style={styles.weightEnergyRow}>
            <Text style={styles.dogWeight}>{dog.weight}kg</Text>
            <View style={styles.energyIndicator}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.energyDot,
                    { 
                      backgroundColor: i < Math.ceil(dog.energyLevel / 2) 
                        ? '#F59E0B' 
                        : '#E5E7EB' 
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={getScoreGradient(score)}
            style={styles.scoreCircle}
          >
            <Text style={styles.scoreText}>{score}</Text>
          </LinearGradient>
          <Text style={[styles.recommendation, { color: getScoreColor(score) }]}>
            {recommendation}
          </Text>
        </View>
      </View>

      <View style={styles.traitsContainer}>
        <Text style={styles.traitsTitle}>Ortak Özellikler:</Text>
        <View style={styles.traitsRow}>
          {commonTraits.slice(0, 3).map((trait, index) => (
            <View key={index} style={styles.traitChip}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
          {commonTraits.length > 3 && (
            <View style={styles.traitChip}>
              <Text style={styles.traitText}>+{commonTraits.length - 3}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.playStyleContainer}>
        <View style={styles.playStyleItem}>
          <Users color="#64748B" size={16} />
          <Text style={styles.playStyleText}>{dog.playStyle}</Text>
        </View>
        <View style={styles.temperamentContainer}>
          {dog.temperament.slice(0, 2).map((trait, index) => (
            <View key={index} style={styles.temperamentChip}>
              <Text style={styles.temperamentText}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.inviteButton, isInviting && styles.inviteButtonDisabled]}
        onPress={() => onInvite(dog.id)}
        disabled={isInviting}
      >
        <LinearGradient
          colors={isInviting ? ['#94A3B8', '#64748B'] : ['#8B5CF6', '#7C3AED']}
          style={styles.inviteButtonGradient}
        >
          <Text style={styles.inviteButtonText}>
            {isInviting ? 'Davet Gönderiliyor...' : 'Buluşmaya Davet Et'}
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dogImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  dogBreed: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  weightEnergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dogWeight: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  energyIndicator: {
    flexDirection: 'row',
    gap: 2,
  },
  energyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recommendation: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  traitsContainer: {
    marginBottom: 16,
  },
  traitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  traitText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  playStyleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playStyleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playStyleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  temperamentContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  temperamentChip: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  temperamentText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '500',
  },
  inviteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});