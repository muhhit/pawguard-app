import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getMockBadges, 
  getMockLeaderboard,
  mockHeroTiers 
} from '@/lib/mock-data';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'hero_tier' | 'achievement' | 'special';
}

export interface HeroTier {
  id: string;
  name: string;
  description: string;
  icon: string;
  minPetsHelped: number;
  color: string;
  benefits: string[];
}

export interface UserStats {
  reportsCount: number;
  successfulFinds: number;
  helpedOwners: number;
  totalPoints: number;
  level: number;
  weeklyReports: number;
  streak: number;
  lastReportDate?: string;
  petsHelped: number;
  currentTier: string;
  xpPoints: number;
  dailyChallengesCompleted: number;
  weeklyRank: number;
  neighborhood: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  reward: string;
  xpReward: number;
  progress: number;
  completed: boolean;
  expiresAt: string;
  type: 'report' | 'help' | 'social' | 'streak';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  reward: string;
  progress: number;
  completed: boolean;
  expiresAt: string;
}

export interface NeighborhoodLeaderboard {
  neighborhood: string;
  users: {
    id: string;
    name: string;
    points: number;
    petsHelped: number;
    tier: string;
    avatar?: string;
  }[];
  totalPetsHelped: number;
  weeklyGoal: number;
}

const HERO_TIERS: HeroTier[] = [
  {
    id: 'sokak_koruyucu',
    name: 'Sokak Koruyucu',
    description: 'İlk adımını atan kahraman',
    icon: '🛡️',
    minPetsHelped: 1,
    color: '#10B981',
    benefits: ['Özel rozet', 'Topluluk erişimi', '10 XP bonus']
  },
  {
    id: 'hayvan_dostu',
    name: 'Hayvan Dostu',
    description: 'Güvenilir yardımcı',
    icon: '🐕',
    minPetsHelped: 5,
    color: '#3B82F6',
    benefits: ['Öncelikli bildirimler', 'Özel avatar çerçevesi', '25 XP bonus']
  },
  {
    id: 'toplum_kahramani',
    name: 'Toplum Kahramanı',
    description: 'Mahalle lideri',
    icon: '⭐',
    minPetsHelped: 20,
    color: '#8B5CF6',
    benefits: ['Liderlik rozetleri', 'Özel etkinlik erişimi', '50 XP bonus']
  },
  {
    id: 'hayat_kurtaran',
    name: 'Hayat Kurtaran',
    description: 'Efsanevi kurtarıcı',
    icon: '🏆',
    minPetsHelped: 50,
    color: '#F59E0B',
    benefits: ['Altın rozet', 'Mentor statüsü', '100 XP bonus']
  },
  {
    id: 'legendar_koruyucu',
    name: 'Legendar Koruyucu',
    description: 'Efsanevi kahraman',
    icon: '👑',
    minPetsHelped: 100,
    color: '#EF4444',
    benefits: ['Elmas rozet', 'Hall of Fame', '200 XP bonus', 'Özel ödüller']
  }
];

