import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/hooks/auth-store";
import { usePets } from "@/hooks/pet-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  energyLevel: number; // 1-10
  playStyle: 'gentle' | 'rough' | 'fetch' | 'social';
  temperament: string[];
  photos: string[];
  owner_id: string;
}

export interface Playdate {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  date: string;
  time: string;
  maxParticipants: number;
  currentParticipants: string[];
  inviteOnly: boolean;
  creator_id: string;
  requirements?: string[];
  created_at: string;
}

export interface FeedingPoint {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  time: string;
  volunteers: string[];
  description: string;
  supplies_needed: string[];
  created_at: string;
}

export interface DogMatch {
  id: string;
  dog: Dog;
  score: number;
  commonTraits: string[];
  recommendation: string;
}

// Breed compatibility matrix
const COMPATIBLE_BREEDS: Record<string, string[]> = {
  'Golden Retriever': ['Labrador', 'Border Collie', 'Australian Shepherd', 'Beagle'],
  'Labrador': ['Golden Retriever', 'Beagle', 'Cocker Spaniel', 'Poodle'],
  'German Shepherd': ['Belgian Malinois', 'Dutch Shepherd', 'Rottweiler'],
  'Husky': ['Alaskan Malamute', 'Samoyed', 'German Shepherd'],
  'Poodle': ['Labrador', 'Golden Retriever', 'Cocker Spaniel'],
  'Beagle': ['Labrador', 'Golden Retriever', 'Cocker Spaniel'],
  'Bulldog': ['Pug', 'Boston Terrier', 'French Bulldog'],
  'Chihuahua': ['Pomeranian', 'Yorkshire Terrier', 'Maltese'],
};

