// Mock Data Service - No Supabase dependency
export const mockPets = [
  {
    id: '1',
    name: 'Miminko',
    type: 'cat',
    breed: 'Scottish Fold',
    owner_id: 'user1',
    age: 2,
    color: 'Gri-Beyaz',
    description: 'Çok sevimli ve oyuncu bir kedi. Mavi tasma takıyor.',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300'],
    last_location: {
      lat: 41.0082,
      lng: 28.9784
    },
    reward_amount: 500,
    is_found: false,
    created_at: '2024-12-10T10:00:00Z',
    status: 'missing',
    microchipped: true,
    vaccinated: true,
    special_needs: null
  },
  {
    id: '2', 
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    owner_id: 'user2',
    age: 4,
    color: 'Altın Sarısı',
    description: 'Büyük ve dostane köpek. Kırmızı tasma var.',
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=300'],
    last_location: {
      lat: 41.0085,
      lng: 28.9790
    },
    reward_amount: 1000,
    is_found: false,
    created_at: '2024-12-09T15:30:00Z',
    status: 'missing',
    microchipped: true,
    vaccinated: true,
    special_needs: null
  },
  {
    id: '3',
    name: 'Luna',
    type: 'cat',
    breed: 'Persian',
    owner_id: 'user3',
    age: 3,
    color: 'Beyaz',
    description: 'Uzun tüylü beyaz kedi. Mavi gözlü.',
    photos: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300'],
    last_location: {
      lat: 41.0070,
      lng: 28.9780
    },
    reward_amount: 750,
    is_found: false,
    created_at: '2024-12-08T09:15:00Z',
    status: 'missing',
    microchipped: false,
    vaccinated: true,
    special_needs: 'Özel mama gerekir'
  },
  {
    id: '4',
    name: 'Charlie',
    type: 'dog',
    breed: 'Labrador',
    owner_id: 'user4',
    age: 5,
    color: 'Siyah',
    description: 'Enerjik ve arkadaş canlısı köpek.',
    photos: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300'],
    last_location: {
      lat: 41.0095,
      lng: 28.9800
    },
    reward_amount: 800,
    is_found: false,
    created_at: '2024-12-07T14:20:00Z',
    status: 'missing',
    microchipped: true,
    vaccinated: true,
    special_needs: null
  },
  {
    id: '5',
    name: 'Pamuk',
    type: 'cat',
    breed: 'Van Kedisi',
    owner_id: 'user5',
    age: 1,
    color: 'Beyaz-Turuncu',
    description: 'Çok genç ve çekingen kedi.',
    photos: ['https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=300'],
    last_location: {
      lat: 41.0060,
      lng: 28.9770
    },
    reward_amount: 400,
    is_found: true,
    created_at: '2024-12-06T11:45:00Z',
    status: 'found',
    microchipped: false,
    vaccinated: true,
    special_needs: null
  }
];

export const mockUsers = [
  {
    id: 'user1',
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    phone: '+90 532 123 4567',
    location_privacy_level: 'moderate' as const,
    show_exact_to_finders: true,
    custom_fuzzing_radius: 100,
    created_at: '2024-11-01T10:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    neighborhood: 'Kadıköy'
  },
  {
    id: 'user2',
    name: 'Mehmet Kara',
    email: 'mehmet@example.com', 
    phone: '+90 533 234 5678',
    location_privacy_level: 'open' as const,
    show_exact_to_finders: true,
    custom_fuzzing_radius: 50,
    created_at: '2024-10-15T14:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    neighborhood: 'Beşiktaş'
  }
];

export const mockSightings = [
  {
    id: '1',
    pet_id: '1',
    reporter_id: 'user2',
    location: {
      lat: 41.0083,
      lng: 28.9785
    },
    notes: 'Parkta oynarken gördüm, çok canlı görünüyordu',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
    created_at: '2024-12-10T16:45:00Z'
  },
  {
    id: '2',
    pet_id: '2',
    reporter_id: 'user1',
    location: {
      lat: 41.0087,
      lng: 28.9792
    },
    notes: 'Sahil kenarında dolaşıyordu',
    photo: null,
    created_at: '2024-12-09T18:20:00Z'
  }
];

