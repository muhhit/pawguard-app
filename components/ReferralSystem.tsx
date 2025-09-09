import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  Trophy, 
  Target, 
  TrendingUp,
  X,
  Check,
  Crown,
  Tag
} from 'lucide-react-native';
import { useReferrals } from '@/hooks/referral-store';
import * as Clipboard from 'expo-clipboard';

interface ReferralSystemProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReferralSystem({ visible, onClose }: ReferralSystemProps) {
  const {
    referralCode,
    metrics,
    referrals,
    isLoading,
    trackReferral,
    shareReferralCode,
    getReferralRewards,
    getExpectedMetrics
  } = useReferrals();

  const [inputCode, setInputCode] = useState<string>('');
  const [showEnterCode, setShowEnterCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const rewards = getReferralRewards();
  const expectedMetrics = getExpectedMetrics();

  const handleCopyCode = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
      Alert.alert('Kopyalandı!', 'Davet kodu panoya kopyalandı');
    } catch (error) {
      console.error('Error copying code:', error);
      Alert.alert('Hata', 'Davet kodu kopyalanamadı');
    }
  }, [referralCode]);

  const handleShare = useCallback(async () => {
    try {
      await shareReferralCode();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [shareReferralCode]);

  const handleSubmitCode = useCallback(async () => {
    if (!inputCode.trim()) {
      Alert.alert('Hata', 'Lütfen bir davet kodu girin');
      return;
    }

    try {
      setIsSubmitting(true);
      await trackReferral(inputCode.trim().toUpperCase());
      
      Alert.alert(
        'Başarılı! 🎉',
        `Davet kodu uygulandı! Profilini tamamladığında ${rewards.referee.description} alacaksın.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setInputCode('');
              setShowEnterCode(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Davet kodu uygulanamadı');
    } finally {
      setIsSubmitting(false);
    }
  }, [inputCode, trackReferral, rewards.referee.description]);

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Davet Programı</Text>
            <Text style={styles.subtitle}>Arkadaşlarını davet ederek ödül kazan</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Your Referral Code */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Gift color="#FF6B6B" size={20} />
              <Text style={styles.sectionTitle}>Senin Davet Kodun</Text>
            </View>
            
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Bu kodu arkadaşlarınla paylaş:</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.code}>{referralCode}</Text>
                <View style={styles.codeActions}>
                  <TouchableOpacity style={styles.codeButton} onPress={handleCopyCode}>
                    <Copy color="#64748B" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.codeButton} onPress={handleShare}>
                    <Share2 color="#64748B" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Crown color="#F59E0B" size={20} />
              <Text style={styles.sectionTitle}>Ödüller</Text>
            </View>
            
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardIcon}>{rewards.referrer.icon}</Text>
                <Text style={styles.rewardTitle}>Sen Kazanırsın</Text>
                <Text style={styles.rewardDescription}>{rewards.referrer.description}</Text>
              </View>
              
              <View style={styles.rewardCard}>
                <Text style={styles.rewardIcon}>{rewards.referee.icon}</Text>
                <Text style={styles.rewardTitle}>Arkadaşın Kazanır</Text>
                <Text style={styles.rewardDescription}>{rewards.referee.description}</Text>
              </View>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>Senin İstatistiklerin</Text>
            </View>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{metrics.totalReferrals}</Text>
                <Text style={styles.metricLabel}>Toplam Davet</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{metrics.successfulReferrals}</Text>
                <Text style={styles.metricLabel}>Başarılı</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{formatPercentage(metrics.conversionRate)}</Text>
                <Text style={styles.metricLabel}>Dönüşüm Oranı</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>{metrics.totalRewardsEarned}</Text>
                <Text style={styles.metricLabel}>Kazanılan Ödül</Text>
              </View>
            </View>
          </View>

          {/* Recent Referrals */}
          {referrals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users color="#6366F1" size={20} />
                <Text style={styles.sectionTitle}>Son Davetler</Text>
              </View>
              
              <View style={styles.referralsList}>
                {referrals.slice(0, 5).map((referral) => (
                  <View key={referral.id} style={styles.referralItem}>
                    <View style={styles.referralInfo}>
                      <Text style={styles.referralDate}>
                        {new Date(referral.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.referralReward}>
                        {referral.referrer_reward_value} {referral.referrer_reward_type.replace('_', ' ')}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      referral.reward_status === 'fulfilled' && styles.statusFulfilled,
                      referral.reward_status === 'pending' && styles.statusPending
                    ]}>
                      {referral.reward_status === 'fulfilled' && <Check color="#10B981" size={12} />}
                      <Text style={[
                        styles.statusText,
                        referral.reward_status === 'fulfilled' && styles.statusTextFulfilled
                      ]}>
                        {referral.reward_status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Expected Performance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target color="#8B5CF6" size={20} />
              <Text style={styles.sectionTitle}>Program Performansı</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <Text style={styles.performanceTitle}>Beklenen Metrikler</Text>
              <View style={styles.performanceMetrics}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Hedef K-Faktörü</Text>
                  <Text style={styles.performanceValue}>{expectedMetrics.kFactor}</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Davet Oranı</Text>
                  <Text style={styles.performanceValue}>{formatPercentage(expectedMetrics.referralRate)}</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Dönüşüm Oranı</Text>
                  <Text style={styles.performanceValue}>{formatPercentage(expectedMetrics.conversionRate)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Enter Referral Code */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.enterCodeButton}
              onPress={() => setShowEnterCode(true)}
            >
              <Tag color="#FFFFFF" size={20} />
              <Text style={styles.enterCodeText}>Davet kodun var mı?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Enter Code Modal */}
        <Modal
          visible={showEnterCode}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Davet Kodu Gir</Text>
              <Text style={styles.modalSubtitle}>
                Profilini tamamladığında {rewards.referee.description} kazan
              </Text>
              
              <TextInput
                style={styles.codeInput}
                value={inputCode}
                onChangeText={setInputCode}
                placeholder="Kodu gir (örn: PET12345678)"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={11}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowEnterCode(false);
                    setInputCode('');
                  }}
                >
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitButtonDisabled]}
                  onPress={handleSubmitCode}
                  disabled={isSubmitting}
                >
                  <Text style={styles.modalSubmitText}>
                    {isSubmitting ? 'Uygulanıyor...' : 'Kodu Uygula'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  referralsList: {
    gap: 12,
  },
  referralItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referralInfo: {
    flex: 1,
  },
  referralDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  referralReward: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  statusFulfilled: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  statusTextFulfilled: {
    color: '#10B981',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  performanceMetrics: {
    gap: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  enterCodeButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  enterCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  codeInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});