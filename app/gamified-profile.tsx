import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LiquidGlassCard as GlassCard } from '@/components/GlassComponents';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';



interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconType: 'ion' | 'material' | 'fontawesome';
  progress: number;
  maxProgress: number;
  reward: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Melek Koruyucu',
    description: '10 evcil hayvan kurtardın',
    icon: 'shield-star',
    iconType: 'material',
    progress: 8,
    maxProgress: 10,
    reward: 500,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: '2',
    title: 'Gece Bekçisi',
    description: 'Gece aramalarında aktif',
    icon: 'moon',
    iconType: 'ion',
    progress: 15,
    maxProgress: 20,
    reward: 200,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: '3',
    title: 'İlk Kurtarma',
    description: 'İlk başarılı reunionun',
    icon: 'heart',
    iconType: 'ion',
    progress: 1,
    maxProgress: 1,
    reward: 100,
    unlocked: true,
    rarity: 'common',
  },
  {
    id: '4',
    title: 'Efsane',
    description: '100 hayvan kurtardın!',
    icon: 'crown',
    iconType: 'fontawesome',
    progress: 42,
    maxProgress: 100,
    reward: 10000,
    unlocked: false,
    rarity: 'legendary',
  },
];

interface Pet {
  id: string;
  name: string;
  type: string;
  image: string;
  status: 'safe' | 'lost' | 'found';
}

const myPets: Pet[] = [
  {
    id: '1',
    name: 'Luna',
    type: 'Golden Retriever',
    image: 'https://placedog.net/200/200?id=5',
    status: 'safe',
  },
  {
    id: '2',
    name: 'Max',
    type: 'British Shorthair',
    image: 'https://placekitten.com/200/200?image=5',
    status: 'safe',
  },
];

