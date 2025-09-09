import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { 
  Trophy, 
  Star, 
  Gift, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  X,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { useGamification } from '@/hooks/gamification-store';
import { LinearGradient } from 'expo-linear-gradient';
import { NoAchievementsEmpty } from '@/components/EmptyStates';

const { width } = Dimensions.get('window');

interface BadgeModalProps {
  visible: boolean;
  badge: any;
  onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ visible, badge, onClose }) => {
  if (!badge) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.badgeModalHeader}>
            <Text style={styles.badgeEmoji}>{badge.icon}</Text>
            <Text style={styles.badgeModalTitle}>{badge.name}</Text>
            <Text style={styles.badgeModalDescription}>{badge.description}</Text>
          </View>
          
          <View style={styles.rewardSection}>
            <Gift size={24} color="#8B5CF6" />
            <Text style={styles.rewardText}>{badge.reward}</Text>
          </View>
          
          {badge.unlocked && (
            <View style={styles.unlockedSection}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.unlockedText}>Rozet Kazanıldı!</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const GamificationDashboard: React.FC = () => {
  const { 
    userStats, 
    badges, 
    dailyChallenges,
    weeklyChallenge, 
    heroTiers,
    currentTier,
    addReport, 
    addSuccessfulFind,
    completeDailyChallenge,
    getLevelInfo, 
    getNeighborhoodLeaderboard 
  } = useGamification();
  
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  const levelInfo = getLevelInfo();
  const neighborhoodLeaderboard = getNeighborhoodLeaderboard();

  const handleBadgePress = (badge: any) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const handleAddReport = async () => {
    try {
      const newBadges = await addReport();
      if (newBadges && newBadges.length > 0) {
        Alert.alert(
          '🎉 Yeni Rozet!',
          `${newBadges[0].name} rozetini kazandınız!`,
          [{ text: 'Harika!' }]
        );
      }
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Tier Card */}
      <LinearGradient
        colors={[currentTier.color, currentTier.color + 'CC']}
        style={styles.levelCard}
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelInfo}>
            <Text style={styles.tierEmoji}>{currentTier.icon}</Text>
            <Text style={styles.tierName}>{currentTier.name}</Text>
            <Text style={styles.tierDescription}>{currentTier.description}</Text>
            <Text style={styles.levelPoints}>{userStats.xpPoints} XP • {userStats.petsHelped} Hayvan Kurtarıldı</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Sonraki tier: {heroTiers.find(t => t.minPetsHelped > userStats.petsHelped)?.name || 'Maksimum Seviye!'}
          </Text>
          {heroTiers.find(t => t.minPetsHelped > userStats.petsHelped) && (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(userStats.petsHelped / heroTiers.find(t => t.minPetsHelped > userStats.petsHelped)!.minPetsHelped) * 100}%` }
                ]} 
              />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Target size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>{userStats.reportsCount}</Text>
          <Text style={styles.statLabel}>Rapor</Text>
        </View>
        
        <View style={styles.statCard}>
          <Award size={24} color="#10B981" />
          <Text style={styles.statNumber}>{userStats.petsHelped}</Text>
          <Text style={styles.statLabel}>Kurtarılan</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{userStats.streak}</Text>
          <Text style={styles.statLabel}>Seri</Text>
        </View>
        
        <View style={styles.statCard}>
          <Star size={24} color="#EF4444" />
          <Text style={styles.statNumber}>{userStats.xpPoints}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </View>

      {/* Daily Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Günlük Görevler</Text>
        <View style={styles.challengesContainer}>
          {dailyChallenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.dailyChallengeCard,
                challenge.completed && styles.challengeCompleted
              ]}
              onPress={() => !challenge.completed && completeDailyChallenge(challenge.id)}
            >
              <View style={styles.challengeHeader}>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={styles.challengeReward}>
                  <Text style={styles.xpReward}>+{challenge.xpReward} XP</Text>
                </View>
              </View>
              
              <View style={styles.challengeProgress}>
                <View style={styles.challengeProgressBar}>
                  <View 
                    style={[
                      styles.challengeProgressFill, 
                      { width: `${(challenge.progress / challenge.requirement) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.challengeProgressText}>
                  {challenge.progress}/{challenge.requirement}
                </Text>
              </View>
              
              {challenge.completed && (
                <View style={styles.completedBadge}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.completedText}>Tamamlandı!</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weekly Neighborhood Challenge */}
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View>
            <Text style={styles.challengeTitle}>{weeklyChallenge.title}</Text>
            <Text style={styles.challengeDescription}>{weeklyChallenge.description}</Text>
          </View>
          <Clock size={24} color="#8B5CF6" />
        </View>
        
        <View style={styles.challengeProgress}>
          <View style={styles.challengeProgressBar}>
            <View 
              style={[
                styles.challengeProgressFill, 
                { width: `${(weeklyChallenge.progress / weeklyChallenge.requirement) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.challengeProgressText}>
            {weeklyChallenge.progress}/{weeklyChallenge.requirement}
          </Text>
        </View>
        
        <View style={styles.challengeReward}>
          <Gift size={16} color="#10B981" />
          <Text style={styles.challengeRewardText}>{weeklyChallenge.reward}</Text>
        </View>
        
        {weeklyChallenge.completed && (
          <View style={styles.completedBadge}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.completedText}>Tamamlandı!</Text>
          </View>
        )}
      </View>

      {/* Hero Tiers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kahraman Seviyeleri</Text>
        <View style={styles.tiersContainer}>
          {heroTiers.map((tier, index) => {
            const isUnlocked = userStats.petsHelped >= tier.minPetsHelped;
            const isCurrent = currentTier.id === tier.id;
            
            return (
              <View
                key={tier.id}
                style={[
                  styles.tierCard,
                  isUnlocked && styles.tierUnlocked,
                  isCurrent && styles.tierCurrent
                ]}
              >
                <View style={styles.tierHeader}>
                  <Text style={[
                    styles.tierIcon,
                    !isUnlocked && styles.tierIconLocked
                  ]}>
                    {tier.icon}
                  </Text>
                  <View style={styles.tierInfo}>
                    <Text style={[
                      styles.tierTitle,
                      !isUnlocked && styles.tierTitleLocked,
                      isCurrent && styles.tierTitleCurrent
                    ]}>
                      {tier.name}
                    </Text>
                    <Text style={styles.tierRequirement}>
                      {tier.minPetsHelped} hayvan kurtarma gerekli
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentTierBadge}>
                      <Text style={styles.currentTierText}>Mevcut</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.tierBenefits}>
                  {tier.benefits.map((benefit, benefitIndex) => (
                    <Text key={benefitIndex} style={styles.tierBenefit}>
                      • {benefit}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Başarım Rozetleri</Text>
        {badges.filter(badge => badge.category !== 'hero_tier').length === 0 ? (
          <NoAchievementsEmpty 
            onExplore={() => {
              console.log('Exploring achievements...');
              Alert.alert(
                'Rozetler Nasıl Kazanılır?',
                'Kayıp hayvan bulma, topluluk etkinliklerine katılma ve diğer kullanıcılara yardım ederek rozetler kazanabilirsiniz!',
                [{ text: 'Anladım' }]
              );
            }}
          />
        ) : (
          <View style={styles.badgesGrid}>
            {badges.filter(badge => badge.category !== 'hero_tier').map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard,
                  badge.unlocked && styles.badgeUnlocked
                ]}
                onPress={() => handleBadgePress(badge)}
              >
                <Text style={[
                  styles.badgeIcon,
                  !badge.unlocked && styles.badgeIconLocked
                ]}>
                  {badge.icon}
                </Text>
                <Text style={[
                  styles.badgeName,
                  !badge.unlocked && styles.badgeNameLocked
                ]}>
                  {badge.name}
                </Text>
                {badge.unlocked && (
                  <View style={styles.badgeUnlockedIndicator}>
                    <CheckCircle size={16} color="#10B981" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Neighborhood Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mahalle Liderlik Tablosu - {neighborhoodLeaderboard.neighborhood}</Text>
        <Text style={styles.sectionSubtitle}>
          Bu hafta {neighborhoodLeaderboard.totalPetsHelped}/{neighborhoodLeaderboard.weeklyGoal} hayvan kurtarıldı
        </Text>
        <View style={styles.leaderboard}>
          {neighborhoodLeaderboard.users.slice(0, 5).map((user, index) => {
            const tier = heroTiers.find(t => t.id === user.tier);
            
            return (
              <View key={user.id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                
                <Text style={styles.leaderboardAvatar}>{user.avatar}</Text>
                
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{user.name}</Text>
                  <View style={styles.leaderboardTier}>
                    <Text style={styles.tierEmoji}>{tier?.icon}</Text>
                    <Text style={styles.leaderboardTierText}>{tier?.name}</Text>
                  </View>
                  <Text style={styles.leaderboardStats}>
                    {user.petsHelped} hayvan kurtardı
                  </Text>
                </View>
                
                <Text style={styles.leaderboardPoints}>{user.points} XP</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddReport}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.actionButtonGradient}
          >
            <Target size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Kayıp Bildir</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={async () => {
          try {
            const result = await addSuccessfulFind();
            if (result?.tierUpgrade) {
              Alert.alert(
                '🎉 Tier Yükseltme!',
                `${result.tierUpgrade.name} seviyesine yükseldiniz!`,
                [{ text: 'Harika!' }]
              );
            }
          } catch (error) {
            console.error('Error adding successful find:', error);
          }
        }}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.actionButtonGradient}
          >
            <Award size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Hayvan Kurtardım</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <BadgeModal
        visible={showBadgeModal}
        badge={selectedBadge}
        onClose={() => setShowBadgeModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  levelCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
  },
  tierEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  levelPoints: {
    fontSize: 16,
    color: '#E5E7EB',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  challengeProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  challengeProgressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'right',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeRewardText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: (width - 56) / 3,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.6,
  },
  badgeUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#9CA3AF',
  },
  badgeUnlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  leaderboard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leaderboardRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  leaderboardLevel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 0,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  badgeModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  badgeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  badgeModalDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  unlockedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  unlockedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  challengesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  dailyChallengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  challengeInfo: {
    flex: 1,
  },
  xpReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tiersContainer: {
    gap: 12,
  },
  tierCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    opacity: 0.6,
  },
  tierUnlocked: {
    opacity: 1,
  },
  tierCurrent: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#F8F7FF',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tierIconLocked: {
    opacity: 0.5,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tierTitleLocked: {
    color: '#9CA3AF',
  },
  tierTitleCurrent: {
    color: '#8B5CF6',
  },
  tierRequirement: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  currentTierBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentTierText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tierBenefits: {
    gap: 4,
  },
  tierBenefit: {
    fontSize: 12,
    color: '#6B7280',
  },
  leaderboardTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  leaderboardTierText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  leaderboardStats: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
});