export const mockRewardClaims = [
  {
    id: '1',
    pet_id: '5',
    claimer_id: 'user2',
    owner_id: 'user5',
    amount: 400,
    status: 'approved' as const,
    evidence_photo: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=200',
    evidence_notes: 'Parka yakın buldum, sahibine teslim ettim',
    created_at: '2024-12-06T20:00:00Z',
    updated_at: '2024-12-06T20:30:00Z'
  }
];

export const mockMessages = [
  {
    id: '1',
    sender_id: 'user1',
    receiver_id: 'user2',
    message: 'Merhaba! Köpeğinizi gördüğümü düşünüyorum.',
    created_at: '2024-12-10T10:30:00Z',
    read: false
  },
  {
    id: '2',
    sender_id: 'user2', 
    receiver_id: 'user1',
    message: 'Gerçekten mi? Nerede gördünüz?',
    created_at: '2024-12-10T10:35:00Z',
    read: true
  },
  {
    id: '3',
    sender_id: 'user1',
    receiver_id: 'user2', 
    message: 'Kadıköy Parkında, sahilde oynuyordu.',
    created_at: '2024-12-10T10:40:00Z',
    read: false
  }
];

// Gamification data
export const mockBadges = [
  {
    id: 'first_finder',
    name: 'İlk Bulucu',
    description: 'İlk hayvan bulma başarısı',
    icon: '🏆',
    requirement: 1,
    unlocked: true,
    category: 'finder'
  },
  {
    id: 'helper_hero',
    name: 'Yardım Kahramanı', 
    description: '5 hayvana yardım et',
    icon: '⭐',
    requirement: 5,
    unlocked: true,
    category: 'helper'
  },
  {
    id: 'community_leader',
    name: 'Topluluk Lideri',
    description: '10 kişiyi davet et',
    icon: '👑',
    requirement: 10,
    unlocked: false,
    category: 'social'
  },
  {
    id: 'lifesaver',
    name: 'Can Kurtaran',
    description: '20 hayvanı kurtar',
    icon: '💎',
    requirement: 20,
    unlocked: false,
    category: 'rescuer'
  }
];

export const mockHeroTiers = [
  {
    id: 'rookie',
    name: 'Çaylak',
    icon: '🥉',
    color: '#CD7F32',
    minPoints: 0,
    maxPoints: 99
  },
  {
    id: 'helper',
    name: 'Yardımcı',
    icon: '🥈', 
    color: '#C0C0C0',
    minPoints: 100,
    maxPoints: 499
  },
  {
    id: 'hero',
    name: 'Kahraman',
    icon: '🥇',
    color: '#FFD700',
    minPoints: 500,
    maxPoints: 1999
  },
  {
    id: 'legend',
    name: 'Efsane',
    icon: '💎',
    color: '#B83DBA',
    minPoints: 2000,
    maxPoints: 999999
  }
];

export const mockLeaderboard = [
  {
    id: 'user1',
    name: 'Ayşe Yılmaz',
    points: 2450,
    level: 12,
    tier: 'legend',
    petsFound: 24,
    neighborhood: 'Kadıköy'
  },
  {
    id: 'user2',
    name: 'Mehmet Kara', 
    points: 1890,
    level: 9,
    tier: 'hero',
    petsFound: 18,
    neighborhood: 'Beşiktaş'
  },
  {
    id: 'user3',
    name: 'Fatma Demir',
    points: 1234,
    level: 7,
    tier: 'hero',
    petsFound: 12,
    neighborhood: 'Üsküdar'
  },
  {
    id: 'user4',
    name: 'Ali Özkan',
    points: 876,
    level: 5,
    tier: 'hero', 
    petsFound: 8,
    neighborhood: 'Şişli'
  },
  {
    id: 'user5',
    name: 'Zeynep Aslan',
    points: 543,
    level: 4,
    tier: 'helper',
    petsFound: 5,
    neighborhood: 'Bakırköy'
  }
];