export const [EventsProvider, useEvents] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const { pets } = usePets();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch playdates
  const playdatesQuery = useQuery({
    queryKey: ['playdates'],
    queryFn: async () => {
      console.log('Backend not enabled, returning mock playdates data');
      return [
        {
          id: 'playdate-1',
          title: 'Köpek Parkı Buluşması',
          description: 'Büyük köpekler için sosyalleşme etkinliği',
          location: {
            lat: 41.0082,
            lng: 28.9784,
            address: 'Maçka Parkı, Beşiktaş'
          },
          date: new Date().toISOString().split('T')[0],
          time: '15:00',
          maxParticipants: 8,
          currentParticipants: ['user1', 'user2', 'user3'],
          inviteOnly: true,
          creator_id: 'creator1',
          requirements: ['Aşıları tam', 'Sosyal köpek'],
          created_at: new Date().toISOString()
        },
        {
          id: 'playdate-2',
          title: 'Küçük Köpek Buluşması',
          description: 'Küçük ırk köpekler için güvenli oyun alanı',
          location: {
            lat: 41.0100,
            lng: 28.9800,
            address: 'Gülhane Parkı, Eminönü'
          },
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '10:00',
          maxParticipants: 6,
          currentParticipants: ['user4', 'user5'],
          inviteOnly: false,
          creator_id: 'creator2',
          requirements: ['10kg altı köpekler'],
          created_at: new Date().toISOString()
        }
      ] as Playdate[];
    },
    enabled: isAuthenticated,
  });

  // Fetch feeding points
  const feedingPointsQuery = useQuery({
    queryKey: ['feeding-points', selectedDate],
    queryFn: async () => {
      console.log('Backend not enabled, returning mock feeding points data');
      return [
        {
          id: 'feeding-1',
          location: {
            lat: 41.0050,
            lng: 28.9750,
            address: 'Taksim Meydanı yakını'
          },
          time: '08:00',
          volunteers: ['volunteer1', 'volunteer2'],
          description: 'Sabah besleme - sokak kedileri',
          supplies_needed: ['Kedi maması', 'Su kabı'],
          created_at: new Date().toISOString()
        },
        {
          id: 'feeding-2',
          location: {
            lat: 41.0120,
            lng: 28.9820,
            address: 'Kadıköy İskele'
          },
          time: '18:00',
          volunteers: ['volunteer3'],
          description: 'Akşam besleme - sokak köpekleri',
          supplies_needed: ['Köpek maması', 'Battaniye'],
          created_at: new Date().toISOString()
        }
      ] as FeedingPoint[];
    },
    enabled: isAuthenticated,
  });

  // Calculate dog compatibility
  const calculateCompatibility = useCallback((dog1: Dog, dog2: Dog) => {
    let score = 0;
    const commonTraits: string[] = [];
    
    // Breed compatibility matrix
    if (COMPATIBLE_BREEDS[dog1.breed]?.includes(dog2.breed)) {
      score += 30;
      commonTraits.push('Uyumlu ırklar');
    }
    
    // Energy level match
    const energyDiff = Math.abs(dog1.energyLevel - dog2.energyLevel);
    if (energyDiff <= 2) {
      score += 25;
      commonTraits.push('Benzer enerji seviyesi');
    }
    
    // Size compatibility
    const sizeDiff = Math.abs(dog1.weight - dog2.weight);
    if (sizeDiff < 10) {
      score += 20;
      commonTraits.push('Benzer boyut');
    } else if (sizeDiff < 20) {
      score += 10;
    }
    
    // Play style
    if (dog1.playStyle === dog2.playStyle) {
      score += 25;
      commonTraits.push('Aynı oyun tarzı');
    }
    
    // Temperament overlap
    const sharedTemperament = dog1.temperament.filter(trait => 
      dog2.temperament.includes(trait)
    );
    if (sharedTemperament.length > 0) {
      score += sharedTemperament.length * 5;
      commonTraits.push(...sharedTemperament);
    }
    
    const recommendation = score > 70 ? 'Harika Eşleşme!' : 
                          score > 50 ? 'İyi Uyum' : 
                          'Dikkatli Tanıştırın';
    
    return {
      score,
      recommendation,
      commonTraits
    };
  }, []);

  // Get dog matches for user's pets
  const dogMatchesQuery = useQuery({
    queryKey: ['dog-matches', user?.id],
    queryFn: async () => {
      if (!pets.length) return [];
      
      console.log('Backend not enabled, returning mock dog matches data');
      const mockDogs: Dog[] = [
        {
          id: 'dog-1',
          name: 'Bella',
          breed: 'Labrador',
          age: 3,
          weight: 25,
          energyLevel: 8,
          playStyle: 'fetch',
          temperament: ['friendly', 'energetic', 'social'],
          photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'],
          owner_id: 'owner1'
        },
        {
          id: 'dog-2',
          name: 'Charlie',
          breed: 'Golden Retriever',
          age: 2,
          weight: 30,
          energyLevel: 7,
          playStyle: 'social',
          temperament: ['gentle', 'friendly', 'calm'],
          photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
          owner_id: 'owner2'
        },
        {
          id: 'dog-3',
          name: 'Rocky',
          breed: 'German Shepherd',
          age: 4,
          weight: 35,
          energyLevel: 9,
          playStyle: 'rough',
          temperament: ['protective', 'intelligent', 'loyal'],
          photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400'],
          owner_id: 'owner3'
        }
      ];
      
      // Calculate matches for user's first pet (mock)
      const userDog: Dog = {
        id: 'user-dog',
        name: pets[0]?.name || 'Buddy',
        breed: pets[0]?.breed || 'Golden Retriever',
        age: 3,
        weight: 28,
        energyLevel: 7,
        playStyle: 'social',
        temperament: ['friendly', 'gentle', 'social'],
        photos: pets[0]?.photos || [],
        owner_id: user?.id || 'user'
      };
      
      const matches: DogMatch[] = mockDogs.map(dog => {
        const compatibility = calculateCompatibility(userDog, dog);
        return {
          id: `match-${dog.id}`,
          dog,
          score: compatibility.score,
          commonTraits: compatibility.commonTraits,
          recommendation: compatibility.recommendation
        };
      }).sort((a, b) => b.score - a.score);
      
      return matches;
    },
    enabled: isAuthenticated && pets.length > 0,
  });

  // Create playdate mutation
  const createPlaydateMutation = useMutation({
    mutationFn: async (playdateData: Omit<Playdate, 'id' | 'creator_id' | 'created_at' | 'currentParticipants'>) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Backend not enabled, simulating playdate creation');
      const mockPlaydate: Playdate = {
        id: 'playdate-' + Date.now(),
        creator_id: user.id,
        currentParticipants: [user.id],
        ...playdateData,
        created_at: new Date().toISOString()
      };
      
      return mockPlaydate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playdates'] });
    },
  });

  // Join playdate mutation
  const joinPlaydateMutation = useMutation({
    mutationFn: async (playdateId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Backend not enabled, simulating playdate join');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playdates'] });
    },
  });

  // Join feeding mutation
  const joinFeedingMutation = useMutation({
    mutationFn: async (feedingId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Backend not enabled, simulating feeding join');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding-points'] });
    },
  });

  // Invite to playdate mutation
  const inviteToPlaydateMutation = useMutation({
    mutationFn: async ({ playdateId, dogId }: { playdateId: string; dogId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Backend not enabled, simulating playdate invitation');
      return { success: true };
    },
  });

  const createPlaydate = useCallback(async (playdateData: Omit<Playdate, 'id' | 'creator_id' | 'created_at' | 'currentParticipants'>) => {
    return createPlaydateMutation.mutateAsync(playdateData);
  }, [createPlaydateMutation.mutateAsync]);

  const joinPlaydate = useCallback(async (playdateId: string) => {
    return joinPlaydateMutation.mutateAsync(playdateId);
  }, [joinPlaydateMutation.mutateAsync]);

  const joinFeeding = useCallback(async (feedingId: string) => {
    return joinFeedingMutation.mutateAsync(feedingId);
  }, [joinFeedingMutation.mutateAsync]);

  const inviteToPlaydate = useCallback(async (playdateId: string, dogId: string) => {
    return inviteToPlaydateMutation.mutateAsync({ playdateId, dogId });
  }, [inviteToPlaydateMutation.mutateAsync]);

  return useMemo(() => ({
    playdates: playdatesQuery.data || [],
    feedingPoints: feedingPointsQuery.data || [],
    dogMatches: dogMatchesQuery.data || [],
    selectedDate,
    setSelectedDate,
    isLoading: playdatesQuery.isLoading || feedingPointsQuery.isLoading || dogMatchesQuery.isLoading,
    isError: playdatesQuery.isError || feedingPointsQuery.isError || dogMatchesQuery.isError,
    createPlaydate,
    joinPlaydate,
    joinFeeding,
    inviteToPlaydate,
    calculateCompatibility,
    isCreatingPlaydate: createPlaydateMutation.isPending,
    isJoiningPlaydate: joinPlaydateMutation.isPending,
    isJoiningFeeding: joinFeedingMutation.isPending,
    isInviting: inviteToPlaydateMutation.isPending,
  }), [
    playdatesQuery.data,
    feedingPointsQuery.data,
    dogMatchesQuery.data,
    selectedDate,
    playdatesQuery.isLoading,
    feedingPointsQuery.isLoading,
    dogMatchesQuery.isLoading,
    playdatesQuery.isError,
    feedingPointsQuery.isError,
    dogMatchesQuery.isError,
    createPlaydate,
    joinPlaydate,
    joinFeeding,
    inviteToPlaydate,
    calculateCompatibility,
    createPlaydateMutation.isPending,
    joinPlaydateMutation.isPending,
    joinFeedingMutation.isPending,
    inviteToPlaydateMutation.isPending,
  ]);
});