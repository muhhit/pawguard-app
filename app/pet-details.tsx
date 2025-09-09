import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,

  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Heart,
  Share2,
  Calendar,
  DollarSign,
  X,
  Lock,
  Navigation,
  Stethoscope,
  FileText,
} from 'lucide-react-native';
import { usePets } from '@/hooks/pet-store';
import { useAuth } from '@/hooks/auth-store';
import ClaimRewardModal from '@/components/ClaimRewardModal';
import EmergencyBroadcast from '@/components/EmergencyBroadcast';
import { getLocationForUser, type UserType } from '@/utils/locationPrivacy';
import SocialShare from '@/components/SocialShare';
import { useRescue } from '@/hooks/rescue-store';
import { useReport } from '@/hooks/report-store';
import ParallaxCard from '@/components/ParallaxCard';

const { width, height } = Dimensions.get('window');

function PetDetailsScreen() {
  const params = useLocalSearchParams<{ 
    id?: string;
    petId?: string;
    petName?: string;
    petBreed?: string;
    distance?: string;
    reward?: string;
    status?: string;
    showOnMap?: string;
  }>();
  
  // Handle both id and petId parameters
  const petId = params.id || params.petId;
  
  const { getPetById, updatePet, getUserType, canRequestExactLocation, requestExactLocation } = usePets();
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [userType, setUserType] = useState<UserType>('public');
  const [canRequestLocation, setCanRequestLocation] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // If we have mock data from home screen, use it, otherwise fetch from store
  const pet = petId ? getPetById(petId) : null;
  const mockPet = params.petName ? {
    id: params.petId || '1',
    name: params.petName,
    breed: params.petBreed || 'Unknown',
    type: 'Dog',
    distance: parseFloat(params.distance || '0'),
    reward_amount: parseInt(params.reward || '0'),
    status: params.status || 'normal',
    is_found: false,
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face'],
    medical_records: [],
    created_at: new Date().toISOString(),
    last_location: {
      lat: 41.0082 + (Math.random() - 0.5) * 0.01,
      lng: 28.9784 + (Math.random() - 0.5) * 0.01
    },
    owner_id: 'mock-owner'
  } : null;
  
  const displayPet = pet || mockPet;
  const { reportPet } = useReport();

  // Load user type and permissions
  useEffect(() => {
    if (displayPet && petId) {
      const loadUserPermissions = async () => {
        try {
          const type = await getUserType(petId);
          setUserType(type);
          
          const canRequest = await canRequestExactLocation(petId);
          setCanRequestLocation(canRequest);
        } catch (error) {
          console.error('Error loading user permissions:', error);
          // For mock data, set default permissions
          setUserType('public');
          setCanRequestLocation(false);
        }
      };
      
      loadUserPermissions();
    }
  }, [displayPet, petId, getUserType, canRequestExactLocation]);

  if (!displayPet) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pet not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = displayPet.owner_id === user?.id;
  const hasPhotos = displayPet.photos && displayPet.photos.length > 0;
  const defaultImage = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop';
  const images = hasPhotos ? displayPet.photos : [defaultImage];

  const handleContactOwner = () => {
    if (!displayPet) return;
    
    console.log('Contact owner pressed for:', displayPet.name);
    // Navigate to in-app messaging system
    router.push({
      pathname: '/conversation',
      params: {
        conversationId: `pet_${displayPet.id}`,
        name: `${displayPet.name} Sahibi`,
        type: 'pet_owner',
        petName: displayPet.name,
        petId: displayPet.id,
        ownerId: displayPet.owner_id || 'mock-owner'
      },
    });
  };

  const handleFoundPet = async () => {
    if (isOwner) {
      Alert.alert(
        'Mark as Found',
        'Are you sure you want to mark this pet as found?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Found!',
            style: 'default',
            onPress: async () => {
              try {
                if (pet) {
                  await updatePet(pet.id, { is_found: true });
                  Alert.alert('Success', 'Pet marked as found!');
                } else {
                  Alert.alert('Success', 'Pet would be marked as found!');
                }
                router.back();
              } catch {
                Alert.alert('Error', 'Failed to update pet status');
              }
            },
          },
        ]
      );
    } else {
      setIsReporting(true);
      // In a real app, this would open a form to report the sighting
      Alert.alert(
        'Report Sighting',
        'Thank you for helping! This would open a form to report the sighting with location and photo.',
        [
          {
            text: 'OK',
            onPress: () => setIsReporting(false),
          },
        ]
      );
    }
  };

  const handleShare = () => {
    // no-op here; share component renders below
    Alert.alert('Paylaşım', 'Aşağıdaki paylaşım bileşenini kullanabilirsiniz.');
  };

  const goBrandify = () => {
    if (!displayPet?.id) { Alert.alert('Pet bulunamadı'); return; }
    router.push({ pathname: '/brandify', params: { id: displayPet.id } });
  };

  const goRescueChannel = () => {
    if (!displayPet?.id) { Alert.alert('Pet bulunamadı'); return; }
    router.push({ pathname: '/rescue-channel', params: { petId: displayPet.id, ownerId: displayPet.owner_id || '' } });
  };

  const goPoster = () => {
    router.push({ pathname: '/poster', params: { petName: displayPet?.name || 'PawGuard Pet', reward: String((displayPet as any)?.reward_amount || 0), link: 'https://pawguard.app/p/' + (displayPet?.id || '') } });
  };

  const goCollage = () => {
    const imgs = (displayPet?.photos || []).slice(0,4).join(',');
    router.push({ pathname: '/collage', params: { images: imgs } });
  };

  const handleReport = async () => {
    if (!displayPet?.id) return;
    try {
      await reportPet(displayPet.id, 'inappropriate', 'Yanlış kategori veya uygunsuz içerik');
      Alert.alert('Teşekkürler', 'Bildiriminiz alındı. Topluluk güvenliği için destek veriyorsunuz.');
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Bildirilemedi');
    }
  };

  const handleRequestExactLocation = async () => {
    if (!canRequestLocation) {
      Alert.alert(
        'Permission Required',
        'You need an active reward claim to request exact location details.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRequestingLocation(true);
    try {
      if (petId) {
        await requestExactLocation(petId);
      }
      Alert.alert(
        'Request Sent',
        'Your request for exact location has been sent to the pet owner. They will be notified and can choose to share more precise location details.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send location request',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Get privacy-adjusted location for display
  const getDisplayLocation = () => {
    if (!displayPet?.last_location) return null;
    
    return getLocationForUser(
      displayPet.id,
      userType,
      displayPet.last_location.lat,
      displayPet.last_location.lng
    );
  };

  const displayLocation = getDisplayLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderGalleryItem = ({ item }: { item: string; index: number }) => (
    <View style={styles.galleryImageContainer}>
      <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="contain" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share2 color="#1E293B" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Heart color="#FF6B6B" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {images.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.imageWrapper}
                onPress={() => {
                  setSelectedImageIndex(index);
                  setGalleryVisible(true);
                }}
              >
                <Image source={{ uri: image }} style={styles.petImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {displayPet.is_found ? '✅ Found' : '🔍 Missing'}
            </Text>
          </View>
          
          {/* Show on Map Badge - if coming from home screen */}
          {params.showOnMap === 'true' && (
            <View style={styles.mapBadge}>
              <MapPin color="#FFFFFF" size={16} />
              <Text style={styles.mapBadgeText}>Haritada Göster</Text>
            </View>
          )}
        </View>

        {/* Pet Info */}
        <View style={styles.content}>
          <View style={styles.petHeader}>
            <View style={styles.petTitleContainer}>
              <Text style={styles.petName}>{displayPet.name}</Text>
              <Text style={styles.petBreed}>{displayPet.type} • {displayPet.breed || 'Mixed'}</Text>
              {params.distance && (
                <Text style={styles.distanceText}>{params.distance}km uzakta</Text>
              )}
            </View>
            {displayPet.reward_amount > 0 && (
              <View style={styles.rewardBadge}>
                <DollarSign color="#10B981" size={16} />
                <Text style={styles.rewardText}>₺{displayPet.reward_amount}</Text>
              </View>
            )}
          </View>

          {/* Last Seen Location with Privacy Controls */}
          {displayLocation && (
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <MapPin color="#FF6B6B" size={20} />
                <Text style={styles.infoTitle}>Last Seen Location</Text>
                {displayLocation.precision !== 'exact' && (
                  <View style={styles.privacyBadge}>
                    <Lock color="#64748B" size={14} />
                    <Text style={styles.privacyText}>
                      {displayLocation.precision === 'medium' ? 'Street Level' : 'Area Level'}
                    </Text>
                  </View>
                )}
              </View>
              
              {userType === 'owner' ? (
                <Text style={styles.infoText}>
                  Exact Location: {displayPet.last_location!.lat.toFixed(6)}, {displayPet.last_location!.lng.toFixed(6)}
                </Text>
              ) : (
                <View>
                  <Text style={styles.infoText}>
                    {displayLocation.precision === 'exact' 
                      ? `Exact: ${displayLocation.lat.toFixed(6)}, ${displayLocation.lng.toFixed(6)}`
                      : `Approximate: ${displayLocation.lat.toFixed(3)}, ${displayLocation.lng.toFixed(3)}`
                    }
                  </Text>
                  <Text style={styles.privacyNotice}>
                    {displayLocation.precision === 'exact'
                      ? 'Exact location shown'
                      : displayLocation.precision === 'medium'
                      ? 'Location shown at street level for privacy'
                      : 'Location shown at neighborhood level for privacy'
                    }
                  </Text>
                </View>
              )}
              
              <View style={styles.locationActions}>
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => {
                    console.log('View on Map pressed for:', displayPet.name);
                    if (displayLocation) {
                      router.push({
                        pathname: '/(tabs)/tracking',
                        params: {
                          showPetOnMap: 'true',
                          petId: displayPet.id,
                          petLat: displayLocation.lat.toString(),
                          petLng: displayLocation.lng.toString(),
                          petName: displayPet.name,
                        },
                      });
                    } else {
                      // Fallback to tracking tab
                      router.push('/(tabs)/tracking');
                    }
                  }}
                >
                  <Navigation color="#FFFFFF" size={16} />
                  <Text style={styles.mapButtonText}>Haritada Göster</Text>
                </TouchableOpacity>
                
                {!isOwner && displayLocation.precision !== 'exact' && canRequestLocation && (
                  <TouchableOpacity 
                    style={[styles.requestLocationButton, isRequestingLocation && styles.buttonDisabled]}
                    onPress={handleRequestExactLocation}
                    disabled={isRequestingLocation}
                  >
                    <MapPin color="#3B82F6" size={16} />
                    <Text style={styles.requestLocationText}>
                      {isRequestingLocation ? 'Requesting...' : 'Request Exact Location'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Date Missing */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Calendar color="#F59E0B" size={20} />
              <Text style={styles.infoTitle}>Date Reported</Text>
            </View>
            <Text style={styles.infoText}>{formatDate(displayPet.created_at)}</Text>
          </View>

          {/* Description */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {displayPet.name} is a {displayPet.type.toLowerCase()} who went missing. Please contact the owner if you have any information about their whereabouts.
              {params.status === 'urgent' && ' This is an URGENT case - immediate help needed!'}
            </Text>
          </View>

          {/* Emergency Broadcast - Only show for owners and if pet is still missing */}
          {isOwner && !displayPet.is_found && pet && (
            <EmergencyBroadcast 
              pet={pet} 
              onBroadcastSent={(recipientCount) => {
                console.log(`Emergency broadcast sent to ${recipientCount} users`);
              }}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isOwner && (
              <TouchableOpacity style={styles.contactButton} onPress={handleContactOwner}>
                <Text style={styles.contactButtonText}>💬 Message Owner</Text>
              </TouchableOpacity>
            )}
            
            {!isOwner && displayPet.reward_amount > 0 && !displayPet.is_found && (
              <TouchableOpacity
                style={styles.claimRewardButton}
                onPress={() => setShowClaimModal(true)}
              >
                <DollarSign color="#FFFFFF" size={20} />
                <Text style={styles.claimRewardButtonText}>
                  Claim ₺{displayPet.reward_amount} Reward
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.foundButton,
                isReporting && styles.foundButtonLoading,
              ]}
              onPress={handleFoundPet}
              disabled={isReporting}
            >
              <Heart color="#FFFFFF" size={20} />
              <Text style={styles.foundButtonText}>
                {isOwner ? 'Mark as Found' : 'I Found This Pet'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Free standard parallax preview */}
        {displayPet?.photos?.[0] && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <ParallaxCard uri={displayPet.photos[0]} width={340} height={220} />
          </View>
        )}
      </ScrollView>
      {/* Social Sharing */}
      <SocialShare pet={{ id: displayPet.id, name: displayPet.name, type: displayPet.type, breed: displayPet.breed, last_location: displayPet.last_location || null, reward_amount: (displayPet as any).reward_amount || 0 }} />
      <View style={{ padding: 16 }}>
        <TouchableOpacity accessibilityLabel="Premium Brand Card Oluştur" onPress={goBrandify} style={{ backgroundColor: '#0EA5E9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Premium Brand Card Oluştur</Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <TouchableOpacity accessibilityLabel="Kurtarma Kanalını Aç" onPress={goRescueChannel} style={{ backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Kurtarma Kanalını Aç</Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <TouchableOpacity accessibilityLabel="İçeriği Bildir" onPress={handleReport} style={{ backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: '#111827', fontWeight: '700' }}>İçeriği Bildir</Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <TouchableOpacity accessibilityLabel="Poster Oluştur" onPress={goPoster} style={{ backgroundColor: '#6EE7B7', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: '#0B1220', fontWeight: '700' }}>Poster Oluştur</Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <TouchableOpacity accessibilityLabel="UGC Kolajı" onPress={goCollage} style={{ backgroundColor: '#0EA5E9', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>UGC Kolajı</Text>
        </TouchableOpacity>
      </View>

      {/* Gallery Modal */}
      <Modal
        visible={galleryVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGalleryVisible(false)}
      >
        <View style={styles.galleryModal}>
          <TouchableOpacity
            style={styles.galleryCloseButton}
            onPress={() => setGalleryVisible(false)}
          >
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <FlatList
            data={images}
            renderItem={renderGalleryItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(_, index: number) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>
      </Modal>

      {/* Claim Reward Modal */}
      {pet && (
        <ClaimRewardModal
          visible={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          pet={pet}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width,
    height: 300,
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mapBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  mapBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  petTitleContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: '#64748B',
  },
  distanceText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  infoText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginTop: 8,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginLeft: 'auto',
  },
  privacyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  privacyNotice: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    gap: 6,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  requestLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 6,
  },
  requestLocationText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtons: {
    gap: 12,
    marginTop: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  foundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  foundButtonLoading: {
    opacity: 0.7,
  },
  foundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  claimRewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  claimRewardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  galleryCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
});

export default PetDetailsScreen;