// Health records
export const mockHealthRecords = [
  {
    id: '1',
    petId: '1',
    type: 'vaccination' as const,
    title: 'Karma Aşı',
    description: 'Yıllık karma aşı uygulandı',
    date: '2024-11-15',
    nextDue: '2025-11-15',
    veterinarian: 'Dr. Ahmet Yıldız',
    notes: 'Hiç problem yaşamadı'
  },
  {
    id: '2',
    petId: '1', 
    type: 'medication' as const,
    title: 'Pire İlacı',
    description: 'Aylık pire koruma ilacı',
    date: '2024-12-01',
    nextDue: '2025-01-01',
    veterinarian: 'Dr. Ahmet Yıldız',
    notes: 'Düzenli kullanım gerekli'
  }
];

// Appointments
export const mockAppointments = [
  {
    id: '1',
    petId: '1',
    type: 'Kontrol Muayenesi',
    date: '2024-12-15',
    time: '14:00',
    veterinarian: 'Dr. Ahmet Yıldız',
    notes: 'Genel sağlık kontrolü'
  },
  {
    id: '2',
    petId: '2',
    type: 'Aşı',
    date: '2024-12-20', 
    time: '10:30',
    veterinarian: 'Dr. Elif Kaya',
    notes: 'Kuduz aşısı'
  }
];

// Live feed updates
export const mockLiveUpdates = [
  {
    id: '1',
    type: 'sighting',
    petName: 'Miminko',
    petId: '1',
    location: 'Kadıköy Sahil',
    timeAgo: '2 dk önce',
    description: 'Mavi tasmalı kedi görüldü',
    reporterId: 'user2'
  },
  {
    id: '2',
    type: 'found',
    petName: 'Pamuk',
    petId: '5', 
    location: 'Beşiktaş Park',
    timeAgo: '1 saat önce',
    description: 'Ailesine kavuştu! 🎉',
    reporterId: 'user2'
  },
  {
    id: '3',
    type: 'emergency',
    petName: 'Max',
    petId: '2',
    location: 'Üsküdar',
    timeAgo: '3 saat önce', 
    description: 'Acil durum bildirimi',
    reporterId: 'user4'
  }
];

// Recent activity for profile
export const mockRecentActivity = [
  {
    id: '1',
    type: 'pet_found',
    description: 'Pamuk adlı kediyi buldu',
    timestamp: '2024-12-06T20:00:00Z',
    points: 100
  },
  {
    id: '2', 
    type: 'sighting_reported',
    description: 'Max için görülme bildirdi',
    timestamp: '2024-12-09T18:20:00Z',
    points: 25
  },
  {
    id: '3',
    type: 'badge_earned',
    description: 'Yardım Kahramanı rozeti kazandı',
    timestamp: '2024-12-05T15:30:00Z',
    points: 50
  }
];

export const mockStats = {
  totalPetsReported: 1247,
  petsFound: 1089,
  activeSearches: 158,
  successRate: 87,
  totalVolunteers: 5643,
  totalDonations: 128450, // TL
  donationCount: 2847,
  angelHavenPartnership: {
    enabled: true,
    percentage: 25,
    totalDonated: 32112.50
  }
};

// Export all mock data functions
export const getMockPets = () => mockPets;
export const getMockUsers = () => mockUsers;
export const getMockNearbyPets = (userLocation?: {lat: number, lng: number}) => {
  // Simulate location-based filtering
  return mockPets.filter(pet => !pet.is_found).slice(0, 4);
};
export const getMockSightings = () => mockSightings;
export const getMockMessages = () => mockMessages;
export const getMockHealthRecords = () => mockHealthRecords;
export const getMockAppointments = () => mockAppointments;
export const getMockBadges = () => mockBadges;
export const getMockLeaderboard = () => mockLeaderboard;
export const getMockStats = () => mockStats;
export const getMockLiveUpdates = () => mockLiveUpdates;
export const getMockRecentActivity = () => mockRecentActivity;