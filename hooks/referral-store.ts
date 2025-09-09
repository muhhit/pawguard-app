import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Share } from 'react-native';

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  reward_status: 'pending' | 'fulfilled' | 'expired';
  referrer_reward_type: 'premium_months' | 'credits' | 'pet_id_tag';
  referrer_reward_value: number;
  referee_reward_type: 'premium_months' | 'credits' | 'pet_id_tag';
  referee_reward_value: number;
  created_at: string;
  fulfilled_at?: string;
}

export interface ReferralMetrics {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number;
  conversionRate: number;
  kFactor: number;
}

export interface ReferralReward {
  type: 'premium_months' | 'credits' | 'pet_id_tag';
  value: number;
  description: string;
  icon: string;
}

const REFERRAL_REWARDS = {
  referrer: { type: 'premium_months' as const, value: 1, description: '1 ay ücretsiz premium', icon: '👑' },
  referee: { type: 'premium_months' as const, value: 1, description: '1 ay ücretsiz premium', icon: '🎁' }
};

const EXPECTED_METRICS = {
  kFactor: 1.4, // Target viral coefficient
  referralRate: 0.18, // 18% of users refer
  conversionRate: 0.65, // 65% of referrals convert
  rewardThreshold: 3 // Need 3 referrals for reward
};

export const [ReferralProvider, useReferrals] = createContextHook(() => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<ReferralMetrics>({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalRewardsEarned: 0,
    conversionRate: 0,
    kFactor: 0
  });

  // Generate referral code from user ID
  const generateReferralCode = useCallback((userId: string): string => {
    const base = userId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `PET${base}`;
  }, []);

  // Load referral code and data
  useEffect(() => {
    if (user?.id) {
      const code = generateReferralCode(user.id);
      setReferralCode(code);
    }
  }, [user?.id, generateReferralCode]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // Return empty data since backend is not enabled
        console.log('Backend not enabled, returning empty referral data');
        setReferrals([]);
        
        // Set default metrics
        setMetrics({
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingReferrals: 0,
          totalRewardsEarned: 0,
          conversionRate: 0,
          kFactor: 0
        });
      } catch (error: any) {
        console.error('Error loading referral data:', error?.message || error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadReferralData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Return empty data since backend is not enabled
      console.log('Backend not enabled, returning empty referral data');
      setReferrals([]);
      
      // Set default metrics
      setMetrics({
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalRewardsEarned: 0,
        conversionRate: 0,
        kFactor: 0
      });
    } catch (error: any) {
      console.error('Error loading referral data:', error?.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const trackReferral = useCallback(async (referralCode: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to use referral code');
    }

    try {
      // Mock successful referral tracking since backend is not enabled
      console.log('Backend not enabled, simulating referral tracking');
      
      // Basic validation
      if (!referralCode.startsWith('PET')) {
        throw new Error('Invalid referral code format');
      }
      
      const codeBase = referralCode.replace('PET', '');
      if (codeBase.toLowerCase().includes(user.id.substring(0, 8).toLowerCase())) {
        throw new Error('You cannot use your own referral code');
      }

      // Store referral code used
      await AsyncStorage.setItem('referral_code_used', referralCode);
      
      const mockReferral = {
        id: 'mock-referral-' + Date.now(),
        referrer_id: 'mock-referrer-id',
        referee_id: user.id,
        reward_status: 'pending' as const,
        referrer_reward_type: REFERRAL_REWARDS.referrer.type,
        referrer_reward_value: REFERRAL_REWARDS.referrer.value,
        referee_reward_type: REFERRAL_REWARDS.referee.type,
        referee_reward_value: REFERRAL_REWARDS.referee.value,
        created_at: new Date().toISOString(),
        fulfilled_at: null,
      };
      
      return { success: true, referral: mockReferral };
    } catch (error: any) {
      console.error('Error tracking referral:', error?.message || error);
      throw error;
    }
  }, [user?.id]);



  const shareReferralCode = useCallback(async () => {
    if (!referralCode) return;

    const shareMessage = `🐾 Kayıp dostunu bul! PawGuard ile evcil hayvanları güvende tut. Benim davet kodumla kaydol ve ücretsiz premium kazan! Kod: ${referralCode}`;
    const shareUrl = `https://pawguard.app/ref/${referralCode}`;
    
    try {
      await Share.share({
        message: shareMessage,
        title: 'PawGuard - Evcil Hayvan Güvenliği',
        url: shareUrl
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sharing referral code:', error?.message || error);
      Alert.alert('Hata', 'Davet kodu paylaşılamadı');
      return false;
    }
  }, [referralCode]);

  const sendEmergencyBroadcast = useCallback(async (petId: string, location: { lat: number; lng: number }) => {
    if (!user?.id) return;

    try {
      // Mock emergency broadcast since backend is not enabled
      console.log('Backend not enabled, simulating emergency broadcast');
      
      // Simulate finding nearby users
      const recipientCount = Math.floor(Math.random() * 50) + 10; // Random 10-60 users
      
      // In a real app, you would send push notifications here
      console.log(`Emergency broadcast sent to ${recipientCount} users`);
      
      Alert.alert(
        'Emergency Alert Sent! 🚨',
        `Notified ${recipientCount} users in your area about the missing pet.`,
        [{ text: 'OK' }]
      );
      
      return { recipientCount };
    } catch (error: any) {
      console.error('Error sending emergency broadcast:', error?.message || error);
      Alert.alert('Error', 'Failed to send emergency broadcast');
    }
  }, [user?.id]);

  const getReferralRewards = useCallback(() => {
    return REFERRAL_REWARDS;
  }, []);

  const getExpectedMetrics = useCallback(() => {
    return EXPECTED_METRICS;
  }, []);

  const value = useMemo(() => ({
    // State
    referrals,
    referralCode,
    metrics,
    isLoading,
    
    // Actions
    trackReferral,
    shareReferralCode,
    sendEmergencyBroadcast,
    loadReferralData,
    
    // Getters
    getReferralRewards,
    getExpectedMetrics,
    
    // Utils
    generateReferralCode
  }), [
    referrals,
    referralCode,
    metrics,
    isLoading,
    trackReferral,
    shareReferralCode,
    sendEmergencyBroadcast,
    loadReferralData,
    getReferralRewards,
    getExpectedMetrics,
    generateReferralCode
  ]);

  return value;
});