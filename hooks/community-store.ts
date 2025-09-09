import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location: {
    lat: number;
    lng: number;
    radius: number; // in meters
  };
  moderatorId: string;
  whatsappLink?: string;
  telegramLink?: string;
  isJoined: boolean;
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  petPhoto: string;
  beforePhoto?: string;
  afterPhoto?: string;
  ownerName: string;
  finderName: string;
  story: string;
  testimonial?: string;
  foundDate: string;
  location: string;
  likes: number;
  shares: number;
  isLiked: boolean;
  isFeatured: boolean;
  reunionDuration: number; // in hours
  rewardAmount?: number;
  tags: string[];
  createdAt: string;
}

export interface HeroOfTheMonth {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  month: string;
  year: number;
  petsHelped: number;
  totalReward: number;
  achievements: string[];
  testimonials: {
    from: string;
    message: string;
    petName: string;
  }[];
  isCurrentMonth: boolean;
}

export interface PetOfTheWeek {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  petPhoto: string;
  ownerName: string;
  votes: number;
  description: string;
  hasVoted: boolean;
  weekStart: string;
  weekEnd: string;
}

export interface CommunityStats {
  totalGroups: number;
  totalMembers: number;
  successStoriesThisWeek: number;
  successStoriesThisMonth: number;
  totalSuccessStories: number;
  activeSearches: number;
  averageResponseTime: number; // in minutes
  averageReunionTime: number; // in hours
  totalRewardsDistributed: number;
  fastestReunion: number; // in minutes
}

