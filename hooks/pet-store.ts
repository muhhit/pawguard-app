import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/hooks/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AIServiceManager } from "@/hooks/ai-service";
import { 
  getMockPets, 
  getMockNearbyPets, 
  getMockSightings,
  getMockHealthRecords,
  getMockAppointments 
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { useLocation } from "@/hooks/location-store";
type UserType = 'owner' | 'public' | 'finder';

export interface MedicalRecord {
  id: string;
  type: 'vaccination' | 'vet_visit' | 'medication' | 'surgery' | 'other';
  title: string;
  date: string;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
  next_due_date?: string; // For vaccinations
  documents?: string[]; // Photo URLs of medical documents
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string | null;
  age: string;
  weight?: string;
  microchip_id?: string;
  last_location: {
    lat: number;
    lng: number;
  };
  found_location?: {
    lat: number;
    lng: number;
  };
  reward_amount: number;
  is_found: boolean;
  photos: string[];
  medical_records: MedicalRecord[];
  created_at: string;
}

export interface Sighting {
  id: string;
  pet_id: string;
  reporter_id: string;
  location: {
    lat: number;
    lng: number;
  };
  notes: string | null;
  photo: string | null;
  created_at: string;
}

export const [PetProvider, usePets] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { currentLocation } = useLocation();
  
  // Error retry counts
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Fetch user's pets
  const petsQuery = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];
        
        // Try Supabase first
        if ((supabase as any)?.from) {
          const { data, error } = await supabase
            .from('pets')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          const rows = (data || []).map((row: any) => ({
            id: row.id,
            owner_id: row.owner_id,
            name: row.name,
            type: row.type,
            breed: row.breed,
            ownership: row.ownership || 'owned',
            last_location: row.last_location ? {
              lat: row.last_location?.y ?? row.last_location?.coordinates?.[1],
              lng: row.last_location?.x ?? row.last_location?.coordinates?.[0],
            } : null,
            reward_amount: row.reward_amount ?? 0,
            is_found: !!row.is_found,
            photos: row.photos || [],
            medical_records: [],
            created_at: row.created_at,
          })) as Pet[];
          return rows;
        }

        // Fallback to mock data
        return getMockPets().map(pet => ({
          ...pet,
          medical_records: getMockHealthRecords().filter(record => record.petId === pet.id).map(record => ({
            id: record.id,
            type: record.type,
            title: record.title,
            date: record.date,
            veterinarian: record.veterinarian,
            clinic: 'İstanbul Pet Clinic',
            notes: record.notes || record.description,
            next_due_date: record.nextDue,
            documents: []
          }))
        })) as Pet[];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching pets:', errorMessage);
        throw new Error(`Failed to fetch pets: ${errorMessage}`);
      }
    },
    enabled: isAuthenticated && !!user,
    retry: (failureCount, error) => {
      if (failureCount < maxRetries) {
        setRetryCount(failureCount + 1);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mock nearby pets data as fallback
  const mockNearbyPetsData: Pet[] = [
    {
      id: 'mock-nearby-1',
      owner_id: 'other-user-1',
      name: 'Luna',
      type: 'cat',
      breed: 'Persian',
      age: '2 years',
      last_location: {
        lat: 41.0100,
        lng: 28.9800
      },
      reward_amount: 300,
      is_found: false,
      photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
      medical_records: [],
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 'mock-nearby-2',
      owner_id: 'other-user-2',
      name: 'Max',
      type: 'dog',
      breed: 'Labrador',
      age: '5 years',
      last_location: {
        lat: 41.0050,
        lng: 28.9750
      },
      reward_amount: 750,
      is_found: false,
      photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'],
      medical_records: [],
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 'mock-nearby-3',
      owner_id: 'other-user-3',
      name: 'Bella',
      type: 'dog',
      breed: 'German Shepherd',
      age: '4 years',
      last_location: {
        lat: 41.0120,
        lng: 28.9820
      },
      reward_amount: 1000,
      is_found: false,
      photos: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'],
      medical_records: [],
      created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
  ];

  // Fetch nearby lost pets
  const nearbyPetsQuery = useQuery({
    queryKey: ['nearby-pets'],
    queryFn: async () => {
      try {
        // Supabase + gizlilik: get_pets_with_privacy üzerinden çek, mesafeyi istemcide uygula
        if ((supabase as any)?.rpc) {
          const requester = user?.id || null;
          // Try v2 first (city-aware); fallback to v1
          let data: any = null; let error: any = null;
          if (requester) {
            try {
              const v2 = await supabase.rpc('get_pets_with_privacy_v2', { requester_id: requester, city: 'istanbul' });
              data = v2.data; error = v2.error;
            } catch {}
          }
          if (!data) {
            const v1 = await supabase.rpc('get_pets_with_privacy', requester ? { requester_id: requester } : {} as any);
            data = v1.data; error = v1.error;
          }
          if (error) throw error;
          const rows = (data || []).map((row: any) => ({
            id: row.id,
            owner_id: row.owner_id,
            name: row.name,
            type: row.type,
            breed: row.breed,
            last_location: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : null,
            reward_amount: row.reward_amount ?? 0,
            is_found: !!row.is_found,
            photos: row.photos || [],
            medical_records: [],
            created_at: row.created_at,
          })) as Pet[];
          // Mesafe filtresi
          if (currentLocation) {
            const within = rows.filter(p => {
              if (!p.last_location) return false;
              const d = Math.sqrt(
                Math.pow((p.last_location.lat - currentLocation.latitude), 2) +
                Math.pow((p.last_location.lng - currentLocation.longitude), 2)
              );
              // basit yaklaşık eşik, harita bileşeni ayrıca hesaplıyor
              return d < 0.5; // ~ birkaç km (yaklaşık), UI içinde hassas filtre var
            });
            return within;
          }
          return rows;
        }
        // Fallback: mock
        return getMockNearbyPets().map(pet => ({ ...pet, medical_records: [] }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching nearby pets:', errorMessage);
        // Return fallback
        return getMockNearbyPets().map(pet => ({ ...pet, medical_records: [] }));
      }
    },
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2) {
        console.log(`Retrying nearby pets query, attempt ${failureCount + 1}`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    // Always provide fallback data
    placeholderData: getMockNearbyPets().map(pet => ({
      ...pet,
      medical_records: []
    })),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add pet mutation
  const addPetMutation = useMutation({
    mutationFn: async (petData: Omit<Pet, 'id' | 'owner_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      if ((supabase as any)?.from) {
          const payload: any = {
            owner_id: user.id,
            name: petData.name,
            type: petData.type,
            breed: petData.breed,
            ownership: (petData as any).ownership || 'owned',
            last_location: petData.last_location
              ? `POINT(${petData.last_location.lng} ${petData.last_location.lat})`
              : null,
            reward_amount: petData.reward_amount,
            is_found: petData.is_found,
            photos: petData.photos,
          };
        const { data, error } = await supabase.from('pets').insert(payload).select('*').single();
        if (error) throw error;
        const created: Pet = {
          id: data.id,
          owner_id: data.owner_id,
          name: data.name,
          type: data.type,
          breed: data.breed,
          last_location: data.last_location ? {
            lat: data.last_location?.y ?? data.last_location?.coordinates?.[1],
            lng: data.last_location?.x ?? data.last_location?.coordinates?.[0],
          } : null,
          reward_amount: data.reward_amount ?? 0,
          is_found: !!data.is_found,
          photos: data.photos || [],
          medical_records: [],
          created_at: data.created_at,
        };
        return created;
      }
      // Fallback mock
      return {
        id: 'mock-pet-' + Date.now(),
        owner_id: user.id,
        ...petData,
        medical_records: petData.medical_records || [],
        created_at: new Date().toISOString(),
      } as Pet;
    },
    onSuccess: async (newPet) => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
      
      // Trigger automation for lost pet
      if (!newPet.is_found) {
        console.log('🚨 New lost pet reported, triggering automation...');
        try {
          await AIServiceManager.triggerLostPetAutomation({
            name: newPet.name,
            type: newPet.type,
            breed: newPet.breed,
            location: newPet.last_location ? `${newPet.last_location.lat}, ${newPet.last_location.lng}` : 'Unknown location',
            rewardAmount: newPet.reward_amount,
            contact: user?.email || 'Owner',
            lastSeen: 'Recently',
            ownerName: user?.name || 'Pet Owner'
          });
        } catch (error) {
          console.error('Automation failed:', error);
        }
      }
    },
  });

  // Update pet mutation
  const updatePetMutation = useMutation({
    mutationFn: async ({ petId, updates }: { petId: string; updates: Partial<Pet> }) => {
      if ((supabase as any)?.from) {
        const payload: any = { ...updates };
        if (updates.last_location) {
          payload.last_location = `POINT(${updates.last_location.lng} ${updates.last_location.lat})`;
        }
        const { data, error } = await supabase
          .from('pets')
          .update(payload)
          .eq('id', petId)
          .select('*')
          .single();
        if (error) throw error;
        const updated: Pet = {
          id: data.id,
          owner_id: data.owner_id,
          name: data.name,
          type: data.type,
          breed: data.breed,
          ownership: data.ownership || 'owned',
          last_location: data.last_location ? {
            lat: data.last_location?.y ?? data.last_location?.coordinates?.[1],
            lng: data.last_location?.x ?? data.last_location?.coordinates?.[0],
          } : null,
          reward_amount: data.reward_amount ?? 0,
          is_found: !!data.is_found,
          photos: data.photos || [],
          medical_records: [],
          created_at: data.created_at,
        };
        return updated;
      }
      // Fallback mock
      return {
        id: petId,
        owner_id: user?.id || 'mock-owner',
        name: 'Updated Pet',
        type: 'dog',
        breed: null,
        last_location: null,
        reward_amount: 100,
        is_found: false,
        photos: [],
        medical_records: [],
        created_at: new Date().toISOString(),
        ...updates,
      } as Pet;
    },
    onSuccess: async (updatedPet, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['nearby-pets'] });
      
      // Trigger automation if pet was marked as found
      if (variables.updates.is_found === true) {
        console.log('🎉 Pet marked as found, triggering celebration automation...');
        try {
          await AIServiceManager.triggerFoundPetAutomation({
            name: updatedPet.name,
            type: updatedPet.type,
            daysMissing: Math.floor((Date.now() - new Date(updatedPet.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            foundLocation: updatedPet.last_location ? `${updatedPet.last_location.lat}, ${updatedPet.last_location.lng}` : 'Safe location',
            helperName: 'Community member',
            ownerName: user?.name || 'Pet Owner'
          });
        } catch (error) {
          console.error('Found pet automation failed:', error);
        }
      }
    },
  });

  // Delete pet mutation
  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      // Mock successful pet deletion since backend is not enabled
      console.log('Backend not enabled, simulating pet deletion');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
    },
  });

  // Add sighting mutation
  const addSightingMutation = useMutation({
    mutationFn: async (sightingData: Omit<Sighting, 'id' | 'reporter_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      // Mock successful sighting creation since backend is not enabled
      console.log('Backend not enabled, simulating sighting creation');
      const mockSighting: Sighting = {
        id: 'mock-sighting-' + Date.now(),
        reporter_id: user.id,
        ...sightingData,
        created_at: new Date().toISOString()
      };

      return mockSighting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sightings'] });
    },
  });

  const addPet = useCallback(async (petData: Omit<Pet, 'id' | 'owner_id' | 'created_at'>) => {
    return addPetMutation.mutateAsync(petData);
  }, [addPetMutation.mutateAsync]);

  const updatePet = useCallback(async (petId: string, updates: Partial<Pet>) => {
    return updatePetMutation.mutateAsync({ petId, updates });
  }, [updatePetMutation.mutateAsync]);

  const deletePet = useCallback(async (petId: string) => {
    return deletePetMutation.mutateAsync(petId);
  }, [deletePetMutation.mutateAsync]);

  const addSighting = useCallback(async (sightingData: Omit<Sighting, 'id' | 'reporter_id' | 'created_at'>) => {
    return addSightingMutation.mutateAsync(sightingData);
  }, [addSightingMutation.mutateAsync]);

  const getPetById = useCallback((petId: string) => {
    if (!petId || !Array.isArray(petsQuery.data)) return undefined;
    return petsQuery.data.find((pet) => pet?.id === petId);
  }, [petsQuery.data]);

  // Get user type for a specific pet (owner, finder with active claim, or public)
  const getUserType = useCallback(async (petId: string): Promise<UserType> => {
    if (!user) return 'public';
    
    // Check if user is the pet owner
    const pet = getPetById(petId);
    if (pet?.owner_id === user?.id) {
      return 'owner';
    }
    
    // Check if user has an active reward claim for this pet
    try {
      // Mock reward claims check since backend is not enabled
      console.log('Backend not enabled, simulating reward claims check');
      
      // For demo purposes, return 'finder' for some pets
      if (petId.includes('nearby')) {
        return 'finder';
      }
    } catch (error) {
      console.error('Error in getUserType:', error);
    }
    
    return 'public';
  }, [user, getPetById]);

  // Check if user can request exact location (for finders)
  const canRequestExactLocation = useCallback(async (petId: string): Promise<boolean> => {
    const userType = await getUserType(petId);
    return userType === 'finder';
  }, [getUserType]);

  // Request exact location notification to owner
  const requestExactLocation = useCallback(async (petId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const canRequest = await canRequestExactLocation(petId);
    if (!canRequest) {
      throw new Error('You need an active reward claim to request exact location');
    }
    
    // In a real app, this would send a push notification to the pet owner
    // For now, we'll just log it
    console.log(`Location request sent to pet owner for pet ${petId} by user ${user.id}`);
    
    return true;
  }, [user, canRequestExactLocation]);

  // Retry functions
  const retryPetsQuery = useCallback(() => {
    setRetryCount(0);
    petsQuery.refetch();
  }, [petsQuery.refetch]);
  
  const retryNearbyPetsQuery = useCallback(() => {
    nearbyPetsQuery.refetch();
  }, [nearbyPetsQuery.refetch]);
  
  const retryAddPet = useCallback((petData: Omit<Pet, 'id' | 'owner_id' | 'created_at'>) => {
    return addPetMutation.mutateAsync(petData);
  }, [addPetMutation.mutateAsync]);

  return useMemo(() => ({
    pets: Array.isArray(petsQuery.data) ? petsQuery.data : [],
    nearbyPets: Array.isArray(nearbyPetsQuery.data) ? nearbyPetsQuery.data : mockNearbyPetsData,
    isLoading: petsQuery.isLoading || nearbyPetsQuery.isLoading,
    isError: petsQuery.isError || nearbyPetsQuery.isError,
    error: petsQuery.error || nearbyPetsQuery.error,
    addPet,
    updatePet,
    deletePet,
    addSighting,
    getPetById,
    getUserType,
    canRequestExactLocation,
    requestExactLocation,
    isAddingPet: addPetMutation.isPending,
    isUpdatingPet: updatePetMutation.isPending,
    isDeletingPet: deletePetMutation.isPending,
    isAddingSighting: addSightingMutation.isPending,
    addPetError: addPetMutation.error,
    updatePetError: updatePetMutation.error,
    deletePetError: deletePetMutation.error,
    addSightingError: addSightingMutation.error,
    retryPetsQuery,
    retryNearbyPetsQuery,
    retryAddPet,
  }), [
    petsQuery.data,
    nearbyPetsQuery.data,
    petsQuery.isLoading,
    nearbyPetsQuery.isLoading,
    petsQuery.isError,
    nearbyPetsQuery.isError,
    addPet,
    updatePet,
    deletePet,
    addSighting,
    getPetById,
    getUserType,
    canRequestExactLocation,
    requestExactLocation,
    addPetMutation.isPending,
    updatePetMutation.isPending,
    deletePetMutation.isPending,
    addSightingMutation.isPending,
    petsQuery.error,
    nearbyPetsQuery.error,
    addPetMutation.error,
    updatePetMutation.error,
    deletePetMutation.error,
    addSightingMutation.error,
    retryPetsQuery,
    retryNearbyPetsQuery,
    retryAddPet,
  ]);
});
