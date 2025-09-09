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
  Heart,
  MapPin,
  Clock,
  Users,
  Award,
  Zap,
  Target,
  TrendingUp,
  Flag,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGamification } from '@/hooks/gamification-store';
import NeighborhoodLeaderboards from '@/components/NeighborhoodLeaderboards';
import { ScaleTransition } from '@/components/PageTransition';
import { NoLeaderboardEmpty, NoAchievementsEmpty } from '@/components/EmptyStates';

interface Hero {
  id: string;
  name: string;
  avatar: string;
  level: number;
  points: number;
  petsFound: number;
  successRate: number;
  location: string;
  badges: string[];
  recentActivity: string;
  rank: number;
  isOnline: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

export default function HeroBoardScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'achievements' | 'neighborhoods'>('leaderboard');
  
  const { 
    heroTiers, 
    getGlobalLeaderboard, 
    getNeighborhoodLeaderboard,
    badges 
  } = useGamification();
  
  const globalLeaderboard = getGlobalLeaderboard();
  const neighborhoodLeaderboard = getNeighborhoodLeaderboard();

  const mockHeroes: Hero[] = globalLeaderboard.map((user, index) => {
    const tier = heroTiers.find(t => t.id === user.tier);
    return {
      id: user.id,
      name: user.name,
      avatar: `https://images.unsplash.com/photo-${index === 0 ? '1494790108755-2616b612b786' : index === 1 ? '1507003211169-0a1dd7228f2d' : index === 2 ? '1438761681033-6461ffad8d80' : '1472099645785-5658abf4ff4e'}?w=100&h=100&fit=crop&crop=face`,
      level: user.level,
      points: user.points,
      petsFound: Math.floor(user.points / 100), // Estimate pets found from points
      successRate: 85 + (index * 2), // Mock success rate
      location: user.neighborhood + ', İstanbul',
      badges: [tier?.icon || '🏆', '⭐', '💎'],
      recentActivity: `${index + 1} saat önce bir hayvan kurtardı`,
      rank: index + 1,
      isOnline: index < 3,
    };
  });

  const mockAchievements: Achievement[] = badges.filter(badge => badge.category !== 'hero_tier').map(badge => ({
    id: badge.id,
    title: badge.name,
    description: badge.description,
    icon: Star, // Default icon component
    color: badge.unlocked ? '#10B981' : '#6B7280',
    progress: badge.unlocked ? badge.requirement : Math.floor(badge.requirement * 0.7),
    maxProgress: badge.requirement,
    unlocked: badge.unlocked,
  }));

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