export default function GamifiedProfileScreen() {
  const [activeTab, setActiveTab] = useState<'achievements' | 'stats' | 'pets'>('achievements');
  const [pawCoins] = useState(2847);
  const [rescueScore] = useState(847);

  const rarityColors = {
    common: ['#B0BEC5', '#90A4AE'] as const,
    rare: ['#42A5F5', '#1E88E5'] as const,
    epic: ['#AB47BC', '#8E24AA'] as const,
    legendary: ['#FFD600', '#FFC107'] as const,
  };

  const ProfileHeader = () => {
    const levelProgress = 73; // %73 seviye ilerlemesi
    
    return (
      <LinearGradient
        colors={['#667EEA', '#764BA2', '#F093FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <View style={styles.profileImageContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFC107']}
            style={styles.profileRing}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/300' }}
              style={styles.profileImage}
            />
          </LinearGradient>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>42</Text>
          </View>
        </View>
        
        <Text style={styles.profileName}>Ali Yılmaz</Text>
        <Text style={styles.profileTitle}>🏆 Elite Rescue Squad</Text>
        
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>{rescueScore}</Text>
            <Text style={styles.profileStatLabel}>Skor</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>42</Text>
            <Text style={styles.profileStatLabel}>Kurtarma</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>Top 5%</Text>
            <Text style={styles.profileStatLabel}>Sıralama</Text>
          </View>
        </View>
        
        <View style={styles.levelProgress}>
          <View style={styles.levelProgressBg} />
          <Animated.View
            style={[
              styles.levelProgressFill,
              { width: `${levelProgress}%` },
            ]}
          />
        </View>
        <Text style={styles.levelProgressText}>
          Level 42 → 43 (1,230 / 2,000 XP)
        </Text>
      </LinearGradient>
    );
  };

  const PawCoinsSection = () => (
    <GlassCard style={styles.pawCoinsCard}>
      <View style={styles.pawCoinsHeader}>
        <View style={styles.pawCoinsLeft}>
          <MaterialCommunityIcons name="paw" size={32} color="#FFD700" />
          <View style={styles.pawCoinsInfo}>
            <Text style={styles.pawCoinsAmount}>{pawCoins.toLocaleString('tr-TR')}</Text>
            <Text style={styles.pawCoinsLabel}>PawCoin</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.pawCoinsButton}>
          <LinearGradient
            colors={['#FFD700', '#FFC107']}
            style={styles.pawCoinsBtnGradient}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.pawCoinsBtnText}>Kazan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <View style={styles.pawCoinsRewards}>
        <Text style={styles.rewardsTitle}>Ödüllere Çevir</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Ionicons name="ribbon" size={24} color="#667EEA" />
            </View>
            <Text style={styles.rewardCost}>1,000</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Ionicons name="gift" size={24} color="#FF5252" />
            </View>
            <Text style={styles.rewardCost}>2,500</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Ionicons name="heart" size={24} color="#4ECDC4" />
            </View>
            <Text style={styles.rewardCost}>5,000</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </GlassCard>
  );

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const scaleAnim = useSharedValue(1);
    
    const handlePress = () => {
      scaleAnim.value = withSpring(0.95, {}, () => {
        scaleAnim.value = withSpring(1);
      });
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    const IconComponent = 
      achievement.iconType === 'ion' ? Ionicons :
      achievement.iconType === 'material' ? MaterialCommunityIcons :
      FontAwesome5;

    return (
      <Animated.View style={animStyle}>
        <TouchableOpacity onPress={handlePress}>
          <GlassCard style={styles.achievementCard}>
            <LinearGradient
              colors={rarityColors[achievement.rarity]}
              style={styles.achievementIconBg}
            >
              <IconComponent
                name={achievement.icon as any}
                size={28}
                color="#FFF"
              />
            </LinearGradient>
            
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
              
              <View style={styles.achievementProgress}>
                <View style={styles.achievementProgressBg}>
                  <Animated.View
                    style={[
                      styles.achievementProgressFill,
                      {
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                        backgroundColor: rarityColors[achievement.rarity][0],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.achievementProgressText}>
                  {achievement.progress}/{achievement.maxProgress}
                </Text>
              </View>
            </View>
            
            {achievement.unlocked ? (
              <View style={styles.unlockedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
              </View>
            ) : (
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>+{achievement.reward}</Text>
              </View>
            )}
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const PetCard = ({ pet }: { pet: Pet }) => (
    <TouchableOpacity style={styles.petCard}>
      <GlassCard style={styles.petCardInner}>
        <Image source={{ uri: pet.image }} style={styles.petImage} />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>{pet.type}</Text>
        </View>
        <View style={[styles.petStatus, 
          pet.status === 'safe' ? styles.statusSafe :
          pet.status === 'lost' ? styles.statusLost :
          pet.status === 'found' ? styles.statusFound : null
        ]}>
          <Text style={styles.petStatusText}>
            {pet.status === 'safe' ? 'Güvende' : pet.status === 'lost' ? 'Kayıp' : 'Bulundu'}
          </Text>
        </View>
        <TouchableOpacity style={styles.petMenu}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F1E']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileHeader />
          <PawCoinsSection />
          
          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
              onPress={() => {
                setActiveTab('achievements');
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
              }}
            >
              <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
                Rozetler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
              onPress={() => {
                setActiveTab('stats');
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
              }}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                İstatistikler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pets' && styles.tabActive]}
              onPress={() => {
                setActiveTab('pets');
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
              }}
            >
              <Text style={[styles.tabText, activeTab === 'pets' && styles.tabTextActive]}>
                Dostlarım
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Content based on active tab */}
          {activeTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </View>
          )}
          
          {activeTab === 'stats' && (
            <View style={styles.statsContainer}>
              <GlassCard style={styles.statCard}>
                <Text style={styles.statTitle}>Bu Hafta</Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Paylaşım</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Görülme</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>847</Text>
                    <Text style={styles.statLabel}>XP</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>24h</Text>
                    <Text style={styles.statLabel}>Aktif Süre</Text>
                  </View>
                </View>
              </GlassCard>
              
              <GlassCard style={styles.leaderboardCard}>
                <Text style={styles.leaderboardTitle}>🏆 Lider Tablosu</Text>
                <View style={styles.leaderboardItem}>
                  <Text style={styles.leaderboardRank}>1</Text>
                  <Text style={styles.leaderboardName}>Ahmet K.</Text>
                  <Text style={styles.leaderboardScore}>2,847</Text>
                </View>
                <View style={styles.leaderboardItem}>
                  <Text style={styles.leaderboardRank}>2</Text>
                  <Text style={styles.leaderboardName}>Zeynep A.</Text>
                  <Text style={styles.leaderboardScore}>2,341</Text>
                </View>
                <View style={[styles.leaderboardItem, styles.myRank]}>
                  <Text style={styles.leaderboardRank}>5</Text>
                  <Text style={styles.leaderboardName}>Sen</Text>
                  <Text style={styles.leaderboardScore}>847</Text>
                </View>
              </GlassCard>
            </View>
          )}
          
          {activeTab === 'pets' && (
            <View style={styles.petsContainer}>
              {myPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
              <TouchableOpacity style={styles.addPetButton}>
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  style={styles.addPetGradient}
                >
                  <Ionicons name="add-circle" size={32} color="#FFF" />
                  <Text style={styles.addPetText}>Yeni Dost Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  gradient: {
    flex: 1,
  },
  profileHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#667EEA',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1A1A2E',
  },
  levelNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  profileTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: 20,
  },
  profileStat: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  profileStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelProgress: {
    width: '100%',
    height: 8,
    marginTop: 20,
    position: 'relative',
  },
  levelProgressBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  pawCoinsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pawCoinsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pawCoinsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pawCoinsInfo: {
    marginLeft: 12,
  },
  pawCoinsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
  },
  pawCoinsLabel: {
    fontSize: 12,
    color: '#AAA',
  },
  pawCoinsButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  pawCoinsBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pawCoinsBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  pawCoinsRewards: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  rewardsTitle: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 12,
  },
  rewardItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rewardCost: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#667EEA',
  },
  tabText: {
    fontSize: 14,
    color: '#AAA',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  achievementCard: {
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  achievementIconBg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: '#AAA',
    marginLeft: 8,
  },
  unlockedBadge: {
    padding: 8,
  },
  rewardBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },
  leaderboardCard: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  leaderboardRank: {
    width: 30,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
  },
  leaderboardScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  myRank: {
    backgroundColor: 'rgba(102,126,234,0.1)',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  petsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  petCard: {
    marginBottom: 12,
  },
  petCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petInfo: {
    flex: 1,
    marginLeft: 16,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  petType: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  petStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSafe: {
    backgroundColor: 'rgba(78,205,196,0.2)',
  },
  statusLost: {
    backgroundColor: 'rgba(255,82,82,0.2)',
  },
  statusFound: {
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  petStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  petMenu: {
    padding: 8,
  },
  addPetButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addPetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  addPetText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});