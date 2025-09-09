import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { 
  Heart, 
  Camera, 
  MapPin, 
  Award, 
  Utensils,
  Clock,
  Star,
  Users,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard } from '@/components/GlassComponents';
import OptimizedImage from '@/components/OptimizedImage';

interface FeedingRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalType: 'cat' | 'dog';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: Date;
  foodType: string;
  quantity: string;
  photos: string[];
  healthNotes?: string;
  caregiverNotes?: string;
  isVerified: boolean;
  trustScore: number;
}

interface StreetAnimal {
  id: string;
  name: string;
  type: 'cat' | 'dog';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  photos: string[];
  healthStatus: 'healthy' | 'needs_attention' | 'urgent';
  lastFed: Date | null;
  totalFeedings: number;
  caregivers: string[];
  isNeutered: boolean;
  vaccinated: boolean;
  description: string;
  trustLevel: 'public' | 'community' | 'verified_only';
}

interface FeedingSystemProps {
  userTrustScore: number;
  userId: string;
  onFeedingComplete: (record: FeedingRecord) => void;
}

export default function StreetAnimalFeeding({
  userTrustScore,
  userId,
  onFeedingComplete,
}: FeedingSystemProps) {
  const [nearbyAnimals, setNearbyAnimals] = useState<StreetAnimal[]>([]);
  const [feedingHistory, setFeedingHistory] = useState<FeedingRecord[]>([]);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<StreetAnimal | null>(null);
  const [feedingForm, setFeedingForm] = useState({
    foodType: '',
    quantity: '',
    healthNotes: '',
    caregiverNotes: '',
  });

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    const mockAnimals: StreetAnimal[] = [
      {
        id: '1',
        name: 'Tekir',
        type: 'cat',
        location: {
          lat: 41.0082,
          lng: 28.9784,
          address: 'Eminönü, Fatih/İstanbul',
        },
        photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200'],
        healthStatus: 'healthy',
        lastFed: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        totalFeedings: 23,
        caregivers: ['user1', 'user2', 'user3'],
        isNeutered: true,
        vaccinated: true,
        description: 'Çok sevimli ve insanlara alışkın tekir kedi',
        trustLevel: 'community',
      },
      {
        id: '2',
        name: 'Karabaş',
        type: 'dog',
        location: {
          lat: 41.0100,
          lng: 28.9800,
          address: 'Beyoğlu/İstanbul',
        },
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=200'],
        healthStatus: 'needs_attention',
        lastFed: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        totalFeedings: 45,
        caregivers: ['user1', 'user4'],
        isNeutered: false,
        vaccinated: false,
        description: 'Yaşlı köpek, veteriner kontrolü gerekiyor',
        trustLevel: 'verified_only',
      },
    ];

    setNearbyAnimals(mockAnimals);
  }, []);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'needs_attention': return '#F59E0B';
      case 'urgent': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Sağlıklı';
      case 'needs_attention': return 'Dikkat Gerekiyor';
      case 'urgent': return 'Acil Durum';
      default: return 'Bilinmiyor';
    }
  };

  const canSeeAnimal = (animal: StreetAnimal) => {
    switch (animal.trustLevel) {
      case 'public': return true;
      case 'community': return userTrustScore >= 30;
      case 'verified_only': return userTrustScore >= 70;
      default: return false;
    }
  };

  const handleFeedAnimal = (animal: StreetAnimal) => {
    if (!canSeeAnimal(animal)) {
      Alert.alert(
        '🔒 Erişim Kısıtlı',
        `Bu hayvanın bilgilerini görmek için en az ${animal.trustLevel === 'community' ? '30' : '70'} güven skoru gerekli.`,
        [{ text: 'Tamam' }]
      );
      return;
    }

    setSelectedAnimal(animal);
    setShowFeedingModal(true);
  };

  const submitFeeding = async () => {
    if (!selectedAnimal) return;

    if (!feedingForm.foodType || !feedingForm.quantity) {
      Alert.alert('Hata', 'Yem türü ve miktarı gerekli');
      return;
    }

    // Create feeding record
    const feedingRecord: FeedingRecord = {
      id: Date.now().toString(),
      animalId: selectedAnimal.id,
      animalName: selectedAnimal.name,
      animalType: selectedAnimal.type,
      location: selectedAnimal.location,
      timestamp: new Date(),
      foodType: feedingForm.foodType,
      quantity: feedingForm.quantity,
      photos: [], // Would be filled with actual photos
      healthNotes: feedingForm.healthNotes,
      caregiverNotes: feedingForm.caregiverNotes,
      isVerified: false,
      trustScore: userTrustScore,
    };

    setFeedingHistory([feedingRecord, ...feedingHistory]);
    onFeedingComplete(feedingRecord);

    // Calculate XP and rewards
    const baseXP = 10;
    const bonusXP = feedingForm.healthNotes ? 5 : 0;
    const totalXP = baseXP + bonusXP;

    Alert.alert(
      '🎉 Besleme Kaydedildi!',
      `${selectedAnimal.name} için teşekkürler!\n\n+${totalXP} XP kazandınız\n+1 Beslenme puanı\n\n${selectedAnimal.name}'in son beslenme saati güncellendi.`,
      [{ text: 'Harika!' }]
    );

    // Reset form and close modal
    setFeedingForm({ foodType: '', quantity: '', healthNotes: '', caregiverNotes: '' });
    setShowFeedingModal(false);
    setSelectedAnimal(null);

    // Update animal's last fed time (simulated)
    setNearbyAnimals(prev => prev.map(animal => 
      animal.id === selectedAnimal.id 
        ? { ...animal, lastFed: new Date(), totalFeedings: animal.totalFeedings + 1 }
        : animal
    ));
  };

  const getTimeSinceLastFed = (lastFed: Date | null) => {
    if (!lastFed) return 'Hiç beslenmeği kayıtlı değil';
    
    const now = new Date();
    const diff = now.getTime() - lastFed.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Az önce beslendi';
    if (hours === 1) return '1 saat önce beslendi';
    if (hours < 24) return `${hours} saat önce beslendi`;
    
    const days = Math.floor(hours / 24);
    return `${days} gün önce beslendi`;
  };

  const getUserStats = () => {
    const totalFeedings = feedingHistory.length;
    const thisWeekFeedings = feedingHistory.filter(
      f => new Date().getTime() - f.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;
    const uniqueAnimals = new Set(feedingHistory.map(f => f.animalId)).size;

    return {
      total: totalFeedings,
      thisWeek: thisWeekFeedings,
      uniqueAnimals,
    };
  };

  const stats = getUserStats();

  return (
    <View style={styles.container}>
      {/* User Stats */}
      <LiquidGlassCard style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Heart color="#FF6B6B" size={24} />
          <Text style={styles.statsTitle}>Beslenme İstatistiklerin</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Toplam Beslenme</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>Bu Hafta</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.uniqueAnimals}</Text>
            <Text style={styles.statLabel}>Farklı Hayvan</Text>
          </View>
        </View>

        {/* Achievement Progress */}
        <View style={styles.achievementProgress}>
          <View style={styles.progressHeader}>
            <Award color="#FFD700" size={16} />
            <Text style={styles.progressTitle}>Sonraki Başarı</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(stats.total % 10) * 10}%` }]} />
          </View>
          <Text style={styles.progressText}>{stats.total % 10}/10 - "Sokak Dostu" rozetine {10 - (stats.total % 10)} beslenme kaldı</Text>
        </View>
      </LiquidGlassCard>

      {/* Nearby Animals */}
      <View style={styles.sectionHeader}>
        <MapPin color="#667eea" size={20} />
        <Text style={styles.sectionTitle}>Yakındaki Sokak Hayvanları</Text>
      </View>

      <ScrollView style={styles.animalsList} showsVerticalScrollIndicator={false}>
        {nearbyAnimals.map((animal) => {
          const canAccess = canSeeAnimal(animal);
          const isUrgent = animal.healthStatus === 'urgent';
          const needsFeeding = !animal.lastFed || 
            (new Date().getTime() - animal.lastFed.getTime()) > 8 * 60 * 60 * 1000;

          return (
            <TouchableOpacity
              key={animal.id}
              style={[
                styles.animalCard,
                isUrgent && styles.animalCardUrgent,
                !canAccess && styles.animalCardLocked,
              ]}
              onPress={() => handleFeedAnimal(animal)}
              disabled={!canAccess}
            >
              <LinearGradient
                colors={isUrgent ? ['#FEF2F2', '#FECACA'] : ['#FFFFFF', '#F8FAFC']}
                style={styles.animalGradient}
              >
                <View style={styles.animalHeader}>
                  <OptimizedImage
                    source={canAccess ? animal.photos[0] : 'https://via.placeholder.com/60x60/E2E8F0/64748B?text=🔒'}
                    style={[styles.animalPhoto, !canAccess && styles.animalPhotoBlurred]}
                    optimization="thumbnail"
                  />
                  
                  <View style={styles.animalInfo}>
                    <Text style={styles.animalName}>
                      {canAccess ? animal.name : 'Gizli Hayvan'}
                    </Text>
                    <Text style={styles.animalType}>
                      {animal.type === 'cat' ? '🐱 Kedi' : '🐕 Köpek'}
                    </Text>
                    <Text style={styles.animalLocation}>
                      {canAccess ? animal.location.address : 'Konum gizli'}
                    </Text>
                  </View>

                  <View style={styles.animalStatus}>
                    <View style={[
                      styles.healthStatus,
                      { backgroundColor: getHealthStatusColor(animal.healthStatus) + '20' }
                    ]}>
                      <Text style={[
                        styles.healthStatusText,
                        { color: getHealthStatusColor(animal.healthStatus) }
                      ]}>
                        {getHealthStatusText(animal.healthStatus)}
                      </Text>
                    </View>
                    
                    {needsFeeding && (
                      <View style={styles.feedingAlert}>
                        <Utensils color="#EF4444" size={12} />
                        <Text style={styles.feedingAlertText}>Beslenme zamanı!</Text>
                      </View>
                    )}
                  </View>
                </View>

                {canAccess && (
                  <View style={styles.animalDetails}>
                    <View style={styles.animalDetail}>
                      <Clock color="#64748B" size={14} />
                      <Text style={styles.animalDetailText}>
                        {getTimeSinceLastFed(animal.lastFed)}
                      </Text>
                    </View>
                    
                    <View style={styles.animalDetail}>
                      <Users color="#64748B" size={14} />
                      <Text style={styles.animalDetailText}>
                        {animal.caregivers.length} bakıcı
                      </Text>
                    </View>
                    
                    <View style={styles.animalDetail}>
                      <Target color="#64748B" size={14} />
                      <Text style={styles.animalDetailText}>
                        {animal.totalFeedings} kez beslendi
                      </Text>
                    </View>
                  </View>
                )}

                {!canAccess && (
                  <View style={styles.lockMessage}>
                    <Shield color="#EF4444" size={16} />
                    <Text style={styles.lockMessageText}>
                      Bu hayvanın bilgilerini görmek için daha yüksek güven skoru gerekli
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Feeding Modal */}
      <Modal
        visible={showFeedingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFeedingModal(false)}
      >
        <View style={styles.feedingModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedAnimal?.name} için Beslenme Kaydı
            </Text>
            <TouchableOpacity onPress={() => setShowFeedingModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Yem Türü *</Text>
              <View style={styles.foodTypeButtons}>
                {['Kuru Mama', 'Yaş Mama', 'Ev Yemeği', 'Diğer'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.foodTypeButton,
                      feedingForm.foodType === type && styles.foodTypeButtonSelected
                    ]}
                    onPress={() => setFeedingForm(prev => ({ ...prev, foodType: type }))}
                  >
                    <Text style={[
                      styles.foodTypeButtonText,
                      feedingForm.foodType === type && styles.foodTypeButtonTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Miktar *</Text>
              <View style={styles.quantityButtons}>
                {['Az', 'Normal', 'Çok'].map((quantity) => (
                  <TouchableOpacity
                    key={quantity}
                    style={[
                      styles.quantityButton,
                      feedingForm.quantity === quantity && styles.quantityButtonSelected
                    ]}
                    onPress={() => setFeedingForm(prev => ({ ...prev, quantity }))}
                  >
                    <Text style={[
                      styles.quantityButtonText,
                      feedingForm.quantity === quantity && styles.quantityButtonTextSelected
                    ]}>
                      {quantity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Sağlık Notları (+5 XP)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Hayvanın genel durumu, gözlemlerin..."
                multiline
                value={feedingForm.healthNotes}
                onChangeText={(text) => setFeedingForm(prev => ({ ...prev, healthNotes: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bakıcı Notları</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Diğer bakıcılar için notlarınız..."
                multiline
                value={feedingForm.caregiverNotes}
                onChangeText={(text) => setFeedingForm(prev => ({ ...prev, caregiverNotes: text }))}
              />
            </View>

            <TouchableOpacity style={styles.photoButton}>
              <Camera color="#667eea" size={20} />
              <Text style={styles.photoButtonText}>Fotoğraf Ekle</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowFeedingModal(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitFeeding}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.submitGradient}>
                <Heart color="#FFFFFF" size={16} />
                <Text style={styles.submitButtonText}>Beslenmeyi Kaydet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statsCard: {
    margin: 16,
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  achievementProgress: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#64748B',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  animalsList: {
    flex: 1,
  },
  animalCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  animalCardUrgent: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
  },
  animalCardLocked: {
    opacity: 0.7,
  },
  animalGradient: {
    padding: 16,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  animalPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  animalPhotoBlurred: {
    opacity: 0.3,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  animalType: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  animalLocation: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  animalStatus: {
    alignItems: 'flex-end',
  },
  healthStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  healthStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  feedingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  feedingAlertText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
  animalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  animalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  animalDetailText: {
    fontSize: 11,
    color: '#64748B',
  },
  lockMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  lockMessageText: {
    fontSize: 11,
    color: '#EF4444',
    flex: 1,
  },
  feedingModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginVertical: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  foodTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  foodTypeButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  foodTypeButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  foodTypeButtonTextSelected: {
    color: '#FFFFFF',
  },
  quantityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  quantityButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  quantityButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  quantityButtonTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    minHeight: 40,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 16,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});