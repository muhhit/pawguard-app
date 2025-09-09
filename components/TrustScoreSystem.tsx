import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Phone, 
  Camera,
  Award,
  Users,
  TrendingUp,
  Flag,
  Eye
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard } from '@/components/GlassComponents';

interface TrustScoreProps {
  userId: string;
  currentScore: number;
  onScoreUpdate: (newScore: number) => void;
}

interface TrustAction {
  id: string;
  name: string;
  description: string;
  points: number;
  completed: boolean;
  icon: any;
  color: string;
  verificationRequired?: boolean;
  canRepeat?: boolean;
  maxRepeats?: number;
  currentRepeats?: number;
}

interface SuspiciousActivity {
  id: string;
  type: 'fake_claim' | 'multiple_accounts' | 'spam_reports' | 'location_spoofing';
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  autoDetected: boolean;
}

interface UserReport {
  id: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  evidence?: string[];
  timestamp: Date;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
}

export default function TrustScoreSystem({
  userId,
  currentScore,
  onScoreUpdate,
}: TrustScoreProps) {
  const [trustActions, setTrustActions] = useState<TrustAction[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    // Initialize trust actions
    const actions: TrustAction[] = [
      {
        id: 'phone_verification',
        name: 'Telefon Doğrulama',
        description: 'SMS ile telefon numaranızı doğrulayın',
        points: 15,
        completed: currentScore >= 15,
        icon: Phone,
        color: '#10B981',
        verificationRequired: true,
      },
      {
        id: 'id_document',
        name: 'Kimlik Belgesi',
        description: 'TC Kimlik veya Pasaport ile kimlik doğrulama',
        points: 25,
        completed: currentScore >= 40,
        icon: Shield,
        color: '#3B82F6',
        verificationRequired: true,
      },
      {
        id: 'successful_rescue',
        name: 'Başarılı Kurtarma',
        description: 'Kayıp hayvan kurtarma işlemi tamamlama',
        points: 20,
        completed: false,
        icon: Award,
        color: '#F59E0B',
        canRepeat: true,
        maxRepeats: 10,
        currentRepeats: 0,
      },
      {
        id: 'community_endorsement',
        name: 'Topluluk Onayı',
        description: 'Diğer güvenilir kullanıcılardan onay alma',
        points: 10,
        completed: false,
        icon: Users,
        color: '#8B5CF6',
        canRepeat: true,
        maxRepeats: 5,
        currentRepeats: 0,
      },
      {
        id: 'feeding_streak',
        name: 'Beslenme Serisi',
        description: '7 gün üst üste sokak hayvanı besleme',
        points: 15,
        completed: false,
        icon: TrendingUp,
        color: '#EF4444',
        canRepeat: true,
        maxRepeats: 4,
        currentRepeats: 0,
      },
    ];

    setTrustActions(actions);

    // Simulate suspicious activity detection
    const suspiciousActivities: SuspiciousActivity[] = [
      {
        id: '1',
        type: 'fake_claim',
        description: 'Aynı pet için birden fazla sahiplik iddiası',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'high',
        autoDetected: true,
      },
      {
        id: '2',
        type: 'location_spoofing',
        description: 'Konumda anormal değişiklikler tespit edildi',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        severity: 'medium',
        autoDetected: true,
      },
    ];

    // Simulate some suspicious activities for demo
    setSuspiciousActivities(suspiciousActivities.slice(0, Math.random() > 0.7 ? 2 : 0));
  }, [currentScore]);

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'VERIFIED', color: '#10B981', text: 'Doğrulanmış' };
    if (score >= 70) return { level: 'HIGH', color: '#3B82F6', text: 'Yüksek Güven' };
    if (score >= 40) return { level: 'MEDIUM', color: '#F59E0B', text: 'Orta Güven' };
    if (score >= 20) return { level: 'LOW', color: '#EF4444', text: 'Düşük Güven' };
    return { level: 'UNVERIFIED', color: '#64748B', text: 'Doğrulanmamış' };
  };

  const handleTrustAction = async (action: TrustAction) => {
    if (action.completed && !action.canRepeat) {
      Alert.alert('Tamamlandı', 'Bu eylem zaten tamamlanmış.');
      return;
    }

    if (action.canRepeat && action.currentRepeats! >= action.maxRepeats!) {
      Alert.alert('Limit', `Bu eylem için maksimum ${action.maxRepeats} sınırına ulaştınız.`);
      return;
    }

    switch (action.id) {
      case 'phone_verification':
        handlePhoneVerification();
        break;
      case 'id_document':
        handleIdVerification();
        break;
      case 'successful_rescue':
        handleSuccessfulRescue();
        break;
      case 'community_endorsement':
        handleCommunityEndorsement();
        break;
      case 'feeding_streak':
        handleFeedingStreak();
        break;
    }
  };

  const handlePhoneVerification = () => {
    Alert.alert(
      '📱 Telefon Doğrulama',
      'SMS ile doğrulama kodu gönderilecek. Devam edilsin mi?',
      [
        { text: 'İptal' },
        {
          text: 'Gönder',
          onPress: () => {
            setTimeout(() => {
              Alert.alert(
                '✅ Telefon Doğrulandı!',
                '+15 güven skoru kazandınız',
                [{ text: 'Harika!', onPress: () => updateTrustScore('phone_verification', 15) }]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleIdVerification = () => {
    Alert.alert(
      '🆔 Kimlik Doğrulama',
      'TC Kimlik veya Pasaport fotoğrafınızı yüklemeniz gerekiyor. Bu işlem 24 saat içinde kontrol edilecek.',
      [
        { text: 'İptal' },
        {
          text: 'Yükle',
          onPress: () => {
            Alert.alert(
              '📄 Belge Yüklendi',
              'Kimlik belgeniz 24 saat içinde kontrol edilecek. Onaylandığında +25 güven skoru kazanacaksınız.',
              [{ text: 'Tamam' }]
            );
          },
        },
      ]
    );
  };

  const handleSuccessfulRescue = () => {
    Alert.alert(
      '🏆 Başarılı Kurtarma',
      'Kayıp hayvan kurtarma işleminiz onaylandığında +20 güven skoru kazanacaksınız.',
      [{ text: 'Anladım' }]
    );
  };

  const handleCommunityEndorsement = () => {
    Alert.alert(
      '👥 Topluluk Onayı',
      'Diğer güvenilir kullanıcılardan onay alın. Her onay +10 güven skoru kazandırır.',
      [{ text: 'Tamam' }]
    );
  };

  const handleFeedingStreak = () => {
    Alert.alert(
      '🔥 Beslenme Serisi',
      '7 gün üst üste sokak hayvanı besleme işlemi tamamlandığında +15 güven skoru kazanacaksınız.',
      [{ text: 'Anladım' }]
    );
  };

  const updateTrustScore = (actionId: string, points: number) => {
    const newScore = Math.min(currentScore + points, 100);
    onScoreUpdate(newScore);

    setTrustActions(prev => prev.map(action => 
      action.id === actionId 
        ? { 
            ...action, 
            completed: !action.canRepeat ? true : action.completed,
            currentRepeats: action.canRepeat ? (action.currentRepeats || 0) + 1 : action.currentRepeats
          }
        : action
    ));
  };

  const handleReportUser = (reportedUserId: string) => {
    setSelectedUser(reportedUserId);
    setShowReportModal(true);
  };

  const submitReport = (reason: string, description: string) => {
    Alert.alert(
      '🚨 Bildirim Gönderildi',
      'Şüpheli kullanıcı bildirimi incelemeye alındı. 24 saat içinde geri dönüş yapılacak.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            setShowReportModal(false);
            setSelectedUser(null);
          },
        },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  const trustLevel = getTrustLevel(currentScore);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trust Score Header */}
      <LiquidGlassCard style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Shield color={trustLevel.color} size={32} />
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>Güven Skorunuz</Text>
            <Text style={[styles.scoreValue, { color: trustLevel.color }]}>
              {currentScore}/100
            </Text>
            <Text style={styles.trustLevelText}>{trustLevel.text}</Text>
          </View>
        </View>

        <View style={styles.scoreProgress}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${currentScore}%`, backgroundColor: trustLevel.color }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {100 - currentScore} puan daha yüksek seviye için
          </Text>
        </View>

        {/* Trust Benefits */}
        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Bu seviyede yapabilecekleriniz:</Text>
          <View style={styles.benefitsList}>
            {currentScore >= 20 && (
              <View style={styles.benefit}>
                <CheckCircle color="#10B981" size={16} />
                <Text style={styles.benefitText}>Yakındaki kayıp hayvanları görme</Text>
              </View>
            )}
            {currentScore >= 40 && (
              <View style={styles.benefit}>
                <CheckCircle color="#10B981" size={16} />
                <Text style={styles.benefitText}>Pet sahiplik iddiasında bulunma</Text>
              </View>
            )}
            {currentScore >= 70 && (
              <View style={styles.benefit}>
                <CheckCircle color="#10B981" size={16} />
                <Text style={styles.benefitText}>Korumalı sokak hayvanlarını görme</Text>
              </View>
            )}
            {currentScore >= 90 && (
              <View style={styles.benefit}>
                <CheckCircle color="#10B981" size={16} />
                <Text style={styles.benefitText}>Tüm güvenlik özelliklerine erişim</Text>
              </View>
            )}
          </View>
        </View>
      </LiquidGlassCard>

      {/* Suspicious Activities Alert */}
      {suspiciousActivities.length > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.alertHeader}>
            <AlertTriangle color="#EF4444" size={20} />
            <Text style={styles.alertTitle}>Güvenlik Uyarıları</Text>
          </View>
          {suspiciousActivities.map((activity) => (
            <View key={activity.id} style={styles.activityAlert}>
              <View style={[
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(activity.severity) }
              ]} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>
                  {activity.timestamp.toLocaleString('tr-TR')}
                  {activity.autoDetected && ' • Otomatik tespit'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Trust Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Güven Skoru Artırma Yolları</Text>
        
        {trustActions.map((action) => {
          const IconComponent = action.icon;
          const isAvailable = !action.completed || (action.canRepeat && action.currentRepeats! < action.maxRepeats!);
          
          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                !isAvailable && styles.actionCardDisabled
              ]}
              onPress={() => isAvailable && handleTrustAction(action)}
              disabled={!isAvailable}
            >
              <View style={styles.actionHeader}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <IconComponent color={action.color} size={20} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionName}>{action.name}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                  {action.canRepeat && (
                    <Text style={styles.actionRepeats}>
                      {action.currentRepeats}/{action.maxRepeats} tamamlandı
                    </Text>
                  )}
                </View>
                <View style={styles.actionPoints}>
                  <Text style={[styles.pointsText, { color: action.color }]}>
                    +{action.points}
                  </Text>
                  {action.completed && !action.canRepeat && (
                    <CheckCircle color="#10B981" size={16} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Community Safety */}
      <View style={styles.safetySection}>
        <Text style={styles.sectionTitle}>🛡️ Topluluk Güvenliği</Text>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => handleReportUser('sample-user')}
        >
          <Flag color="#EF4444" size={20} />
          <Text style={styles.reportButtonText}>Şüpheli Kullanıcı Bildir</Text>
        </TouchableOpacity>

        <View style={styles.safetyTips}>
          <Text style={styles.tipsTitle}>Güvenlik İpuçları:</Text>
          <Text style={styles.tipsText}>
            • Sahiplik iddiaları fotoğraf ve video ile desteklenmelidir{'\n'}
            • Şüpheli davranışları hemen bildirin{'\n'}
            • Buluşmalarda kalabalık, güvenli yerler tercih edin{'\n'}
            • Kişisel bilgilerinizi paylaşmaktan kaçının
          </Text>
        </View>
      </View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.reportModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kullanıcı Bildir</Text>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.reportDescription}>
              Şüpheli kullanıcı aktivitesi bildirin. Tüm raporlar incelenir ve gerekli önlemler alınır.
            </Text>

            <View style={styles.reportReasons}>
              {[
                'Sahte sahiplik iddiası',
                'Çoklu hesap kullanımı',
                'Spam/Taciz',
                'Yanlış konum bilgisi',
                'Diğer'
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonButton}
                  onPress={() => submitReport(reason, 'User reported for: ' + reason)}
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scoreCard: {
    margin: 16,
    padding: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 16,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trustLevelText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  scoreProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  benefits: {},
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  benefitsList: {
    gap: 6,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#64748B',
  },
  alertSection: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  activityAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  severityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginTop: 4,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#7F1D1D',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#991B1B',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  actionRepeats: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionPoints: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  safetySection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  safetyTips: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#075985',
    lineHeight: 18,
  },
  reportModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reportDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  reportReasons: {
    gap: 12,
  },
  reasonButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
});