const BADGES: Badge[] = [
  // Hero Tier Badges
  ...HERO_TIERS.map(tier => ({
    id: tier.id,
    name: tier.name,
    description: tier.description,
    icon: tier.icon,
    requirement: tier.minPetsHelped,
    reward: tier.benefits.join(', '),
    unlocked: false,
    category: 'hero_tier' as const
  })),
  // Achievement Badges
  {
    id: 'first_report',
    name: 'İlk Adım',
    description: 'İlk kayıp bildirimin',
    icon: '🌟',
    requirement: 1,
    reward: 'Avatar çerçevesi + 50 XP',
    unlocked: false,
    category: 'achievement'
  },
  {
    id: 'streak_master',
    name: 'Süreklilik Ustası',
    description: '7 gün üst üste rapor',
    icon: '🔥',
    requirement: 7,
    reward: 'Özel rozet + 100 XP',
    unlocked: false,
    category: 'achievement'
  },
  {
    id: 'night_guardian',
    name: 'Gece Bekçisi',
    description: 'Gece saatlerinde 5 rapor',
    icon: '🌙',
    requirement: 5,
    reward: 'Gece rozetleri + 75 XP',
    unlocked: false,
    category: 'achievement'
  },
  {
    id: 'speed_helper',
    name: 'Hızlı Müdahale',
    description: '1 saat içinde 3 rapor',
    icon: '⚡',
    requirement: 3,
    reward: 'Hız rozetleri + 100 XP',
    unlocked: false,
    category: 'achievement'
  },
  {
    id: 'community_leader',
    name: 'Topluluk Lideri',
    description: '10 kişiye yardım et',
    icon: '👥',
    requirement: 10,
    reward: 'Liderlik rozetleri + 150 XP',
    unlocked: false,
    category: 'achievement'
  },
  {
    id: 'perfect_week',
    name: 'Mükemmel Hafta',
    description: 'Haftalık tüm görevleri tamamla',
    icon: '💎',
    requirement: 1,
    reward: 'Elmas rozet + 200 XP',
    unlocked: false,
    category: 'special'
  }
];

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily_report',
    title: 'Günlük Rapor',
    description: '1 kayıp hayvan bildir',
    requirement: 1,
    reward: '50 XP + rozet',
    xpReward: 50,
    progress: 0,
    completed: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    type: 'report'
  },
  {
    id: 'help_street_animals',
    title: 'Sokak Hayvanları',
    description: '5 sokak hayvanına yardım et',
    requirement: 5,
    reward: '100 XP + özel rozet',
    xpReward: 100,
    progress: 0,
    completed: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    type: 'help'
  },
  {
    id: 'social_share',
    title: 'Paylaşım Gücü',
    description: '3 kayıp ilanını paylaş',
    requirement: 3,
    reward: '75 XP + sosyal rozet',
    xpReward: 75,
    progress: 0,
    completed: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    type: 'social'
  },
  {
    id: 'maintain_streak',
    title: 'Seri Devam',
    description: 'Günlük seriyi koru',
    requirement: 1,
    reward: '25 XP + seri rozetleri',
    xpReward: 25,
    progress: 0,
    completed: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    type: 'streak'
  }
];

