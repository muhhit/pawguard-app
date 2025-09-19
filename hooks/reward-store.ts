import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";

export interface RewardClaim {
  id: string;
  pet_id: string;
  claimer_id: string;
  owner_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  evidence_photo: string | null;
  evidence_notes: string | null;
  payment_id: string | null;
  payment_method: 'iyzico' | 'manual' | null;
  created_at: string;
  updated_at: string;
}

export interface RewardClaimWithPet extends RewardClaim {
  pet: {
    name: string;
    type: string;
    photos: string[];
  };
  claimer: {
    name: string | null;
    email: string;
  };
  owner: {
    name: string | null;
    email: string;
  };
}

export const [RewardProvider, useRewards] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reward claims for pets owned by user
  const myRewardClaimsQuery = useQuery({
    queryKey: ['reward-claims', 'owner', user?.id, user],
    queryFn: async () => {
      if (!user) return [];
      if (supabase) {
        const { data, error } = await supabase
          .from('reward_claims')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }
      return [];
    },
    enabled: isAuthenticated && !!user,
  });

  // Fetch reward claims made by user
  const myClaimsQuery = useQuery({
    queryKey: ['reward-claims', 'claimer', user?.id, user],
    queryFn: async () => {
      if (!user) return [];
      if (supabase) {
        const { data, error } = await supabase
          .from('reward_claims')
          .select('*')
          .eq('claimer_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }
      return [];
    },
    enabled: isAuthenticated && !!user,
  });

  // Create reward claim mutation
  const createClaimMutation = useMutation({
    mutationFn: async ({
      petId,
      ownerId,
      amount,
      evidencePhoto,
      evidenceNotes
    }: {
      petId: string;
      ownerId: string;
      amount: number;
      evidencePhoto?: string;
      evidenceNotes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      if ((supabase as any)?.from) {
        const payload: any = {
          pet_id: petId,
          claimer_id: user.id,
          owner_id: ownerId,
          amount,
          evidence_photo: evidencePhoto ?? null,
          evidence_notes: evidenceNotes ?? null,
          status: 'pending'
        };
        const { data, error } = await supabase.from('reward_claims').insert(payload).select('*').single();
        if (error) throw error;
        return data as any;
      }
      // Fallback mock structure
      return {
        id: 'mock-claim-' + Date.now(),
        pet_id: petId,
        claimer_id: user.id,
        owner_id: ownerId,
        amount,
        evidence_photo: evidencePhoto || null,
        evidence_notes: evidenceNotes || null,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_id: null,
        payment_method: null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-claims'] });
      Alert.alert(
        'Claim Submitted',
        'Your reward claim has been submitted to the pet owner for review.'
      );
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to submit reward claim. Please try again.');
    },
  });

  // Update claim status mutation (for pet owners)
  const updateClaimStatusMutation = useMutation({
    mutationFn: async ({
      claimId,
      status
    }: {
      claimId: string;
      status: 'approved' | 'rejected' | 'paid';
    }) => {
      if (supabase) {
        const { data, error } = await supabase
          .from('reward_claims')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', claimId)
          .select('*')
          .single();
        if (error) throw error;
        return data as any;
      }
      return {
        id: claimId,
        pet_id: 'mock-pet-id',
        claimer_id: 'mock-claimer-id',
        owner_id: user?.id || 'mock-owner-id',
        amount: 100,
        status,
        evidence_photo: null,
        evidence_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_id: null,
        payment_method: null,
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reward-claims'] });
      
      const statusMessages = {
        approved: 'Reward claim approved! Please arrange payment with the finder.',
        rejected: 'Reward claim has been rejected.',
        paid: 'Reward has been marked as paid. Thank you!'
      };
      
      Alert.alert('Status Updated', statusMessages[variables.status]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update claim status. Please try again.');
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({
      claimId,
      paymentId,
      paymentMethod,
      amount
    }: {
      claimId: string;
      paymentId: string;
      paymentMethod: 'iyzico' | 'manual';
      amount: number;
    }) => {
      if (supabase) {
        const { data, error } = await supabase
          .from('reward_claims')
          .update({ status: 'paid', payment_id: paymentId, payment_method: paymentMethod, updated_at: new Date().toISOString() })
          .eq('id', claimId)
          .select('*')
          .single();
        if (error) throw error;
        return data as any;
      }
      return {
        id: claimId,
        pet_id: 'mock-pet-id',
        claimer_id: 'mock-claimer-id',
        owner_id: user?.id || 'mock-owner-id',
        amount,
        status: 'paid' as const,
        evidence_photo: null,
        evidence_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_id: paymentId,
        payment_method: paymentMethod,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reward-claims'] });
      if (data) {
        markPetFoundMutation.mutate(data.pet_id);
      }
      Alert.alert('Payment Successful', 'Reward payment has been processed successfully!');
    },
    onError: () => {
      Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
    },
  });

  // Update evidence mutation
  const updateClaimEvidenceMutation = useMutation({
    mutationFn: async ({
      claimId,
      evidencePhoto,
      evidenceNotes,
    }: { claimId: string; evidencePhoto?: string | null; evidenceNotes?: string | null }) => {
      if (supabase) {
        const { data, error } = await supabase
          .from('reward_claims')
          .update({ evidence_photo: evidencePhoto ?? null, evidence_notes: evidenceNotes ?? null, updated_at: new Date().toISOString() })
          .eq('id', claimId)
          .select('*')
          .single();
        if (error) throw error;
        return data as any;
      }
      return null as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-claims'] });
    },
  });

  // Mark pet as found when reward is paid
  const markPetFoundMutation = useMutation({
    mutationFn: async (petId: string) => {
      // Mock successful pet found marking since backend is not enabled
      console.log('Backend not enabled, simulating pet found marking');
      return {
        id: petId,
        owner_id: user?.id || 'mock-owner-id',
        name: 'Mock Pet',
        type: 'dog',
        breed: null,
        last_location: null,
        reward_amount: 100,
        is_found: true,
        photos: [],
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-pets'] });
    },
  });

  const createClaim = useCallback(async ({
    petId,
    ownerId,
    amount,
    evidencePhoto,
    evidenceNotes
  }: {
    petId: string;
    ownerId: string;
    amount: number;
    evidencePhoto?: string;
    evidenceNotes?: string;
  }) => {
    return createClaimMutation.mutateAsync({
      petId,
      ownerId,
      amount,
      evidencePhoto,
      evidenceNotes
    });
  }, []);

  const updateClaimStatus = useCallback(async (claimId: string, status: 'approved' | 'rejected' | 'paid') => {
    const result = await updateClaimStatusMutation.mutateAsync({ claimId, status });
    
    // If marking as paid, also mark pet as found
    if (status === 'paid' && result) {
      await markPetFoundMutation.mutateAsync(result.pet_id);
    }
    
    return result;
  }, []);

  const getClaimsByPet = useCallback((petId: string): RewardClaim[] => {
    const claims = myRewardClaimsQuery.data as RewardClaim[] | undefined;
    return claims?.filter((claim) => claim.pet_id === petId) || [];
  }, [myRewardClaimsQuery.data]);

  const getPendingClaimsCount = useCallback((): number => {
    const claims = myRewardClaimsQuery.data as RewardClaim[] | undefined;
    return claims?.filter((claim) => claim.status === 'pending').length || 0;
  }, [myRewardClaimsQuery.data]);

  const processPayment = useCallback(async ({
    claimId,
    paymentId,
    paymentMethod,
    amount
  }: {
    claimId: string;
    paymentId: string;
    paymentMethod: 'iyzico' | 'manual';
    amount: number;
  }) => {
    return processPaymentMutation.mutateAsync({
      claimId,
      paymentId,
      paymentMethod,
      amount
    });
  }, []);

  return useMemo(() => ({
    // Data
    myRewardClaims: myRewardClaimsQuery.data || [],
    myClaims: myClaimsQuery.data || [],
    
    // Loading states
    isLoading: myRewardClaimsQuery.isLoading || myClaimsQuery.isLoading,
    isError: myRewardClaimsQuery.isError || myClaimsQuery.isError,
    isCreatingClaim: createClaimMutation.isPending,
    isUpdatingStatus: updateClaimStatusMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    
    // Actions
    createClaim,
    updateClaimStatus,
    processPayment,
    updateClaimEvidence: (args: { claimId: string; evidencePhoto?: string | null; evidenceNotes?: string | null }) => updateClaimEvidenceMutation.mutateAsync(args),
    getClaimsByPet,
    getPendingClaimsCount,
  }), [
    myRewardClaimsQuery.data,
    myClaimsQuery.data,
    myRewardClaimsQuery.isLoading,
    myClaimsQuery.isLoading,
    myRewardClaimsQuery.isError,
    myClaimsQuery.isError,
    createClaimMutation.isPending,
    updateClaimStatusMutation.isPending,
    processPaymentMutation.isPending,
    createClaim,
    updateClaimStatus,
    processPayment,
    updateClaimEvidenceMutation.mutateAsync,
    getClaimsByPet,
    getPendingClaimsCount,
  ]);
});
