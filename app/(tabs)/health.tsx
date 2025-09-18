import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Reanimated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { 
  Heart, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Syringe,
  Pill,
  Stethoscope,
  FileText,
  Clock,
  X,
  MessageCircle,
  AlertTriangle,
  Info,
  Send,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePets } from "@/hooks/pet-store";
import LoadingSpinner from "@/components/LoadingSpinner";
import { NoHealthRecordsEmpty, NoAppointmentsEmpty } from "@/components/EmptyStates";
import { router } from "expo-router";
import { useCardAnimation, useReanimatedCardAnimation } from "@/lib/mobile/animations";
import { shouldReduceMotion } from "@/lib/mobile/animations";

const { width } = Dimensions.get("window");

interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'treatment';
  title: string;
  description: string;
  date: string;
  nextDue?: string;
  veterinarian?: string;
  notes?: string;
}

interface Appointment {
  id: string;
  petId: string;
  type: string;
  date: string;
  time: string;
  veterinarian: string;
  notes?: string;
}

interface VetGuidance {
  id: string;
  symptoms: string;
  response: string;
  urgency: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'INFORMATION';
  timestamp: string;
}

// Animasyonlu Pet Kartı Bileşeni
const AnimatedPetCard = ({ pet, index }: { pet: any; index: number }) => {
  const { fadeAnim, scaleAnim, startAnimation, animatedStyle } = useCardAnimation(index * 100);

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <Animated.View style={[animatedStyle]}>
      <LinearGradient
        colors={['#F3E8FF', '#FCE7F3']}
        style={styles.petCard}
      >
        <View style={styles.petCardHeader}>
          <View style={styles.petInfo}>
            <Image source={{ uri: pet.image }} style={styles.petAvatar} />
            <View style={styles.petDetails}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed} • {pet.age} yaş</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewDetailsText}>Detaylar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.petBadges}>
          {pet.vaccinated && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Aşılar Tam</Text>
            </View>
          )}
          {pet.microchipped && (
            <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.badgeText, { color: '#1D4ED8' }]}>Mikroçipli</Text>
            </View>
          )}
          {pet.gpsTracked && (
            <View style={[styles.badge, { backgroundColor: '#F3E8FF' }]}>
              <Text style={[styles.badgeText, { color: '#7C3AED' }]}>GPS Takılı</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Animasyonlu Stats Kartı Bileşeni
const AnimatedStatCard = ({ stat, index }: { stat: any; index: number }) => {
  const { fadeAnim, scaleAnim, startAnimation, animatedStyle } = useCardAnimation(index * 150);

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <LinearGradient colors={stat.colors} style={styles.statIcon}>
        <stat.icon color="#FFFFFF" size={20} />
      </LinearGradient>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </Animated.View>
  );
};

// Reanimated ile Animasyonlu Action Card
const ReanimatedActionCard = ({ action, index }: { action: any; index: number }) => {
  return (
    <Reanimated.View 
      entering={FadeInUp.delay(index * 100).duration(300)}
      style={styles.actionCard}
    >
      <TouchableOpacity>
        <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
          <action.icon color={action.iconColor} size={24} />
        </View>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

export default function HealthScreen() {
  const { pets } = usePets();
  const [modalVisible, setModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'records' | 'appointments' | 'guidance'>('overview');
  const [reduceMotion, setReduceMotion] = useState(false);
  
  // Mock pets data for modern design
  const mockPets = [
    {
      id: '1',
      name: 'Luna',
      breed: 'Golden Retriever',
      age: 3,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
      vaccinated: true,
      microchipped: true,
      gpsTracked: true
    }
  ];
  
  const [appointments, setAppointments] = useState<Appointment[]>([
    { 
      id: '1', 
      petId: 'pet1', 
      type: 'Vet Checkup', 
      date: '2024-12-15', 
      time: '2:00 PM', 
      veterinarian: 'Dr. Smith',
      notes: 'Annual checkup'
    },
    { 
      id: '2', 
      petId: 'pet2', 
      type: 'Grooming', 
      date: '2024-12-18', 
      time: '10:00 AM', 
      veterinarian: 'Pet Spa',
      notes: 'Full grooming service'
    },
  ]);

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    {
      id: '1',
      petId: 'pet1',
      type: 'vaccination',
      title: 'Rabies Vaccination',
      description: 'Annual rabies shot',
      date: '2024-11-15',
      nextDue: '2025-11-15',
      veterinarian: 'Dr. Smith',
    },
    {
      id: '2',
      petId: 'pet1',
      type: 'medication',
      title: 'Flea Prevention',
      description: 'Monthly flea and tick prevention',
      date: '2024-12-01',
      nextDue: '2025-01-01',
      veterinarian: 'Dr. Smith',
    },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    type: '',
    date: '',
    time: '',
    veterinarian: '',
    notes: '',
  });

  const [newRecord, setNewRecord] = useState({
    type: 'vaccination' as HealthRecord['type'],
    title: '',
    description: '',
    date: '',
    nextDue: '',
    veterinarian: '',
    notes: '',
  });

  const [guidanceHistory, setGuidanceHistory] = useState<VetGuidance[]>([]);
  const [currentSymptoms, setCurrentSymptoms] = useState('');
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [guidanceModalVisible, setGuidanceModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingHealthData, setIsLoadingHealthData] = useState<boolean>(false);

  const healthData = {
    steps: 8420,
    calories: 340,
    distance: 5.2,
    activeMinutes: 120,
  };

  // Stats data for animation
  const statsData = [
    {
      value: healthData.steps.toLocaleString(),
      label: 'Steps Today',
      colors: ["#FF6B6B", "#FF8E8E"],
      icon: Activity,
    },
    {
      value: healthData.calories,
      label: 'Calories Burned',
      colors: ["#4ECDC4", "#6EE7E0"],
      icon: TrendingUp,
    },
    {
      value: `${healthData.distance} km`,
      label: 'Distance',
      colors: ["#45B7D1", "#6BC5E8"],
      icon: Activity,
    },
    {
      value: `${healthData.activeMinutes} min`,
      label: 'Active Time',
      colors: ["#F093FB", "#F5BCFF"],
      icon: Heart,
    },
  ];

  // Quick actions data
  const quickActionsData = [
    {
      title: 'Randevular',
      subtitle: '2 yaklaşan',
      icon: Clock,
      iconColor: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      title: 'Sağlık Takibi',
      subtitle: 'Tümü normal',
      icon: TrendingUp,
      iconColor: '#3B82F6',
      bgColor: '#DBEAFE',
    },
  ];

  // Initialize loading state and check reduce motion
  useEffect(() => {
    const initializeScreen = async () => {
      const reduceMotionEnabled = await shouldReduceMotion();
      setReduceMotion(reduceMotionEnabled);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200); // Simulate initial data loading

      return () => clearTimeout(timer);
    };

    initializeScreen();
  }, []);

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          fullScreen
          text="Sağlık verileri yükleniyor..."
          variant="glass"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Reanimated.View 
        entering={FadeInUp.duration(400)}
        style={styles.header}
      >
        <Text style={styles.title}>Evcil Dostlarım</Text>
        <Text style={styles.subtitle}>Sağlık ve aktivite takibi</Text>
      </Reanimated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Cards */}
        <View style={styles.petsSection}>
          {mockPets.map((pet, index) => (
            <AnimatedPetCard key={pet.id} pet={pet} index={index} />
          ))}
          
          <Reanimated.View entering={FadeInUp.delay(200).duration(400)}>
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={() => router.push('/add-pet')}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.addPetButtonText}>Yeni Dost Ekle</Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActionsData.map((action, index) => (
            <ReanimatedActionCard key={index} action={action} index={index} />
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <AnimatedStatCard key={index} stat={stat} index={index} />
          ))}
        </View>

        {/* Activity Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <Reanimated.View 
            entering={FadeInUp.delay(600).duration(400)}
            style={styles.activityChart}
          >
            <View style={styles.chartPlaceholder}>
              <TrendingUp color="#FF6B6B" size={32} />
              <Text style={styles.chartText}>Activity Chart</Text>
              <Text style={styles.chartSubtext}>Weekly activity trends</Text>
            </View>
          </Reanimated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  petsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  petCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E879F9',
  },
  petCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  petBreed: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  petBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: (width - 56) / 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  activityChart: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartPlaceholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  chartText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
  },
  chartSubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
});
