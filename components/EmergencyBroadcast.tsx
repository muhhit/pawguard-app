import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Linking,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AlertTriangle, Share2, Phone, MapPin, Clock, Users, Award, X, CheckCircle } from 'lucide-react-native';
import { useNotifications } from '@/hooks/notification-store';
import { useGamification } from '@/hooks/gamification-store';
import { Pet } from '@/hooks/pet-store';
import { useLocation } from '@/hooks/location-store';

import GlassContainer from '@/components/GlassContainer';



interface EmergencyBroadcastProps {
  pet: Pet;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EmergencyResponse {
  userId: string;
  userName: string;
  responseTime: string;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'responding' | 'arrived' | 'searching';
}

export const EmergencyBroadcast: React.FC<EmergencyBroadcastProps> = ({
  pet,
  visible,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [responses, setResponses] = useState<EmergencyResponse[]>([]);
  const [showResponses, setShowResponses] = useState<boolean>(false);
  
  const { sendEmergencyBroadcast } = useNotifications();
  const { addSuccessfulFind } = useGamification();
  const { currentLocation } = useLocation();


  const emergencyLocation = useMemo(() => {
    if (pet.last_location) {
      return pet.last_location;
    }
    if (currentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      };
    }
    return { lat: 41.0082, lng: 28.9784 };
  }, [pet.last_location, currentLocation]);

  const handleEmergencyBroadcast = useCallback(async () => {
    if (!emergencyLocation) {
      Alert.alert('Hata', 'Konum bilgisi bulunamadı');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await sendEmergencyBroadcast(pet.id, {
        lat: emergencyLocation?.lat || 41.0082,
        lng: emergencyLocation?.lng || 28.9784
      });

      if (result.success) {
        setRecipientCount(result.recipientCount);
        setBroadcastSent(true);
        
        // Simulate some emergency responses
        setTimeout(() => {
          const mockResponses: EmergencyResponse[] = [
            {
              userId: 'resp1',
              userName: 'Ahmet Yılmaz',
              responseTime: '2 dakika önce',
              status: 'responding'
            },
            {
              userId: 'resp2', 
              userName: 'Elif Kaya',
              responseTime: '5 dakika önce',
              status: 'arrived'
            },
            {
              userId: 'resp3',
              userName: 'Murat Demir',
              responseTime: '8 dakika önce', 
              status: 'searching'
            }
          ];
          setResponses(mockResponses);
        }, 3000);
        
        onSuccess?.();
      } else {
        Alert.alert('Hata', result.error || 'Acil durum yayını gönderilemedi');
      }
    } catch (error) {
      console.error('Emergency broadcast error:', error);
      Alert.alert('Hata', 'Acil durum yayını gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  }, [pet.id, emergencyLocation, sendEmergencyBroadcast, onSuccess]);

  const openLocation = useCallback(() => {
    if (!emergencyLocation) return;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${emergencyLocation?.lat || 41.0082},${emergencyLocation?.lng || 28.9784}`,
      android: `geo:0,0?q=${emergencyLocation?.lat || 41.0082},${emergencyLocation?.lng || 28.9784}`,
      web: `https://maps.google.com/maps?q=${emergencyLocation?.lat || 41.0082},${emergencyLocation?.lng || 28.9784}`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  }, [emergencyLocation]);

  const callOwner = useCallback(() => {
    // In a real app, this would call the pet owner
    const phoneNumber = '+905551234567'; // Mock phone number
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  }, []);

  const handleIllHelp = useCallback(async () => {
    try {
      // Award 500 hero points for emergency response
      const result = await addSuccessfulFind(true); // true = emergency response
      
      const pointsAwarded = result?.pointsAwarded || 500;
      
      Alert.alert(
        '🦸‍♂️ Kahraman!',
        `Acil duruma müdahale ettiğin için ${pointsAwarded} kahraman puanı kazandın! ${pet.name} için teşekkürler.`,
        [
          {
            text: 'Konumu Aç',
            onPress: () => openLocation()
          },
          {
            text: 'Sahibi Ara',
            onPress: () => callOwner()
          }
        ]
      );
    } catch (error) {
      console.error('Error awarding hero points:', error);
    }
  }, [addSuccessfulFind, pet.name, openLocation, callOwner]);

  const shareEmergencyAlert = useCallback(async () => {
    try {
      const message = `🚨 ACİL DURUM! ${pet.name} (${pet.type}) kayıp ve tehlikede! \n\n📍 Son görüldüğü yer: ${emergencyLocation?.lat?.toFixed(4) || 'Bilinmiyor'}, ${emergencyLocation?.lng?.toFixed(4) || 'Bilinmiyor'}\n💰 Ödül: ${pet.reward_amount}₺\n\n#PawGuard #KayıpHayvan #Yardım`;
      
      await Share.share({
        message,
        title: `${pet.name} Acil Yardım İhtiyacı`,
        url: Platform.OS === 'web' ? `https://pawguard.app/emergency/${pet.id}` : undefined
      });
    } catch (error) {
      console.error('Error sharing emergency alert:', error);
    }
  }, [pet, emergencyLocation]);

  const getStatusColor = (status: EmergencyResponse['status']) => {
    switch (status) {
      case 'responding': return '#F59E0B';
      case 'arrived': return '#10B981';
      case 'searching': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: EmergencyResponse['status']) => {
    switch (status) {
      case 'responding': return 'Yolda';
      case 'arrived': return 'Geldi';
      case 'searching': return 'Arıyor';
      default: return 'Bilinmiyor';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.container}
      >
        <BlurView intensity={20} style={styles.blurOverlay}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>🚨 Acil Durum Yayını</Text>
            </View>

            {!broadcastSent ? (
              <>
                {/* Pet Info */}
                <GlassContainer style={styles.petInfoCard}>
                  <View style={styles.petHeader}>
                    <AlertTriangle size={32} color="#EF4444" />
                    <View style={styles.petDetails}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petType}>{pet.type} • {pet.breed}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.emergencyInfo}>
                    <View style={styles.infoRow}>
                      <MapPin size={20} color="#EF4444" />
                      <Text style={styles.infoText}>
                        Son konum: {emergencyLocation?.lat?.toFixed(4) || 'Bilinmiyor'}, {emergencyLocation?.lng?.toFixed(4) || 'Bilinmiyor'}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Award size={20} color="#F59E0B" />
                      <Text style={styles.infoText}>Ödül: {pet.reward_amount}₺</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Clock size={20} color="#6B7280" />
                      <Text style={styles.infoText}>
                        Kayıp süresi: {Math.floor((Date.now() - new Date(pet.created_at).getTime()) / (1000 * 60 * 60))} saat
                      </Text>
                    </View>
                  </View>
                </GlassContainer>

                {/* Emergency Description */}
                <GlassContainer style={styles.descriptionCard}>
                  <Text style={styles.descriptionTitle}>⚠️ Acil Durum Detayları</Text>
                  <Text style={styles.descriptionText}>
                    {pet.name} kritik tehlikede ve acil yardıma ihtiyacı var. Bu yayın 15km çapındaki tüm gönüllülere gönderilecek.
                  </Text>
                  
                  <View style={styles.broadcastFeatures}>
                    <View style={styles.featureItem}>
                      <Users size={18} color="#3B82F6" />
                      <Text style={styles.featureText}>15km çapında yayın</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Award size={18} color="#F59E0B" />
                      <Text style={styles.featureText}>500 kahraman puanı</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Share2 size={18} color="#10B981" />
                      <Text style={styles.featureText}>Otomatik sosyal paylaşım</Text>
                    </View>
                  </View>
                </GlassContainer>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.emergencyButton, isLoading && styles.buttonDisabled]}
                    onPress={handleEmergencyBroadcast}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      style={styles.buttonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <AlertTriangle size={24} color="#FFFFFF" />
                      )}
                      <Text style={styles.emergencyButtonText}>
                        {isLoading ? 'Gönderiliyor...' : 'Acil Durum Yayını Gönder'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareEmergencyAlert}
                  >
                    <Share2 size={20} color="#3B82F6" />
                    <Text style={styles.shareButtonText}>Manuel Paylaş</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Success State */}
                <GlassContainer style={styles.successCard}>
                  <CheckCircle size={48} color="#10B981" />
                  <Text style={styles.successTitle}>Acil Durum Yayını Gönderildi!</Text>
                  <Text style={styles.successText}>
                    {recipientCount} gönüllüye acil durum bildirimi gönderildi
                  </Text>
                  
                  <View style={styles.successStats}>
                    <View style={styles.statItem}>
                      <Users size={24} color="#3B82F6" />
                      <Text style={styles.statNumber}>{recipientCount}</Text>
                      <Text style={styles.statLabel}>Bildirim</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Clock size={24} color="#F59E0B" />
                      <Text style={styles.statNumber}>~5</Text>
                      <Text style={styles.statLabel}>Dakika</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Award size={24} color="#EF4444" />
                      <Text style={styles.statNumber}>500</Text>
                      <Text style={styles.statLabel}>Puan</Text>
                    </View>
                  </View>
                </GlassContainer>

                {/* Response Actions */}
                <GlassContainer style={styles.responseCard}>
                  <Text style={styles.responseTitle}>🦸‍♂️ Yardım Etmek İster misin?</Text>
                  <Text style={styles.responseText}>
                    Acil duruma müdahale et ve 500 kahraman puanı kazan!
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.helpButton}
                    onPress={handleIllHelp}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.buttonGradient}
                    >
                      <CheckCircle size={24} color="#FFFFFF" />
                      <Text style={styles.helpButtonText}>Yardım Edeceğim!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction} onPress={openLocation}>
                      <MapPin size={20} color="#3B82F6" />
                      <Text style={styles.quickActionText}>Konumu Aç</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.quickAction} onPress={callOwner}>
                      <Phone size={20} color="#10B981" />
                      <Text style={styles.quickActionText}>Sahibi Ara</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.quickAction} onPress={shareEmergencyAlert}>
                      <Share2 size={20} color="#F59E0B" />
                      <Text style={styles.quickActionText}>Paylaş</Text>
                    </TouchableOpacity>
                  </View>
                </GlassContainer>

