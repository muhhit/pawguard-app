import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';


type PremiumPlan = {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  featuresEn: string[];
  popular?: boolean;
  badge?: string;
  badgeEn?: string;
};

type PremiumContextType = {
  isPremium: boolean;
  currentPlan: PremiumPlan | null;
  plans: PremiumPlan[];
  subscribeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
  subscriptionEndDate: Date | null;
  trialDaysLeft: number;
  hasActiveTrial: boolean;
  startFreeTrial: () => Promise<void>;
};

const PREMIUM_STORAGE_KEY = 'premium_subscription';
const TRIAL_STORAGE_KEY = 'premium_trial';

// Premium plans configuration
const premiumPlans: PremiumPlan[] = [
  {
    id: 'basic_monthly',
    name: 'Temel Plan',
    nameEn: 'Basic Plan',
    price: 29,
    duration: 'monthly',
    features: [
      '🔍 Gelişmiş arama filtreleri',
      '📱 Öncelikli bildirimler',
      '🎯 5 km genişletilmiş arama alanı',
      '📊 Temel istatistikler',
      '💬 Topluluk desteği'
    ],
    featuresEn: [
      '🔍 Advanced search filters',
      '📱 Priority notifications',
      '🎯 5km extended search radius',
      '📊 Basic statistics',
      '💬 Community support'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium Plan',
    nameEn: 'Premium Plan',
    price: 59,
    originalPrice: 79,
    duration: 'monthly',
    popular: true,
    badge: 'En Popüler',
    badgeEn: 'Most Popular',
    features: [
      '🤖 AI destekli evcil hayvan tanıma',
      '🗺️ Gerçek zamanlı harita takibi',
      '📍 GPS konum paylaşımı',
      '🔔 Anında SMS bildirimleri',
      '📞 7/24 acil destek hattı',
      '🏆 Ödül sistemi erişimi',
      '📈 Detaylı analitik raporlar'
    ],
    featuresEn: [
      '🤖 AI-powered pet recognition',
      '🗺️ Real-time map tracking',
      '📍 GPS location sharing',
      '🔔 Instant SMS notifications',
      '📞 24/7 emergency support',
      '🏆 Reward system access',
      '📈 Detailed analytics reports'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yıllık',
    nameEn: 'Premium Yearly',
    price: 590,
    originalPrice: 708,
    duration: 'yearly',
    badge: '%17 İndirim',
    badgeEn: '17% Off',
    features: [
      '🤖 AI destekli evcil hayvan tanıma',
      '🗺️ Gerçek zamanlı harita takibi',
      '📍 GPS konum paylaşımı',
      '🔔 Anında SMS bildirimleri',
      '📞 7/24 acil destek hattı',
      '🏆 Ödül sistemi erişimi',
      '📈 Detaylı analitik raporlar',
      '💰 2 ay ücretsiz',
      '🎁 Özel hediyeler'
    ],
    featuresEn: [
      '🤖 AI-powered pet recognition',
      '🗺️ Real-time map tracking',
      '📍 GPS location sharing',
      '🔔 Instant SMS notifications',
      '📞 24/7 emergency support',
      '🏆 Reward system access',
      '📈 Detailed analytics reports',
      '💰 2 months free',
      '🎁 Exclusive gifts'
    ]
  }
];

export const [PremiumProvider, usePremium] = createContextHook((): PremiumContextType => {
  const [isPremium, setIsPremium] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PremiumPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [hasActiveTrial, setHasActiveTrial] = useState(false);

  // Load saved premium status on mount
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const [premiumData, trialData] = await Promise.all([
        AsyncStorage.getItem(PREMIUM_STORAGE_KEY),
        AsyncStorage.getItem(TRIAL_STORAGE_KEY)
      ]);
      
      if (premiumData) {
        const data = JSON.parse(premiumData);
        setIsPremium(data.isPremium);
        setCurrentPlan(data.plan);
        setSubscriptionEndDate(data.endDate ? new Date(data.endDate) : null);
      }
      
      if (trialData) {
        const trial = JSON.parse(trialData);
        const trialEnd = new Date(trial.endDate);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        setTrialDaysLeft(daysLeft);
        setHasActiveTrial(daysLeft > 0);
        
        // If trial is active and no premium subscription, set as premium
        if (daysLeft > 0 && !isPremium) {
          setIsPremium(true);
        }
      }
    } catch (error) {
      console.error('Error loading premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPlan = useCallback(async (planId: string) => {
    try {
      setIsLoading(true);
      
      const plan = premiumPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const endDate = new Date();
      if (plan.duration === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      const subscriptionData = {
        isPremium: true,
        plan,
        endDate: endDate.toISOString(),
        subscribedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(subscriptionData));
      
      setIsPremium(true);
      setCurrentPlan(plan);
      setSubscriptionEndDate(endDate);
      
      // Clear trial if exists
      await AsyncStorage.removeItem(TRIAL_STORAGE_KEY);
      setHasActiveTrial(false);
      setTrialDaysLeft(0);
      
      console.log('Successfully subscribed to premium plan:', plan.name);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      
      await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
      
      setIsPremium(false);
      setCurrentPlan(null);
      setSubscriptionEndDate(null);
      
      console.log('Successfully cancelled premium subscription');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startFreeTrial = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial
      
      const trialData = {
        startDate: new Date().toISOString(),
        endDate: trialEndDate.toISOString()
      };
      
      await AsyncStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(trialData));
      
      setHasActiveTrial(true);
      setTrialDaysLeft(7);
      setIsPremium(true);
      
      console.log('Successfully started free trial');
    } catch (error) {
      console.error('Error starting free trial:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(() => ({
    isPremium,
    currentPlan,
    plans: premiumPlans,
    subscribeToPlan,
    cancelSubscription,
    isLoading,
    subscriptionEndDate,
    trialDaysLeft,
    hasActiveTrial,
    startFreeTrial,
  }), [
    isPremium,
    currentPlan,
    subscribeToPlan,
    cancelSubscription,
    isLoading,
    subscriptionEndDate,
    trialDaysLeft,
    hasActiveTrial,
    startFreeTrial,
  ]);
});