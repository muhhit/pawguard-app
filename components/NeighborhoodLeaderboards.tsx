import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Trophy,
  Medal,
  Star,
  Crown,
  MapPin,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  ChevronRight,
  Flag,
  Clock,
  BarChart3,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGamification } from '@/hooks/gamification-store';

interface DistrictLeaderboard {
  district: string;
  city: string;
  rank: number;
  totalPoints: number;
  totalPetsHelped: number;
  activeMembers: number;
  monthlyGrowth: number;
  topHeroes: {
    id: string;
    name: string;
    points: number;
    tier: string;
  }[];
  achievements: string[];
}

interface MonthlyWinner {
  id: string;
  name: string;
  points: number;
  month: string;
  district: string;
  avatar: string;
}

export default function NeighborhoodLeaderboards() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState<'districts' | 'monthly' | 'stats'>('districts');
  
  const { 
    userStats,
    heroTiers,
    getNeighborhoodLeaderboard
  } = useGamification();
  
  const neighborhoodData = getNeighborhoodLeaderboard();

  // Mock district leaderboards data
  const districtLeaderboards: DistrictLeaderboard[] = [
    {
      district: 'Kadıköy',
      city: 'İstanbul',
      rank: 1,
      totalPoints: 15847,
      totalPetsHelped: 89,
      activeMembers: 247,
      monthlyGrowth: 23,
      topHeroes: [
        { id: '1', name: 'Ayşe Demir', points: 2847, tier: 'toplum_kahramani' },
        { id: '2', name: 'Mehmet Kaya', points: 2156, tier: 'hayvan_dostu' },
        { id: '3', name: 'Zeynep Özkan', points: 1923, tier: 'hayvan_dostu' }
      ],
      achievements: ['En Aktif Mahalle', 'Hızlı Müdahale Uzmanı', 'Topluluk Lideri']
    },
    {
      district: 'Beşiktaş',
      city: 'İstanbul',
      rank: 2,
      totalPoints: 13542,
      totalPetsHelped: 76,
      activeMembers: 189,
      monthlyGrowth: 18,
      topHeroes: [
        { id: '4', name: 'Can Yılmaz', points: 2234, tier: 'toplum_kahramani' },
        { id: '5', name: 'Selin Akar', points: 1987, tier: 'hayvan_dostu' },
        { id: '6', name: 'Emre Özdemir', points: 1654, tier: 'hayvan_dostu' }
      ],
      achievements: ['Gece Bekçileri', 'Sosyal Medya Ustası']
    },
    {
      district: 'Üsküdar',
      city: 'İstanbul',
      rank: 3,
      totalPoints: 11923,
      totalPetsHelped: 67,
      activeMembers: 156,
      monthlyGrowth: 15,
      topHeroes: [
        { id: '7', name: 'Fatma Şahin', points: 2098, tier: 'hayvan_dostu' },
        { id: '8', name: 'Ali Koç', points: 1876, tier: 'hayvan_dostu' },
        { id: '9', name: 'Deniz Kaya', points: 1543, tier: 'sokak_koruyucu' }
      ],
      achievements: ['Sabah Kahramanları', 'Veteriner Dostu']
    },
    {
      district: 'Karşıyaka',
      city: 'İzmir',
      rank: 4,
      totalPoints: 9876,
      totalPetsHelped: 54,
      activeMembers: 134,
      monthlyGrowth: 12,
      topHeroes: [
        { id: '10', name: 'Burcu Demir', points: 1765, tier: 'hayvan_dostu' },
        { id: '11', name: 'Oğuz Kaan', points: 1432, tier: 'sokak_koruyucu' },
        { id: '12', name: 'Elif Yıldız', points: 1298, tier: 'sokak_koruyucu' }
      ],
      achievements: ['İzmir Lideri', 'Sahil Koruyucusu']
    },
    {
      district: 'Çankaya',
      city: 'Ankara',
      rank: 5,
      totalPoints: 8654,
      totalPetsHelped: 48,
      activeMembers: 112,
      monthlyGrowth: 9,
      topHeroes: [
        { id: '13', name: 'Ahmet Yılmaz', points: 1543, tier: 'sokak_koruyucu' },
        { id: '14', name: 'Gizem Aydın', points: 1321, tier: 'sokak_koruyucu' },
        { id: '15', name: 'Murat Özkan', points: 1187, tier: 'sokak_koruyucu' }
      ],
      achievements: ['Başkent Kahramanı']
    }
  ];

  // Mock monthly winners
  const monthlyWinners: MonthlyWinner[] = [
    {
      id: '1',
      name: 'Ayşe Demir',
      points: 2847,
      month: 'Aralık 2024',
      district: 'Kadıköy',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Can Yılmaz',
      points: 2234,
      month: 'Kasım 2024',
      district: 'Beşiktaş',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Fatma Şahin',
      points: 2098,
      month: 'Ekim 2024',
      district: 'Üsküdar',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown color="#FFD700" size={24} />;
      case 2:
        return <Medal color="#C0C0C0" size={24} />;
      case 3:
        return <Award color="#CD7F32" size={24} />;
      default:
        return <Trophy color="#64748B" size={20} />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#64748B';
    }
  };

  const getTierIcon = (tierId: string) => {
    const tier = heroTiers.find(t => t.id === tierId);
    return tier?.icon || '🏆';
  };

  const getTierColor = (tierId: string) => {
    const tier = heroTiers.find(t => t.id === tierId);
    return tier?.color || '#8B5CF6';
  };

  const renderDistrictLeaderboards = () => (
    <View style={styles.tabContent}>
      {/* Current User's District Highlight */}
      <View style={styles.userDistrictCard}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.userDistrictGradient}
        >
          <View style={styles.userDistrictHeader}>
            <MapPin color="#FFFFFF" size={20} />
            <Text style={styles.userDistrictTitle}>Senin Mahallen</Text>
          </View>
          <Text style={styles.userDistrictName}>{userStats.neighborhood}</Text>
          <View style={styles.userDistrictStats}>
            <View style={styles.userDistrictStat}>
              <Text style={styles.userDistrictStatNumber}>23</Text>
              <Text style={styles.userDistrictStatLabel}>Bu ay kurtarılan</Text>
            </View>
            <View style={styles.userDistrictStat}>
              <Text style={styles.userDistrictStatNumber}>156</Text>
              <Text style={styles.userDistrictStatLabel}>Aktif gönüllü</Text>
            </View>
            <View style={styles.userDistrictStat}>
              <Text style={styles.userDistrictStatNumber}>18dk</Text>
              <Text style={styles.userDistrictStatLabel}>Ort. müdahale</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* District Rankings */}
      <View style={styles.districtList}>
        <Text style={styles.sectionTitle}>Mahalle Liderlik Tablosu</Text>
        <Text style={styles.sectionSubtitle}>
          Türkiye genelinde en aktif mahalleler
        </Text>

        {districtLeaderboards.map((district, index) => (
          <TouchableOpacity key={district.district} style={styles.districtCard}>
            <View style={styles.districtRank}>
              {getRankIcon(district.rank)}
              <Text style={[styles.districtRankText, { color: getRankColor(district.rank) }]}>
                #{district.rank}
              </Text>
            </View>

            <View style={styles.districtInfo}>
              <View style={styles.districtHeader}>
                <Text style={styles.districtName}>{district.district}</Text>
                <Text style={styles.districtCity}>{district.city}</Text>
              </View>
              
              <View style={styles.districtStats}>
                <View style={styles.districtStat}>
                  <Users color="#64748B" size={16} />
                  <Text style={styles.districtStatText}>{district.activeMembers} gönüllü</Text>
                </View>
                <View style={styles.districtStat}>
                  <Target color="#64748B" size={16} />
                  <Text style={styles.districtStatText}>{district.totalPetsHelped} kurtarılan</Text>
                </View>
              </View>

              <View style={styles.districtAchievements}>
                {district.achievements.slice(0, 2).map((achievement, achIndex) => (
                  <View key={achIndex} style={styles.achievementBadge}>
                    <Text style={styles.achievementText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.districtPoints}>
              <Text style={styles.districtPointsNumber}>{district.totalPoints.toLocaleString()}</Text>
              <Text style={styles.districtPointsLabel}>Toplam XP</Text>
              <View style={[styles.growthIndicator, { backgroundColor: district.monthlyGrowth > 15 ? '#10B981' : '#F59E0B' }]}>
                <TrendingUp color="#FFFFFF" size={12} />
                <Text style={styles.growthText}>+{district.monthlyGrowth}%</Text>
              </View>
            </View>

            <ChevronRight color="#64748B" size={20} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMonthlyWinners = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Aylık Şampiyonlar</Text>
      <Text style={styles.sectionSubtitle}>
        Her ay en çok hayvan kurtaran kahramanlar
      </Text>

      <View style={styles.winnersGrid}>
        {monthlyWinners.map((winner, index) => (
          <View key={winner.id} style={styles.winnerCard}>
            <LinearGradient
              colors={index === 0 ? ['#FFD700', '#FFA500'] : index === 1 ? ['#C0C0C0', '#A0A0A0'] : ['#CD7F32', '#B8860B']}
              style={styles.winnerGradient}
            >
              <View style={styles.winnerHeader}>
                <View style={styles.winnerRank}>
                  {index === 0 ? <Crown color="#FFFFFF" size={20} /> : 
                   index === 1 ? <Medal color="#FFFFFF" size={20} /> : 
                   <Award color="#FFFFFF" size={20} />}
                </View>
                <Text style={styles.winnerMonth}>{winner.month}</Text>
              </View>

              <Image source={{ uri: winner.avatar }} style={styles.winnerAvatar} />
              
              <Text style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerDistrict}>{winner.district}</Text>
              
              <View style={styles.winnerStats}>
                <Text style={styles.winnerPoints}>{winner.points.toLocaleString()} XP</Text>
                <Text style={styles.winnerLabel}>Toplam Puan</Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Hall of Fame */}
      <View style={styles.hallOfFame}>
        <Text style={styles.hallTitle}>🏆 Şeref Listesi</Text>
        <Text style={styles.hallSubtitle}>Tüm zamanların en büyük kahramanları</Text>
        
        {monthlyWinners.slice(0, 5).map((winner, index) => (
          <View key={`hall-${winner.id}`} style={styles.hallItem}>
            <Image source={{ uri: winner.avatar }} style={styles.hallAvatar} />
            <View style={styles.hallInfo}>
              <Text style={styles.hallName}>{winner.name}</Text>
              <Text style={styles.hallDistrict}>{winner.district} • {winner.month}</Text>
            </View>
            <View style={styles.hallPoints}>
              <Text style={styles.hallPointsText}>{winner.points.toLocaleString()}</Text>
              <Text style={styles.hallPointsLabel}>XP</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCommunityStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Topluluk İstatistikleri</Text>
      <Text style={styles.sectionSubtitle}>
        Bu ay gerçekleştirilen faaliyetler
      </Text>

      {/* Monthly Overview */}
      <View style={styles.statsOverview}>
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>Aralık 2024 Özeti</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Target color="#FFFFFF" size={24} />
              <Text style={styles.statNumber}>342</Text>
              <Text style={styles.statLabel}>Kayıp Bildirimi</Text>
            </View>
            <View style={styles.statItem}>
              <Trophy color="#FFFFFF" size={24} />
              <Text style={styles.statNumber}>298</Text>
              <Text style={styles.statLabel}>Başarılı Bulma</Text>
            </View>
            <View style={styles.statItem}>
              <Users color="#FFFFFF" size={24} />
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Yeni Gönüllü</Text>
            </View>
            <View style={styles.statItem}>
              <Clock color="#FFFFFF" size={24} />
              <Text style={styles.statNumber}>18dk</Text>
              <Text style={styles.statLabel}>Ort. Müdahale</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Top Performing Districts */}
      <View style={styles.topDistricts}>
        <Text style={styles.subsectionTitle}>En Başarılı Mahalleler</Text>
        {districtLeaderboards.slice(0, 3).map((district, index) => (
          <View key={district.district} style={styles.topDistrictItem}>
            <View style={styles.topDistrictRank}>
              {getRankIcon(index + 1)}
            </View>
            <View style={styles.topDistrictInfo}>
              <Text style={styles.topDistrictName}>{district.district}</Text>
              <Text style={styles.topDistrictCity}>{district.city}</Text>
            </View>
            <View style={styles.topDistrictStats}>
              <Text style={styles.topDistrictNumber}>{district.totalPetsHelped}</Text>
              <Text style={styles.topDistrictLabel}>kurtarılan</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Success Rate Chart */}
      <View style={styles.successChart}>
        <Text style={styles.subsectionTitle}>Başarı Oranları</Text>
        <View style={styles.chartContainer}>
          {districtLeaderboards.slice(0, 5).map((district, index) => {
            const successRate = Math.floor((district.totalPetsHelped / (district.totalPetsHelped + 10)) * 100);
            return (
              <View key={district.district} style={styles.chartItem}>
                <Text style={styles.chartLabel}>{district.district}</Text>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartFill, 
                      { 
                        width: `${successRate}%`,
                        backgroundColor: getTierColor('toplum_kahramani')
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartPercent}>{successRate}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Flag color="#FFFFFF" size={28} />
              <Text style={styles.headerTitle}>Mahalle Liderliği</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Türkiye genelinde mahalle bazlı yarışma
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'districts' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('districts')}
        >
          <MapPin
            color={selectedTab === 'districts' ? '#FF6B6B' : '#64748B'}
            size={18}
          />
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'districts' && styles.tabButtonTextActive,
            ]}
          >
            Mahalleler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'monthly' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('monthly')}
        >
          <Calendar
            color={selectedTab === 'monthly' ? '#FF6B6B' : '#64748B'}
            size={18}
          />
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'monthly' && styles.tabButtonTextActive,
            ]}
          >
            Şampiyonlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'stats' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('stats')}
        >
          <BarChart3
            color={selectedTab === 'stats' ? '#FF6B6B' : '#64748B'}
            size={18}
          />
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'stats' && styles.tabButtonTextActive,
            ]}
          >
            İstatistikler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'districts' && renderDistrictLeaderboards()}
        {selectedTab === 'monthly' && renderMonthlyWinners()}
        {selectedTab === 'stats' && renderCommunityStats()}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFF1F1',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tabContent: {
    flex: 1,
    paddingTop: 20,
  },
  userDistrictCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userDistrictGradient: {
    padding: 20,
  },
  userDistrictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userDistrictTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  userDistrictName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  userDistrictStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userDistrictStat: {
    alignItems: 'center',
  },
  userDistrictStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDistrictStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  districtList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  districtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  districtRank: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  districtRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  districtInfo: {
    flex: 1,
    marginRight: 12,
  },
  districtHeader: {
    marginBottom: 8,
  },
  districtName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  districtCity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  districtStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  districtStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  districtStatText: {
    fontSize: 12,
    color: '#64748B',
  },
  districtAchievements: {
    flexDirection: 'row',
    gap: 8,
  },
  achievementBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievementText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  districtPoints: {
    alignItems: 'center',
    marginRight: 12,
  },
  districtPointsNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  districtPointsLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  growthText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  winnersGrid: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 32,
  },
  winnerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  winnerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  winnerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  winnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  winnerDistrict: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  winnerStats: {
    alignItems: 'center',
  },
  winnerPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  winnerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  hallOfFame: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  hallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  hallSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  hallItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  hallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  hallInfo: {
    flex: 1,
  },
  hallName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  hallDistrict: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  hallPoints: {
    alignItems: 'center',
  },
  hallPointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  hallPointsLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  statsOverview: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  topDistricts: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  topDistrictItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  topDistrictRank: {
    marginRight: 16,
  },
  topDistrictInfo: {
    flex: 1,
  },
  topDistrictName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  topDistrictCity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  topDistrictStats: {
    alignItems: 'center',
  },
  topDistrictNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  topDistrictLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  successChart: {
    paddingHorizontal: 16,
  },
  chartContainer: {
    gap: 12,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 60,
  },
  chartBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    width: 40,
    textAlign: 'right',
  },
});