                {/* Live Responses */}
                {responses.length > 0 && (
                  <GlassContainer style={styles.responsesCard}>
                    <TouchableOpacity 
                      style={styles.responsesHeader}
                      onPress={() => setShowResponses(!showResponses)}
                    >
                      <Text style={styles.responsesTitle}>🚀 Canlı Müdahaleler ({responses.length})</Text>
                      <Text style={styles.toggleText}>{showResponses ? 'Gizle' : 'Göster'}</Text>
                    </TouchableOpacity>
                    
                    {showResponses && (
                      <View style={styles.responsesList}>
                        {responses.map((response, index) => (
                          <View key={response.userId} style={styles.responseItem}>
                            <View style={styles.responseUser}>
                              <Text style={styles.responseUserName}>{response.userName}</Text>
                              <Text style={styles.responseTime}>{response.responseTime}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(response.status) }]}>
                              <Text style={styles.statusText}>{getStatusText(response.status)}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </GlassContainer>
                )}
              </>
            )}
          </ScrollView>
        </BlurView>
      </LinearGradient>
    </Modal>
  );
};

// Simple component for backward compatibility
export default function EmergencyBroadcastSimple({ pet, onBroadcastSent }: { pet: Pet; onBroadcastSent?: (recipientCount: number) => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setVisible(true)}
      >
        <AlertTriangle size={20} color="#FFFFFF" />
        <Text style={styles.triggerButtonText}>Acil Durum Yayını</Text>
      </TouchableOpacity>
      
      <EmergencyBroadcast
        pet={pet}
        visible={visible}
        onClose={() => setVisible(false)}
        onSuccess={() => {
          onBroadcastSent?.(150); // Mock recipient count
          setVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurOverlay: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  petInfoCard: {
    marginBottom: 20,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  petDetails: {
    marginLeft: 15,
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petType: {
    fontSize: 16,
    color: '#6B7280',
  },
  emergencyInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  descriptionCard: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  broadcastFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  actionButtons: {
    gap: 12,
  },
  emergencyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  successCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  successStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  responseCard: {
    marginBottom: 20,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  responseText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  helpButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  responsesCard: {
    marginBottom: 20,
  },
  responsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  responsesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  toggleText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  responsesList: {
    gap: 10,
  },
  responseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  responseUser: {
    flex: 1,
  },
  responseUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  responseTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Simple trigger button styles
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginVertical: 8,
  },
  triggerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});