  const renderLeaderboard = () => {
    if (mockHeroes.length === 0) {
      return (
        <View style={styles.tabContent}>
          <NoLeaderboardEmpty onJoin={() => {
            console.log('Starting to participate in community activities...');
            // Navigate to community activities or onboarding
          }} />
        </View>
      );
    }
    
    return (
      <View style={styles.tabContent}>
        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.podiumGradient}
        >
          <Text style={styles.podiumTitle}>🏆 En İyi Kahramanlar</Text>
          <View style={styles.podium}>
            {/* 2nd Place */}
            <View style={[styles.podiumPlace, styles.secondPlace]}>
              <Image source={{ uri: mockHeroes[1]?.avatar }} style={styles.podiumAvatar} />
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>2</Text>
              </View>
              <Text style={styles.podiumName}>{mockHeroes[1]?.name.split(' ')[0]}</Text>
              <Text style={styles.podiumPoints}>{mockHeroes[1]?.points} XP</Text>
              <Text style={styles.podiumTier}>{heroTiers.find(t => t.id === globalLeaderboard[1]?.tier)?.icon}</Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumPlace, styles.firstPlace]}>
              <Image source={{ uri: mockHeroes[0]?.avatar }} style={[styles.podiumAvatar, styles.firstAvatar]} />
              <View style={[styles.podiumRank, styles.firstRank]}>
                <Crown color="#FFFFFF" size={20} />
              </View>
              <Text style={styles.podiumName}>{mockHeroes[0]?.name.split(' ')[0]}</Text>
              <Text style={styles.podiumPoints}>{mockHeroes[0]?.points} XP</Text>
              <Text style={styles.podiumTier}>{heroTiers.find(t => t.id === globalLeaderboard[0]?.tier)?.icon}</Text>
              <View style={styles.crownContainer}>
                <Crown color="#FFD700" size={32} />
              </View>
            </View>

            {/* 3rd Place */}
            <View style={[styles.podiumPlace, styles.thirdPlace]}>
              <Image source={{ uri: mockHeroes[2]?.avatar }} style={styles.podiumAvatar} />
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>3</Text>
              </View>
              <Text style={styles.podiumName}>{mockHeroes[2]?.name.split(' ')[0]}</Text>
              <Text style={styles.podiumPoints}>{mockHeroes[2]?.points} XP</Text>
              <Text style={styles.podiumTier}>{heroTiers.find(t => t.id === globalLeaderboard[2]?.tier)?.icon}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Full Leaderboard */}
      <View style={styles.leaderboardList}>
        <Text style={styles.sectionTitle}>Küresel Liderlik Tablosu</Text>
        {mockHeroes.map((hero, index) => {
          const tier = heroTiers.find(t => t.id === globalLeaderboard[index]?.tier);
          
          return (
            <TouchableOpacity key={hero.id} style={styles.heroCard}>
              <View style={styles.heroRank}>
                {getRankIcon(hero.rank)}
                <Text style={[styles.heroRankText, { color: getRankColor(hero.rank) }]}>
                  #{hero.rank}
                </Text>
              </View>

              <View style={styles.heroAvatarContainer}>
                <Image source={{ uri: hero.avatar }} style={styles.heroAvatar} />
                {hero.isOnline && <View style={styles.onlineIndicator} />}
                <View style={[styles.heroLevel, { backgroundColor: tier?.color || '#8B5CF6' }]}>
                  <Text style={styles.heroLevelText}>{tier?.icon}</Text>
                </View>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>{hero.name}</Text>
                <View style={styles.heroTierInfo}>
                  <Text style={[styles.heroTierName, { color: tier?.color || '#8B5CF6' }]}>
                    {tier?.name}
                  </Text>
                </View>
                <Text style={styles.heroLocation}>{hero.location}</Text>
                <Text style={styles.heroActivity}>{hero.recentActivity}</Text>
              </View>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatNumber}>{Math.floor(hero.points / 100)}</Text>
                  <Text style={styles.heroStatLabel}>Kurtarılan</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatNumber}>{hero.points}</Text>
                  <Text style={styles.heroStatLabel}>XP</Text>
                </View>
              </View>

              <View style={styles.heroBadges}>
                {hero.badges.map((badge, badgeIndex) => (
                  <Text key={badgeIndex} style={styles.badge}>{badge}</Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      </View>
    );
  };

  const renderAchievements = () => {
    if (mockAchievements.length === 0) {
      return (
        <View style={styles.tabContent}>
          <NoAchievementsEmpty onExplore={() => {
            console.log('Exploring achievements...');
            // Navigate to achievements guide or community activities
          }} />
        </View>
      );
    }
    
    return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Başarımlar</Text>
      <Text style={styles.sectionSubtitle}>
        Özel görevleri tamamlayarak rozetler kazan
      </Text>

      <View style={styles.achievementsList}>
        {mockAchievements.map((achievement) => {
          const IconComponent = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

          return (
            <TouchableOpacity
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementUnlocked,
              ]}
            >
              <View style={styles.achievementHeader}>
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.color + '20' },
                    achievement.unlocked && { backgroundColor: achievement.color },
                  ]}
                >
                  <IconComponent
                    color={achievement.unlocked ? '#FFFFFF' : achievement.color}
                    size={24}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      achievement.unlocked && styles.achievementTitleUnlocked,
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <View style={styles.achievementBadge}>
                    <Star color="#FFD700" size={20} fill="#FFD700" />
                  </View>
                )}
              </View>

              <View style={styles.achievementProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { 
                        width: `${progressPercentage}%`,
                        backgroundColor: achievement.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {achievement.progress}/{achievement.maxProgress}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      </View>
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <ScaleTransition>
      <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Trophy color="#FFFFFF" size={28} />
              <Text style={styles.headerTitle}>Kahraman Panosu</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Sokak hayvanları için mücadele eden kahramanlar
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'leaderboard' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('leaderboard')}
        >
          <TrendingUp
            color={selectedTab === 'leaderboard' ? '#FF6B6B' : '#64748B'}
            size={18}
          />
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'leaderboard' && styles.tabButtonTextActive,
            ]}
          >
            Liderlik
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'neighborhoods' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('neighborhoods')}
        >
          <Flag
            color={selectedTab === 'neighborhoods' ? '#FF6B6B' : '#64748B'}
            size={18}
          />
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'neighborhoods' && styles.tabButtonTextActive,
            ]}
          >
            Mahalleler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'achievements' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Award
            color={selectedTab === 'achievements' ? '#FF6B6B' : '#64748B'}
            size={18}
          />
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'achievements' && styles.tabButtonTextActive,
            ]}
          >
            Başarımlar
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
        {selectedTab === 'leaderboard' && renderLeaderboard()}
        {selectedTab === 'neighborhoods' && <NeighborhoodLeaderboards />}
        {selectedTab === 'achievements' && renderAchievements()}
      </Animated.ScrollView>
      </View>
    </ScaleTransition>
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
  podiumContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  podiumGradient: {
    padding: 20,
  },
  podiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
  },
  podiumPlace: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    minWidth: 80,
  },
  firstPlace: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ scale: 1.1 }],
    marginBottom: 20,
  },
  secondPlace: {
    marginBottom: 10,
  },
  thirdPlace: {
    marginBottom: 5,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  firstAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  podiumRank: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstRank: {
    backgroundColor: '#FFD700',
  },
  podiumRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  podiumPoints: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  podiumTier: {
    fontSize: 16,
    marginTop: 4,
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -16,
  },
  leaderboardList: {
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
  heroCard: {
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
  heroRank: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  heroRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  heroAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  heroAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroLevel: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLevelText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  heroInfo: {
    flex: 1,
    marginRight: 12,
  },
  heroName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  heroLocation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  heroActivity: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
  },
  heroTierInfo: {
    marginTop: 2,
  },
  heroTierName: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroStats: {
    alignItems: 'center',
    marginRight: 12,
  },
  heroStat: {
    alignItems: 'center',
    marginBottom: 4,
  },
  heroStatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  heroStatLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    fontSize: 16,
  },
  achievementsList: {
    paddingHorizontal: 16,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementUnlocked: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  achievementTitleUnlocked: {
    color: '#FFD700',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  achievementBadge: {
    marginLeft: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 40,
  },
});