export const [CommunityProvider, useCommunity] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [heroOfTheMonth, setHeroOfTheMonth] = useState<HeroOfTheMonth | null>(null);
  const [petOfTheWeek, setPetOfTheWeek] = useState<PetOfTheWeek | null>(null);
  const [stats, setStats] = useState<CommunityStats>({
    totalGroups: 0,
    totalMembers: 0,
    successStoriesThisWeek: 0,
    successStoriesThisMonth: 0,
    totalSuccessStories: 0,
    activeSearches: 0,
    averageResponseTime: 0,
    averageReunionTime: 0,
    totalRewardsDistributed: 0,
    fastestReunion: 0
  });

  // Initialize with mock data
  const initializeMockData = useCallback(() => {
    const mockGroups: CommunityGroup[] = [
      {
        id: 'group-1',
        name: 'Kadıköy Kayıp Hayvanlar',
        description: 'Kadıköy ve çevresindeki kayıp hayvanlar için yardımlaşma grubu',
        memberCount: 247,
        location: { lat: 40.9900, lng: 29.0300, radius: 5000 },
        moderatorId: 'mod-1',
        whatsappLink: 'https://chat.whatsapp.com/example1',
        isJoined: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'group-2',
        name: 'Beşiktaş Pet Guardians',
        description: 'Beşiktaş bölgesi evcil hayvan sahipleri topluluğu',
        memberCount: 189,
        location: { lat: 41.0400, lng: 29.0000, radius: 3000 },
        moderatorId: 'mod-2',
        telegramLink: 'https://t.me/example2',
        isJoined: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const mockSuccessStories: SuccessStory[] = [
      {
        id: 'story-1',
        petId: 'pet-1',
        petName: 'Luna',
        petType: 'Kedi',
        petPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        beforePhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&sat=-100',
        afterPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        ownerName: 'Ayşe K.',
        finderName: 'Mehmet S.',
        story: '3 gün kayıp olan Luna\'yı Mehmet bey parkta buldu. Çok teşekkürler! 🙏',
        testimonial: 'Luna\'yı kaybettiğimde çok panikledim ama bu platform sayesinde sadece 3 günde buldum. Mehmet bey çok yardımcı oldu, gerçek bir kahraman!',
        foundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Kadıköy Moda Parkı',
        likes: 47,
        shares: 12,
        isLiked: false,
        isFeatured: true,
        reunionDuration: 72,
        rewardAmount: 500,
        tags: ['hızlı-buluş', 'park', 'gönüllü-yardımı'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'story-2',
        petId: 'pet-2',
        petName: 'Max',
        petType: 'Köpek',
        petPhoto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
        beforePhoto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&sat=-100',
        afterPhoto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
        ownerName: 'Can Y.',
        finderName: 'Zeynep A.',
        story: 'Max\'i bulan Zeynep hanıma çok teşekkürler. Ailece çok mutluyuz! ❤️',
        testimonial: 'Max bizim ailemizin bir parçası. Onu kaybetmek çok zordu ama bu harika topluluk sayesinde eve döndü. Zeynep hanım gerçek bir melek!',
        foundDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Üsküdar Çamlıca',
        likes: 89,
        shares: 23,
        isLiked: true,
        isFeatured: false,
        reunionDuration: 120,
        rewardAmount: 1000,
        tags: ['köpek', 'aile-peti', 'mutlu-son'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'story-3',
        petId: 'pet-3',
        petName: 'Pamuk',
        petType: 'Kedi',
        petPhoto: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400',
        beforePhoto: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&sat=-100',
        afterPhoto: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400',
        ownerName: 'Elif M.',
        finderName: 'Ahmet T.',
        story: 'Pamuk\'u sadece 4 saatte bulduk! İnanılmaz hızlı bir operasyondu.',
        testimonial: 'Bu platform gerçekten işe yarıyor. Pamuk\'u kaybettiğimde hemen bildirdim ve 4 saat sonra evdeydi!',
        foundDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Beşiktaş Barbaros',
        likes: 156,
        shares: 45,
        isLiked: false,
        isFeatured: true,
        reunionDuration: 4,
        rewardAmount: 300,
        tags: ['hızlı-buluş', 'rekord', 'beşiktaş'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const mockHeroOfTheMonth: HeroOfTheMonth = {
      id: 'hero-1',
      userId: 'user-hero-1',
      userName: 'Mehmet Özkan',
      userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      month: 'Aralık',
      year: 2024,
      petsHelped: 12,
      totalReward: 4500,
      achievements: ['Hızlı Müdahale', 'Toplum Kahramanı', 'Güvenilir Gönüllü'],
      testimonials: [
        {
          from: 'Ayşe K.',
          message: 'Luna\'yı bulduğu için çok teşekkürler. Gerçek bir kahraman!',
          petName: 'Luna'
        },
        {
          from: 'Can Y.',
          message: 'Max\'i bulmamda çok yardımcı oldu. Harika bir insan!',
          petName: 'Max'
        }
      ],
      isCurrentMonth: true
    };

    const mockPetOfTheWeek: PetOfTheWeek = {
      id: 'potw-1',
      petId: 'pet-3',
      petName: 'Pamuk',
      petType: 'Kedi',
      petPhoto: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400',
      ownerName: 'Elif M.',
      votes: 156,
      description: 'Çok sevimli ve oyuncu bir kedi. Herkesi çok seviyor!',
      hasVoted: false,
      weekStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      weekEnd: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
    };

    const mockStats: CommunityStats = {
      totalGroups: 24,
      totalMembers: 3847,
      successStoriesThisWeek: 12,
      successStoriesThisMonth: 47,
      totalSuccessStories: 234,
      activeSearches: 18,
      averageResponseTime: 23,
      averageReunionTime: 8.5,
      totalRewardsDistributed: 45600,
      fastestReunion: 12
    };

    setGroups(mockGroups);
    setSuccessStories(mockSuccessStories);
    setHeroOfTheMonth(mockHeroOfTheMonth);
    setPetOfTheWeek(mockPetOfTheWeek);
    setStats(mockStats);
  }, []);

  // Load community data from AsyncStorage
  const loadCommunityData = useCallback(async () => {
    if (!user) return;
    
    try {
      const stored = await AsyncStorage.getItem(`community_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setGroups(data.groups || []);
        setSuccessStories(data.successStories || []);
        setHeroOfTheMonth(data.heroOfTheMonth || null);
        setPetOfTheWeek(data.petOfTheWeek || null);
        setStats(prevStats => ({ ...prevStats, ...data.stats }));
      } else {
        // Initialize with mock data
        initializeMockData();
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      initializeMockData();
    }
  }, [user, initializeMockData]);

  // Save community data to AsyncStorage
  const saveCommunityData = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = {
        groups,
        successStories,
        heroOfTheMonth,
        petOfTheWeek,
        stats
      };
      await AsyncStorage.setItem(`community_${user.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving community data:', error);
    }
  }, [user, groups, successStories, heroOfTheMonth, petOfTheWeek, stats]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadCommunityData();
    }
  }, [isAuthenticated, loadCommunityData]);

  // Save data when it changes
  useEffect(() => {
    if (isAuthenticated && groups.length > 0) {
      saveCommunityData();
    }
  }, [isAuthenticated, groups, successStories, heroOfTheMonth, petOfTheWeek, stats, saveCommunityData]);

  // Join a community group
  const joinGroup = useCallback(async (groupId: string) => {
    const updatedGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
        : group
    );
    
    setGroups(updatedGroups);
    return true;
  }, [groups]);

  // Leave a community group
  const leaveGroup = useCallback(async (groupId: string) => {
    const updatedGroups = groups.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: false, memberCount: Math.max(0, group.memberCount - 1) }
        : group
    );
    
    setGroups(updatedGroups);
    return true;
  }, [groups]);

  // Create a new community group
  const createGroup = useCallback(async (groupData: Omit<CommunityGroup, 'id' | 'memberCount' | 'moderatorId' | 'isJoined' | 'createdAt'>) => {
    if (!user) return null;
    
    const newGroup: CommunityGroup = {
      id: `group-${Date.now()}`,
      ...groupData,
      memberCount: 1,
      moderatorId: user.id,
      isJoined: true,
      createdAt: new Date().toISOString()
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, [user]);

  // Like a success story
  const likeSuccessStory = useCallback(async (storyId: string) => {
    const updatedStories = successStories.map(story => 
      story.id === storyId 
        ? { 
            ...story, 
            isLiked: !story.isLiked,
            likes: story.isLiked ? story.likes - 1 : story.likes + 1
          }
        : story
    );
    
    setSuccessStories(updatedStories);
    return true;
  }, [successStories]);

  // Share a success story
  const shareSuccessStory = useCallback(async (storyId: string) => {
    const story = successStories.find(s => s.id === storyId);
    if (!story) return false;
    
    // Increment share count
    const updatedStories = successStories.map(s => 
      s.id === storyId 
        ? { ...s, shares: s.shares + 1 }
        : s
    );
    
    setSuccessStories(updatedStories);
    
    // In a real app, this would trigger the share dialog
    console.log(`Sharing success story: ${story.petName} found!`);
    return true;
  }, [successStories]);

  // Vote for pet of the week
  const voteForPetOfTheWeek = useCallback(async () => {
    if (!petOfTheWeek || petOfTheWeek.hasVoted) return false;
    
    const updatedPetOfTheWeek = {
      ...petOfTheWeek,
      votes: petOfTheWeek.votes + 1,
      hasVoted: true
    };
    
    setPetOfTheWeek(updatedPetOfTheWeek);
    return true;
  }, [petOfTheWeek]);

  // Add a success story
  const addSuccessStory = useCallback(async (storyData: Omit<SuccessStory, 'id' | 'likes' | 'shares' | 'isLiked' | 'createdAt'>) => {
    const newStory: SuccessStory = {
      id: `story-${Date.now()}`,
      ...storyData,
      likes: 0,
      shares: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    };
    
    setSuccessStories(prev => [newStory, ...prev]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      successStoriesThisWeek: prev.successStoriesThisWeek + 1,
      successStoriesThisMonth: prev.successStoriesThisMonth + 1,
      totalSuccessStories: prev.totalSuccessStories + 1,
      totalRewardsDistributed: prev.totalRewardsDistributed + (storyData.rewardAmount || 0)
    }));
    
    return newStory;
  }, []);

  // Get nearby groups based on user location
  const getNearbyGroups = useCallback((userLocation: { lat: number; lng: number }, radiusKm: number = 10) => {
    return groups.filter(group => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        group.location.lat, 
        group.location.lng
      );
      return distance <= radiusKm;
    });
  }, [groups]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get featured success stories
  const getFeaturedStories = useCallback(() => {
    return successStories.filter(story => story.isFeatured).slice(0, 5);
  }, [successStories]);

  // Get recent success stories
  const getRecentStories = useCallback((limit: number = 10) => {
    return successStories
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [successStories]);

  // Get fastest reunions
  const getFastestReunions = useCallback((limit: number = 5) => {
    return successStories
      .sort((a, b) => a.reunionDuration - b.reunionDuration)
      .slice(0, limit);
  }, [successStories]);

  return useMemo(() => ({
    groups,
    successStories,
    heroOfTheMonth,
    petOfTheWeek,
    stats,
    joinGroup,
    leaveGroup,
    createGroup,
    likeSuccessStory,
    shareSuccessStory,
    voteForPetOfTheWeek,
    addSuccessStory,
    getNearbyGroups,
    getFeaturedStories,
    getRecentStories,
    getFastestReunions,
    isLoading: false
  }), [
    groups,
    successStories,
    heroOfTheMonth,
    petOfTheWeek,
    stats,
    joinGroup,
    leaveGroup,
    createGroup,
    likeSuccessStory,
    shareSuccessStory,
    voteForPetOfTheWeek,
    addSuccessStory,
    getNearbyGroups,
    getFeaturedStories,
    getRecentStories,
    getFastestReunions
  ]);
});