export const [GamificationProvider, useGamification] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [userStats, setUserStats] = useState<UserStats>({
    reportsCount: 0,
    successfulFinds: 0,
    helpedOwners: 0,
    totalPoints: 0,
    level: 1,
    weeklyReports: 0,
    streak: 0,
    petsHelped: 0,
    currentTier: 'sokak_koruyucu',
    xpPoints: 0,
    dailyChallengesCompleted: 0,
    weeklyRank: 0,
    neighborhood: 'Kadıköy'
  });
  
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge>({
    id: 'weekly_reports',
    title: 'Haftalık Mahalle Hedefi',
    description: 'Mahallende bu hafta 10 kayıp bildir',
    requirement: 10,
    reward: '200 XP + mahalle lideri rozetleri',
    progress: 0,
    completed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
  const [neighborhoodLeaderboard, setNeighborhoodLeaderboard] = useState<NeighborhoodLeaderboard>({
    neighborhood: 'Kadıköy',
    users: [],
    totalPetsHelped: 0,
    weeklyGoal: 50
  });

  // Load user stats from AsyncStorage
  const loadUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const stored = await AsyncStorage.getItem(`gamification_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setUserStats(data.stats || userStats);
        setBadges(data.badges || BADGES);
        setDailyChallenges(data.dailyChallenges || DAILY_CHALLENGES);
        setWeeklyChallenge(data.weeklyChallenge || weeklyChallenge);
        setNeighborhoodLeaderboard(data.neighborhoodLeaderboard || neighborhoodLeaderboard);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  }, [user]);

  // Save user stats to AsyncStorage
  const saveUserStats = useCallback(async (
    stats: UserStats, 
    badgeList: Badge[], 
    dailyChallengeList: DailyChallenge[],
    challenge: WeeklyChallenge,
    leaderboard: NeighborhoodLeaderboard
  ) => {
    if (!user) return;
    
    try {
      const data = {
        stats,
        badges: badgeList,
        dailyChallenges: dailyChallengeList,
        weeklyChallenge: challenge,
        neighborhoodLeaderboard: leaderboard
      };
      await AsyncStorage.setItem(`gamification_${user.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUserStats();
    }
  }, [isAuthenticated, loadUserStats]);

  // Get current hero tier
  const getCurrentTier = useCallback((petsHelped: number): HeroTier => {
    return HERO_TIERS.slice().reverse().find(tier => petsHelped >= tier.minPetsHelped) || HERO_TIERS[0];
  }, []);

  // Add report and update stats
  const addReport = useCallback(async () => {
    if (!user) return;
    
    const now = new Date();
    const today = now.toDateString();
    const lastReportDate = userStats.lastReportDate ? new Date(userStats.lastReportDate).toDateString() : null;
    
    // Calculate streak
    let newStreak = userStats.streak;
    if (lastReportDate === today) {
      // Already reported today, don't increment
      return;
    } else if (lastReportDate === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      // Reported yesterday, continue streak
      newStreak += 1;
    } else {
      // Streak broken or first report
      newStreak = 1;
    }
    
    const baseXP = 50;
    const currentTier = getCurrentTier(userStats.petsHelped);
    const tierBonus = HERO_TIERS.find(t => t.id === currentTier.id)?.benefits.includes('XP bonus') ? 25 : 0;
    const totalXP = baseXP + tierBonus;
    
    const newStats: UserStats = {
      ...userStats,
      reportsCount: userStats.reportsCount + 1,
      weeklyReports: userStats.weeklyReports + 1,
      totalPoints: userStats.totalPoints + 10,
      xpPoints: userStats.xpPoints + totalXP,
      level: Math.floor((userStats.totalPoints + 10) / 100) + 1,
      streak: newStreak,
      lastReportDate: now.toISOString()
    };
    
    // Update daily challenges
    const updatedDailyChallenges = dailyChallenges.map(challenge => {
      if (!challenge.completed && challenge.type === 'report') {
        const newProgress = challenge.progress + 1;
        return {
          ...challenge,
          progress: newProgress,
          completed: newProgress >= challenge.requirement
        };
      }
      return challenge;
    });
    
    // Check for new badges
    const updatedBadges = badges.map(badge => {
      if (!badge.unlocked) {
        if (badge.id === 'streak_master' && newStreak >= badge.requirement) {
          return { ...badge, unlocked: true, unlockedAt: now.toISOString() };
        } else if (badge.id === 'first_report' && newStats.reportsCount >= badge.requirement) {
          return { ...badge, unlocked: true, unlockedAt: now.toISOString() };
        }
      }
      return badge;
    });
    
    // Send notifications for newly unlocked badges
    const newlyUnlockedBadges = updatedBadges.filter(badge => 
      badge.unlocked && 
      badge.unlockedAt && 
      new Date(badge.unlockedAt).getTime() > now.getTime() - 1000
    );
    
    // Note: We'll send notifications via a callback since we can't import useNotifications here
    // This will be handled by the component using this hook
    
    // Update weekly challenge
    const updatedChallenge = {
      ...weeklyChallenge,
      progress: Math.min(newStats.weeklyReports, weeklyChallenge.requirement),
      completed: newStats.weeklyReports >= weeklyChallenge.requirement
    };
    
    setUserStats(newStats);
    setBadges(updatedBadges);
    setDailyChallenges(updatedDailyChallenges);
    setWeeklyChallenge(updatedChallenge);
    
    await saveUserStats(newStats, updatedBadges, updatedDailyChallenges, updatedChallenge, neighborhoodLeaderboard);
    
    // Return newly unlocked badges
    return updatedBadges.filter(badge => 
      badge.unlocked && 
      badge.unlockedAt && 
      new Date(badge.unlockedAt).getTime() > now.getTime() - 1000
    );
  }, [user, userStats, badges, dailyChallenges, weeklyChallenge, neighborhoodLeaderboard, saveUserStats, getCurrentTier]);

  // Add successful find (pet helped) - can be emergency response or regular
  const addSuccessfulFind = useCallback(async (isEmergencyResponse: boolean = false) => {
    if (!user) return;
    
    const now = new Date();
    const newPetsHelped = userStats.petsHelped + 1;
    const currentTier = getCurrentTier(userStats.petsHelped);
    const newTier = getCurrentTier(newPetsHelped);
    
    // Emergency responses get 500 hero points, regular finds get 100
    const baseXP = isEmergencyResponse ? 500 : 100;
    const tierBonus = HERO_TIERS.find(t => t.id === currentTier.id)?.benefits.includes('XP bonus') ? (isEmergencyResponse ? 100 : 50) : 0;
    const totalXP = baseXP + tierBonus;
    
    // Emergency responses get more points
    const pointsAwarded = isEmergencyResponse ? 100 : 50;
    
    const newStats: UserStats = {
      ...userStats,
      successfulFinds: userStats.successfulFinds + 1,
      petsHelped: newPetsHelped,
      totalPoints: userStats.totalPoints + pointsAwarded,
      xpPoints: userStats.xpPoints + totalXP,
      level: Math.floor((userStats.totalPoints + pointsAwarded) / 100) + 1,
      currentTier: newTier.id
    };
    
    // Check for tier upgrade badges
    const updatedBadges = badges.map(badge => {
      if (!badge.unlocked && badge.category === 'hero_tier') {
        const tier = HERO_TIERS.find(t => t.id === badge.id);
        if (tier && newPetsHelped >= tier.minPetsHelped) {
          return { ...badge, unlocked: true, unlockedAt: now.toISOString() };
        }
      }
      return badge;
    });
    
    // Get newly unlocked badges for notifications
    const newlyUnlockedBadges = updatedBadges.filter(badge => 
      badge.unlocked && 
      badge.unlockedAt && 
      new Date(badge.unlockedAt).getTime() > now.getTime() - 1000
    );
    
    // Update daily challenges
    const updatedDailyChallenges = dailyChallenges.map(challenge => {
      if (!challenge.completed && challenge.type === 'help') {
        const newProgress = challenge.progress + 1;
        return {
          ...challenge,
          progress: newProgress,
          completed: newProgress >= challenge.requirement
        };
      }
      return challenge;
    });
    
    setUserStats(newStats);
    setBadges(updatedBadges);
    setDailyChallenges(updatedDailyChallenges);
    
    await saveUserStats(newStats, updatedBadges, updatedDailyChallenges, weeklyChallenge, neighborhoodLeaderboard);
    
    // Return tier upgrade if happened
    if (currentTier.id !== newTier.id) {
      return { 
        tierUpgrade: newTier, 
        newBadges: newlyUnlockedBadges,
        pointsAwarded: totalXP,
        isEmergencyResponse
      };
    }
    
    return { 
      newBadges: newlyUnlockedBadges,
      pointsAwarded: totalXP,
      isEmergencyResponse
    };
  }, [user, userStats, badges, dailyChallenges, weeklyChallenge, neighborhoodLeaderboard, saveUserStats, getCurrentTier]);

  // Complete daily challenge
  const completeDailyChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;
    
    const challenge = dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;
    
    const updatedChallenges = dailyChallenges.map(c => 
      c.id === challengeId ? { ...c, completed: true, progress: c.requirement } : c
    );
    
    const newStats = {
      ...userStats,
      xpPoints: userStats.xpPoints + challenge.xpReward,
      dailyChallengesCompleted: userStats.dailyChallengesCompleted + 1
    };
    
    setDailyChallenges(updatedChallenges);
    setUserStats(newStats);
    
    await saveUserStats(newStats, badges, updatedChallenges, weeklyChallenge, neighborhoodLeaderboard);
    
    return challenge;
  }, [user, userStats, badges, dailyChallenges, weeklyChallenge, neighborhoodLeaderboard, saveUserStats]);

  // Reset daily challenges
  const resetDailyChallenges = useCallback(async () => {
    const newChallenges = DAILY_CHALLENGES.map(challenge => ({
      ...challenge,
      progress: 0,
      completed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
    
    setDailyChallenges(newChallenges);
    await saveUserStats(userStats, badges, newChallenges, weeklyChallenge, neighborhoodLeaderboard);
  }, [userStats, badges, weeklyChallenge, neighborhoodLeaderboard, saveUserStats]);

  // Reset weekly challenge
  const resetWeeklyChallenge = useCallback(async () => {
    const newChallenge: WeeklyChallenge = {
      id: 'weekly_neighborhood',
      title: 'Haftalık Mahalle Hedefi',
      description: `${userStats.neighborhood} mahallesinde bu hafta 10 kayıp bildir`,
      requirement: 10,
      reward: '200 XP + mahalle lideri rozetleri',
      progress: 0,
      completed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const newStats = {
      ...userStats,
      weeklyReports: 0
    };
    
    setWeeklyChallenge(newChallenge);
    setUserStats(newStats);
    await saveUserStats(newStats, badges, dailyChallenges, newChallenge, neighborhoodLeaderboard);
  }, [userStats, badges, dailyChallenges, neighborhoodLeaderboard, saveUserStats]);

  // Get user level info
  const getLevelInfo = useCallback(() => {
    const currentLevel = userStats.level;
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    const progressToNextLevel = userStats.totalPoints - pointsForCurrentLevel;
    const pointsNeededForNext = pointsForNextLevel - userStats.totalPoints;
    
    return {
      currentLevel,
      progressToNextLevel,
      pointsNeededForNext,
      progressPercentage: (progressToNextLevel / 100) * 100
    };
  }, [userStats]);

  // Get neighborhood leaderboard
  const getNeighborhoodLeaderboard = useCallback(() => {
    const mockUsers = [
      { id: '1', name: 'Ayşe Demir', points: 2847, petsHelped: 23, tier: 'toplum_kahramani', avatar: '👩' },
      { id: '2', name: 'Mehmet Kaya', points: 2156, petsHelped: 18, tier: 'hayvan_dostu', avatar: '👨' },
      { id: '3', name: 'Zeynep Özkan', points: 1923, petsHelped: 16, tier: 'hayvan_dostu', avatar: '👩‍🦱' },
      { id: user?.id || '4', name: 'Sen', points: userStats.xpPoints, petsHelped: userStats.petsHelped, tier: userStats.currentTier, avatar: '🙋‍♂️' },
    ];
    
    return {
      ...neighborhoodLeaderboard,
      users: mockUsers.sort((a, b) => b.points - a.points)
    };
  }, [user, userStats, neighborhoodLeaderboard]);

  // Get global leaderboard
  const getGlobalLeaderboard = useCallback(() => {
    return [
      { id: '1', name: 'Ayşe Demir', points: 2847, level: 15, tier: 'toplum_kahramani', neighborhood: 'Kadıköy', avatar: '👩' },
      { id: '2', name: 'Mehmet Kaya', points: 2156, level: 12, tier: 'hayvan_dostu', neighborhood: 'Beşiktaş', avatar: '👨' },
      { id: '3', name: 'Zeynep Özkan', points: 1923, level: 11, tier: 'hayvan_dostu', neighborhood: 'Üsküdar', avatar: '👩‍🦱' },
      { id: user?.id || '4', name: 'Sen', points: userStats.xpPoints, level: userStats.level, tier: userStats.currentTier, neighborhood: userStats.neighborhood, avatar: '🙋‍♂️' },
    ].sort((a, b) => b.points - a.points);
  }, [user, userStats]);

  return useMemo(() => ({
    userStats,
    badges,
    dailyChallenges,
    weeklyChallenge,
    heroTiers: HERO_TIERS,
    currentTier: getCurrentTier(userStats.petsHelped),
    addReport,
    addSuccessfulFind,
    completeDailyChallenge,
    resetDailyChallenges,
    resetWeeklyChallenge,
    getLevelInfo,
    getNeighborhoodLeaderboard,
    getGlobalLeaderboard,
    isLoading: false
  }), [
    userStats,
    badges,
    dailyChallenges,
    weeklyChallenge,
    getCurrentTier,
    addReport,
    addSuccessfulFind,
    completeDailyChallenge,
    resetDailyChallenges,
    resetWeeklyChallenge,
    getLevelInfo,
    getNeighborhoodLeaderboard,
    getGlobalLeaderboard
  ]);
});