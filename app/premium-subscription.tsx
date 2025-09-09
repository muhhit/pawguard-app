import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Gift,
  ArrowLeft,
  Sparkles
} from 'lucide-react-native';

import { usePremium } from '@/hooks/premium-store';
import { useLanguage } from '@/hooks/language-store';
import { glassColors } from '@/constants/colors';
import { ScaleTransition } from '@/components/PageTransition';



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

const PlanCard: React.FC<{
  plan: PremiumPlan;
  isSelected: boolean;
  onSelect: () => void;
  formatCurrency: (amount: number) => string;
  language: 'tr' | 'en';
}> = ({ plan, isSelected, onSelect, formatCurrency, language }) => {
  const planName = language === 'tr' ? plan.name : plan.nameEn;
  const features = language === 'tr' ? plan.features : plan.featuresEn;
  const badge = language === 'tr' ? plan.badge : plan.badgeEn;

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        isSelected && styles.selectedPlanCard,
        plan.popular && styles.popularPlanCard
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          plan.popular
            ? [glassColors.turkish.red + '20', glassColors.turkish.redLight + '10'] as const
            : isSelected
            ? [glassColors.gradients.turkish[0] + '15', glassColors.gradients.turkish[1] + '10'] as const
            : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const
        }
        style={styles.planCardGradient}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.popularBadgeText}>
              {badge || (language === 'tr' ? 'En Popüler' : 'Most Popular')}
            </Text>
          </View>
        )}

        {badge && !plan.popular && (
          <View style={styles.discountBadge}>
            <Gift size={12} color="#4CAF50" />
            <Text style={styles.discountBadgeText}>{badge}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{planName}</Text>
          <View style={styles.priceContainer}>
            {plan.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatCurrency(plan.originalPrice)}
              </Text>
            )}
            <Text style={styles.planPrice}>
              {formatCurrency(plan.price)}
            </Text>
            <Text style={styles.planDuration}>
              /{language === 'tr' ? (plan.duration === 'monthly' ? 'ay' : 'yıl') : (plan.duration === 'monthly' ? 'month' : 'year')}
            </Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check size={16} color="#4CAF50" strokeWidth={2.5} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Sparkles size={16} color={glassColors.turkish.red} fill={glassColors.turkish.red} />
            <Text style={styles.selectedText}>
              {language === 'tr' ? 'Seçildi' : 'Selected'}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function PremiumSubscriptionScreen() {
  const { 
    plans, 
    subscribeToPlan, 
    isLoading, 
    isPremium, 
    currentPlan,
    hasActiveTrial,
    trialDaysLeft,
    startFreeTrial 
  } = usePremium();
  const { language, formatCurrency } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[1]?.id || '');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Lütfen bir plan seçin' : 'Please select a plan'
      );
      return;
    }

    try {
      setIsSubscribing(true);
      await subscribeToPlan(selectedPlanId);
      
      Alert.alert(
        language === 'tr' ? 'Başarılı!' : 'Success!',
        language === 'tr' 
          ? 'Premium üyeliğiniz başarıyla aktifleştirildi!' 
          : 'Your premium membership has been activated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' 
          ? 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.' 
          : 'Payment failed. Please try again.'
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setIsSubscribing(true);
      await startFreeTrial();
      
      Alert.alert(
        language === 'tr' ? 'Deneme Başladı!' : 'Trial Started!',
        language === 'tr' 
          ? '7 günlük ücretsiz deneme süreniz başladı!' 
          : 'Your 7-day free trial has started!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' 
          ? 'Deneme başlatılamadı. Lütfen tekrar deneyin.' 
          : 'Could not start trial. Please try again.'
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[glassColors.gradients.turkish[0], glassColors.gradients.turkish[1], glassColors.gradients.turkish[2]]}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>
              {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <ScaleTransition duration={350}>
      <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: language === 'tr' ? 'Premium Üyelik' : 'Premium Membership',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '700',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <LinearGradient
        colors={[glassColors.gradients.turkish[0], glassColors.gradients.turkish[1], glassColors.gradients.turkish[2]]}
        style={styles.background}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.crownContainer}>
              <Crown size={48} color="#FFD700" fill="#FFD700" />
              <Sparkles size={24} color="#FFD700" fill="#FFD700" style={styles.sparkle1} />
              <Sparkles size={16} color="#FFD700" fill="#FFD700" style={styles.sparkle2} />
            </View>
            
            <Text style={styles.title}>
              {language === 'tr' ? 'Premium Üyelik' : 'Premium Membership'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'tr' 
                ? 'Evcil dostlarınız için en iyi deneyimi yaşayın' 
                : 'Experience the best for your beloved pets'}
            </Text>

            {isPremium && (
              <View style={styles.currentStatusCard}>
                <Shield size={20} color="#4CAF50" />
                <Text style={styles.currentStatusText}>
                  {hasActiveTrial 
                    ? (language === 'tr' 
                        ? `Deneme süresi: ${trialDaysLeft} gün kaldı` 
                        : `Trial: ${trialDaysLeft} days left`)
                    : (language === 'tr' 
                        ? `Aktif plan: ${currentPlan?.name}` 
                        : `Active plan: ${currentPlan?.nameEn}`)}
                </Text>
              </View>
            )}
          </View>

          {/* Premium Features Highlight */}
          <View style={styles.featuresHighlight}>
            <Text style={styles.featuresTitle}>
              {language === 'tr' ? 'Premium Özellikler' : 'Premium Features'}
            </Text>
            <View style={styles.highlightGrid}>
              <View style={styles.highlightItem}>
                <Zap size={24} color="#FFD700" />
                <Text style={styles.highlightText}>
                  {language === 'tr' ? 'AI Tanıma' : 'AI Recognition'}
                </Text>
              </View>
              <View style={styles.highlightItem}>
                <Shield size={24} color="#4CAF50" />
                <Text style={styles.highlightText}>
                  {language === 'tr' ? '7/24 Destek' : '24/7 Support'}
                </Text>
              </View>
              <View style={styles.highlightItem}>
                <Star size={24} color="#FF6B6B" />
                <Text style={styles.highlightText}>
                  {language === 'tr' ? 'Öncelik' : 'Priority'}
                </Text>
              </View>
            </View>
          </View>

          {/* Plans */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>
              {language === 'tr' ? 'Planları Seçin' : 'Choose Your Plan'}
            </Text>
            
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() => setSelectedPlanId(plan.id)}
                formatCurrency={formatCurrency}
                language={language}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {!isPremium && !hasActiveTrial && (
              <TouchableOpacity
                style={styles.trialButton}
                onPress={handleStartTrial}
                disabled={isSubscribing}
              >
                <Gift size={20} color="#4CAF50" />
                <Text style={styles.trialButtonText}>
                  {language === 'tr' ? '7 Gün Ücretsiz Dene' : 'Try 7 Days Free'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                (isSubscribing || !selectedPlanId) && styles.disabledButton
              ]}
              onPress={handleSubscribe}
              disabled={isSubscribing || !selectedPlanId}
            >
              {isSubscribing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Crown size={20} color="#FFFFFF" />
                  <Text style={styles.subscribeButtonText}>
                    {isPremium 
                      ? (language === 'tr' ? 'Planı Değiştir' : 'Change Plan')
                      : (language === 'tr' ? 'Premium Ol' : 'Go Premium')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            {language === 'tr' 
              ? 'Abonelik otomatik olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.' 
              : 'Subscription automatically renews. You can cancel anytime.'}
          </Text>
        </ScrollView>
      </LinearGradient>
      </SafeAreaView>
    </ScaleTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  crownContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkle1: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkle2: {
    position: 'absolute',
    bottom: -4,
    left: -8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  currentStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  currentStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresHighlight: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  highlightGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  highlightItem: {
    alignItems: 'center',
  },
  highlightText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: 32,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedPlanCard: {
    borderColor: glassColors.turkish.red,
    shadowColor: glassColors.turkish.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  popularPlanCard: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planCardGradient: {
    padding: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planDuration: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(227,10,23,0.2)',
    paddingVertical: 8,
    borderRadius: 12,
  },
  selectedText: {
    color: glassColors.turkish.red,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  actionContainer: {
    marginBottom: 24,
  },
  trialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76,175,80,0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  trialButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: glassColors.turkish.red,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: glassColors.turkish.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  termsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});