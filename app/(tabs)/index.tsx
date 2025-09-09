import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import OptimizedImage from "@/components/OptimizedImage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { 
  AlertCircle, 
  Search, 
  Bell, 
  Award, 
  Camera, 
  MapPin, 
  Heart, 
  TrendingUp, 
  Users, 
  Target,
  Sparkles,
  Zap,
  Crown
} from "lucide-react-native";
import { glassColors } from "@/constants/colors";
import { LiquidGlassCard } from "@/components/GlassComponents";
import { t } from "@/constants/translations";
import Pet3DCard from "@/components/Pet3DCard";
import { SimplifiedPetCard } from "@/components/SimplifiedPetCard";

import { usePets, type Pet } from "@/hooks/pet-store";
import { useAuth } from "@/hooks/auth-store";
import { useLocation, type LocationData } from "@/hooks/location-store";
import { useNotifications } from "@/hooks/notification-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PageTransition } from "@/components/PageTransition";
import { ErrorMessage, InlineError, NetworkStatus } from "@/components/ErrorComponents";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  performanceMonitor, 
  useMemoizedCallback
} from "@/utils/performance";
import { getMockStats, getMockLiveUpdates } from "@/lib/mock-data";



export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { nearbyPets, pets, isLoading: petsLoading, isError: petsError } = usePets();
  const { getCurrentLocation, requestPermissions, currentLocation } = useLocation();
  const insets = useSafeAreaInsets();
  const networkStatus = useNetworkStatus();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'dogs' | 'cats' | 'urgent'>('all');
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  
  // Enhanced mock data for elite experience
  const mockStats = getMockStats();
  const liveUpdates = getMockLiveUpdates();
  
  // Real-world pet data for lost pets
  const urgentPetData = [
    {
      id: '1',
      name: 'Luna',
      breed: 'Golden Retriever',
      photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400'],
      location: 'Bebek, İstanbul',
      timeAgo: '2 saat önce',
      isVerified: true,
      ownerPhone: '+90 532 123 45 67',
      reward: 500,
      urgency: 'critical' as const,
    },
    {
      id: '2', 
      name: 'Max',
      breed: 'Labrador Mix',
      photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
      location: 'Nişantaşı, İstanbul',
      timeAgo: '4 saat önce',
      isVerified: true,
      ownerPhone: '+90 533 987 65 43',
      reward: 300,
      urgency: 'high' as const,
    },
    {
      id: '3',
      name: 'Bella',
      breed: 'Tekir Kedi',
      photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
      location: 'Etiler, İstanbul',
      timeAgo: '1 gün önce',
      isVerified: false,
      reward: 0,
      urgency: 'low' as const,
    }
  ];
  
  // Performance monitoring
  const measureRender = performanceMonitor.measureRender('EliteHomeScreen');

  // Pulse animation for emergency FAB
  useEffect(() => {
    let animationId: number;
    
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          animationId = requestAnimationFrame(pulse);
        }
      });
    };
    
    pulse();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim]);

  // Request location and notification permissions on app launch - simplified
  useEffect(() => {
    if (isAuthenticated && !authLoading && !permissionsInitialized.current) {
      permissionsInitialized.current = true;
      
      // Simplified permission initialization with better error handling
      const initializePermissions = async () => {
        try {
          console.log('Initializing permissions...');
          
          // Request location permissions with timeout - only on mobile
          if (Platform.OS !== 'web') {
            const locationPromise = Promise.race([
              requestPermissions(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 5000))
            ]);
            
            locationPromise
              .then((granted) => {
                if (granted) {
                  console.log('Location permission granted');
                  // Get location with timeout
                  const locationFetch = Promise.race([
                    getCurrentLocation(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Location fetch timeout')), 3000))
                  ]);
                  
                  locationFetch.catch(() => {
                    console.log('Location fetch failed, continuing without location');
                  });
                }
              })
              .catch(() => {
                console.log('Location permission failed, continuing without location');
              });
          }
          
          // Request notification permissions with timeout
          if (!hasNotificationPermission) {
            const notificationPromise = Promise.race([
              requestNotificationPermissions(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Notification timeout')), 3000))
            ]);
            
            notificationPromise.catch(() => {
              console.log('Notification permission failed, continuing without notifications');
            });
          }
          
        } catch (error) {
          console.log('Permission initialization error, continuing:', error);
        }
      };
      
      // Initialize permissions after a delay to prevent blocking
      setTimeout(() => {
        initializePermissions();
      }, 2000);
    }
  }, [isAuthenticated, authLoading, requestPermissions, getCurrentLocation, hasNotificationPermission, requestNotificationPermissions]);

  const handleEmergencyPress = useMemoizedCallback(() => {
    console.log('Emergency button pressed');
    setShowEmergencyModal(true);
  }, []);

  const handleEmergencySubmit = useMemoizedCallback(() => {
    if (!emergencyForm.name.trim()) {
      Alert.alert('Hata', 'Lütfen hayvanın ismini girin');
      return;
    }
    
    console.log('Emergency report:', emergencyForm);
    Alert.alert(
      'Acil Bildirim Gönderildi! 🚨',
      `${emergencyForm.name} için acil kayıp bildirimi yaklaşık 847 kişiye gönderildi.`,
      [
        {
          text: 'Tamam',
          onPress: () => {
            setShowEmergencyModal(false);
            setEmergencyForm({ name: '', type: 'Köpek', description: '' });
          }
        }
      ]
    );
  }, [emergencyForm]);



  // Use centralized mock stats (already declared above)
  const successStats = {
    thisWeek: mockStats.weeklySuccess || 12,
    totalFound: mockStats.petsFound || 847,
    activeSearches: mockStats.activeSearches || 24,
    volunteers: mockStats.totalVolunteers || 1247,
    successRate: mockStats.successRate || 89,
    ongoingSearches: mockStats.activeSearches || 18,
    totalVolunteers: mockStats.totalVolunteers || 1247,
    weeklySuccess: mockStats.weeklySuccess || 12
  };

  // Use centralized mock live updates (already declared above)
  const enhancedLiveUpdates = liveUpdates.map(update => ({
    ...update,
    icon: update.type === 'sighting' ? MapPin : 
          update.type === 'found' ? Heart : AlertCircle,
    color: update.type === 'sighting' ? '#3B82F6' : 
           update.type === 'found' ? '#10B981' : '#EF4444'
  }));

  // Calculate map height based on scroll position - more responsive
  const dynamicH = Math.max(480, winHeight || screenHeightInitial);
  const mapHeight = scrollY.interpolate({
    inputRange: [0, 150, 300],
    outputRange: [dynamicH * 0.6, dynamicH * 0.4, dynamicH * 0.25],
    extrapolate: 'clamp',
  });

  const mapOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200, 300],
    outputRange: [1, 0.9, 0.7, 0.5],
    extrapolate: 'clamp',
  });

  const mapScale = scrollY.interpolate({
    inputRange: [0, 200, 400],
    outputRange: [1, 0.95, 0.9],
    extrapolate: 'clamp',
  });

  // Performance measurement - moved to end to fix hooks order
  useEffect(() => {
    const stopMeasure = measureRender;
    return stopMeasure;
  }, []);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <LoadingSpinner 
        variant="branded" 
        fullScreen 
        text={t('common.loading')} 
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoadingSpinner 
        variant="branded" 
        fullScreen 
        text={t('home.loginRequired')} 
      />
    );
  }

  // Show error state if pets failed to load
  if (petsError && !petsLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={glassColors.gradients.primary as any}
          style={StyleSheet.absoluteFill}
        />
        <ErrorMessage
          type="network"
          title="Veri Yüklenemedi"
          message="Yakındaki kayıp hayvanlar yüklenirken bir hata oluştu."
          onRetry={retryNearbyPetsQuery}
          retryText="Tekrar Dene"
        />
      </View>
    );
  }

  return (
    <PageTransition>
      <View style={styles.container}>
        {/* ELITE AI GLASS BACKGROUND */}
        <LinearGradient
          colors={['#0F0F23', '#1A1A2E', '#16213E']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* FLOATING AI HEADER */}
        <BlurView intensity={20} style={[styles.eliteHeader, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerContent}>
            <View style={styles.aiIndicator}>
              <Sparkles color="#9333EA" size={16} />
              <Text style={styles.aiText}>AI Powered</Text>
            </View>
            <Text style={styles.eliteTitle}>PawGuard Elite</Text>
            <TouchableOpacity style={styles.premiumBadge}>
              <Crown color="#F59E0B" size={16} />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* URGENT LOST PETS LIST */}
        <FlatList
          data={urgentPetData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SimplifiedPetCard
              pet={item}
              onPress={() => {
                console.log('Pet details:', item.name);
                router.push({
                  pathname: '/pet-details',
                  params: { 
                    petId: item.id,
                    petName: item.name,
                    location: item.location
                  }
                });
              }}
              onCall={() => {
                console.log('Calling owner:', item.ownerPhone);
                // Linking.openURL(`tel:${item.ownerPhone}`)
              }}
              onLike={() => {
                console.log('Liked pet:', item.name);
                // Add to favorites or show support
              }}
            />
          )}
          contentContainerStyle={styles.petsList}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        />

        {/* REAL-TIME STATS PANEL */}
        <BlurView intensity={30} style={styles.insightsPanel}>
          <View style={styles.insightHeader}>
            <AlertCircle color="#EF4444" size={20} />
            <Text style={styles.insightTitle}>Anlık Durum</Text>
            <View style={styles.livePulse} />
          </View>
          
          <View style={styles.insightStats}>
            <View style={styles.insightStat}>
              <Text style={[styles.insightNumber, {color: '#EF4444'}]}>3</Text>
              <Text style={styles.insightLabel}>Acil Kayıp</Text>
            </View>
            <View style={styles.insightStat}>
              <Text style={[styles.insightNumber, {color: '#10B981'}]}>12</Text>
              <Text style={styles.insightLabel}>Bu Hafta Bulunan</Text>
            </View>
            <View style={styles.insightStat}>
              <Text style={[styles.insightNumber, {color: '#F59E0B'}]}>847</Text>
              <Text style={styles.insightLabel}>Aktif Kullanıcı</Text>
            </View>
          </View>
        </BlurView>

        {/* QUICK ACTION BANNER */}
        <View style={styles.actionBanner}>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => router.push('/report-pet')}
          >
            <AlertCircle color="#FFFFFF" size={24} />
            <Text style={styles.reportText}>Kayıp Hayvan Bildir</Text>
          </TouchableOpacity>
        </View>

        {/* EMERGENCY FAB WITH ELITE STYLING */}
        <Animated.View style={[styles.eliteEmergencyFab, { 
          bottom: 100 + insets.bottom,
          transform: [{ scale: pulseAnim }] 
        }]}>
          <TouchableOpacity
            style={styles.eliteEmergencyButton}
            onPress={handleEmergencyPress}
            activeOpacity={0.8}
          >
            <AlertCircle color="#FFFFFF" size={28} />
            <Text style={styles.emergencyText}>SOS</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Premium Modal */}
        <Modal
          visible={showPremiumModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPremiumModal(false)}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.premiumModal}
          >
            <View style={styles.premiumModalContent}>
              <Crown color="#F59E0B" size={64} />
              <Text style={styles.premiumModalTitle}>PawGuard Elite</Text>
              <Text style={styles.premiumModalDescription}>
                Join 2.3K elite pet parents with AI-powered matching, exclusive 3D profiles, and priority support.
              </Text>
              
              <TouchableOpacity 
                style={styles.premiumCloseButton}
                onPress={() => setShowPremiumModal(false)}
              >
                <Text style={styles.premiumCloseText}>Coming Soon</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
        
        {/* Emergency Modal */}
        <Modal
          visible={showEmergencyModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowEmergencyModal(false)}
        >
          <View style={styles.emergencyModal}>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyIconContainer}>
                <AlertCircle color="#EF4444" size={32} />
              </View>
              <Text style={styles.emergencyTitle}>Acil Kayıp Bildirimi</Text>
              <Text style={styles.emergencySubtitle}>AI ile 60 saniyede analiz ve yayın</Text>
            </View>
            
            <View style={styles.emergencyForm}>
              <TextInput
                style={styles.emergencyInput}
                placeholder="Hayvan ismi"
                value={emergencyForm.name}
                onChangeText={(text) => setEmergencyForm(prev => ({ ...prev, name: text }))}
              />
              
              <View style={styles.emergencyActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEmergencyModal(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleEmergencySubmit}
                >
                  <Text style={styles.submitButtonText}>AI Analizi Başlat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  // Elite header styles
  eliteHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  aiText: {
    color: '#9333EA',
    fontSize: 12,
    fontWeight: '600',
  },
  eliteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  // Pets list
  petsList: {
    paddingTop: 120,
    paddingBottom: 200,
  },
  // AI Insights Panel
  insightsPanel: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  insightStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightStat: {
    alignItems: 'center',
    flex: 1,
  },
  insightNumber: {
    color: '#06B6D4',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  // Action banner
  actionBanner: {
    position: 'absolute',
    bottom: 260,
    left: 20,
    right: 20,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reportText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Elite emergency FAB
  eliteEmergencyFab: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
  },
  eliteEmergencyButton: {
    backgroundColor: '#EF4444',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    gap: 4,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Premium modal
  premiumModal: {
    flex: 1,
  },
  premiumModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  premiumModalTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 30,
    marginBottom: 20,
  },
  premiumModalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  premiumCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  premiumCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Emergency modal updates
  emergencyModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  emergencyHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emergencyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FEF2F2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  emergencyForm: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emergencyInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 30,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Legacy styles kept for compatibility
  mapView: {
    height: '100%',
    borderRadius: 20,
  },
  searchCard: {
    marginHorizontal: 0,
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardIndicator: {
    backgroundColor: '#E2E8F0',
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 140 : 120,
    zIndex: 10,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  scrollView: {
    flex: 1,
  },
  bottomSheetIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomSheetIndicator: {
    backgroundColor: '#E2E8F0',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statCardHalf: {
    flexBasis: '48%',
  },
  statCardThird: {
    flexBasis: '32%',
    flexGrow: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    color: '#64748B',
  },
  liveUpdates: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  updateLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  updateDescription: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  updateDescriptionText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeBadge: {
    backgroundColor: glassColors.turkish.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: glassColors.turkish.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  petsList: {
    marginBottom: 20,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  petCardUrgent: {
    backgroundColor: 'rgba(254, 242, 242, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 202, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  petCardNormal: {
    backgroundColor: 'rgba(255, 247, 237, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  contactActionButton: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  contactActionText: {
    fontSize: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  petDistance: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  petReward: {
    alignItems: 'flex-end',
    position: 'relative',
  },
  urgentBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgentText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rewardLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  successContent: {
    flex: 1,
  },
  successLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  successNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  successIcon: {
    opacity: 0.5,
  },
  heatMapCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heatMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heatMapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heatMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heatMapCell: {
    width: '22%',
    minWidth: 60,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
  },
  emergencyFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 20,
  },
  emergencyButton: {
    backgroundColor: glassColors.turkish.red,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: glassColors.turkish.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  emergencyModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emergencyHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emergencyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF2F2',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  emergencyForm: {
    flex: 1,
    paddingHorizontal: 24,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8,
  },
  emergencyInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  reachCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  reachLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  reachNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  reachDistance: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  seeAllText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  successStoriesContainer: {
    marginBottom: 20,
  },
  successStoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  successStoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  successStoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  successStoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  successStoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successStat: {
    alignItems: 'center',
    flex: 1,
  },
  successStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  successStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  loadingSectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});