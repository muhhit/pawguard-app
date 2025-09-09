import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings, 
  TestTube, 
  Zap, 
  Award, 
  Calendar,
  Crown,
  BarChart3,
  AlertTriangle
} from 'lucide-react-native';
import { useNotifications } from '@/hooks/notification-store';
import { useGamification } from '@/hooks/gamification-store';
import GlassContainer from '@/components/GlassContainer';
import NotificationBell from '@/components/NotificationBell';


const NotificationDemo: React.FC = () => {
  const {
    settings,
    hasPermission,
    requestPermissions,
    addInAppNotification,
    sendDailyChallengeReminder,
    sendWeeklyDigest,
    inAppNotifications,
    unreadCount,
    snoozedUntil,
    snoozeNotifications,
    unsnoozeNotifications,
  } = useNotifications();

  const { userStats, currentTier } = useGamification();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    const granted = await requestPermissions();
    setIsLoading(false);
    
    if (granted) {
      Alert.alert('Başarılı', 'Bildirim izinleri verildi!');
    } else {
      Alert.alert('Hata', 'Bildirim izinleri reddedildi. Lütfen ayarlardan etkinleştirin.');
    }
  };

  const sendTestNotification = (type: string) => {
    const notifications = {
      nearby_pet: {
        type: 'nearby_pet' as const,
        title: '🐾 Yakında Kayıp Hayvan!',
        body: 'Boncuk (Kedi) 500m mesafede görüldü',
        data: { petId: 'test-pet-1', distance: '0.5' },
        read: false,
        priority: 'high' as const,
        category: 'Kayıp Hayvanlar',
        actionable: true,
        actions: [
          { id: 'view', title: 'Görüntüle', action: 'view_pet' },
          { id: 'directions', title: 'Yol Tarifi', action: 'get_directions' }
        ]
      },
      achievement: {
        type: 'achievement' as const,
        title: '🏆 Yeni Başarı Kazandın!',
        body: '\"İlk Adım\" rozetini kazandın! Avatar çerçevesi + 50 XP',
        data: { achievementId: 'first_report' },
        read: false,
        priority: 'normal' as const,
        category: 'Başarılar',
        actionable: true,
        actions: [
          { id: 'view', title: 'Görüntüle', action: 'view_achievement' }
        ]
      },
      tier_upgrade: {
        type: 'tier_upgrade' as const,
        title: '👑 Seviye Atladın!',
        body: 'Tebrikler! Artık \"Hayvan Dostu\" seviyesindesin!',
        data: { tierId: 'hayvan_dostu' },
        read: false,
        priority: 'high' as const,
        category: 'Seviye Atlama',
        actionable: true,
        actions: [
          { id: 'view', title: 'Detayları Gör', action: 'view_tier' }
        ]
      },
      emergency: {
        type: 'emergency' as const,
        title: '🚨 ACİL DURUM - Kayıp Hayvan!',
        body: 'Karamel (Köpek) kritik tehlikede! Acil yardım gerekiyor - Ödül: 500₺',
        data: { petId: 'emergency-pet-1', urgency: 'critical', heroPoints: 500 },
        read: false,
        priority: 'critical' as const,
        category: 'Acil Durumlar',
        actionable: true,
        actions: [
          { id: 'help', title: 'Yardım Et', action: 'emergency_help' },
          { id: 'share', title: 'Paylaş', action: 'share_emergency' }
        ]
      },
      challenge_reminder: {
        type: 'challenge_reminder' as const,
        title: '📅 Günlük Görevlerin Seni Bekliyor!',
        body: '3 görev tamamlanmayı bekliyor. Hadi başlayalım!',
        data: { challengeCount: 3 },
        read: false,
        priority: 'low' as const,
        category: 'Günlük Görevler',
        actionable: true,
        actions: [
          { id: 'view', title: 'Görevleri Gör', action: 'view_challenges' }
        ]
      }
    };

    const notification = notifications[type as keyof typeof notifications];
    if (notification) {
      addInAppNotification(notification);
      Alert.alert('Test Bildirimi', 'Bildirim gönderildi!');
    }
  };

  const handleSnoozeTest = () => {
    Alert.alert(
      'Bildirimleri Ertele',
      'Test için ne kadar süreyle ertelemek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: '1 dakika', onPress: () => snoozeNotifications(1) },
        { text: '5 dakika', onPress: () => snoozeNotifications(5) },
        { text: '15 dakika', onPress: () => snoozeNotifications(15) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TestTube size={24} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Bildirim Sistemi</Text>
        </View>
        <NotificationBell />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>İzin Durumu</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Bildirim İzni:</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: hasPermission ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.statusBadgeText}>
                {hasPermission ? 'Verildi' : 'Verilmedi'}
              </Text>
            </View>
          </View>
          {!hasPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermissions}
              disabled={isLoading}
            >
              <Text style={styles.permissionButtonText}>
                {isLoading ? 'İsteniyor...' : 'İzin İste'}
              </Text>
            </TouchableOpacity>
          )}
        </GlassContainer>

        {/* Current Stats */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Mevcut Durum</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Okunmamış</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{inAppNotifications.length}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats?.petsHelped || 0}</Text>
              <Text style={styles.statLabel}>Yardım Edilen</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTier?.name || 'Yok'}</Text>
              <Text style={styles.statLabel}>Seviye</Text>
            </View>
          </View>
          {snoozedUntil && new Date(snoozedUntil) > new Date() && (
            <View style={styles.snoozeInfo}>
              <Text style={styles.snoozeText}>
                🔕 Bildirimler {new Date(snoozedUntil).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} kadar susturuldu
              </Text>
              <TouchableOpacity onPress={unsnoozeNotifications}>
                <Text style={styles.unsnoozeText}>Aç</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassContainer>

        {/* Test Notifications */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Test Bildirimleri</Text>
          </View>
          <View style={styles.testGrid}>
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}
              onPress={() => sendTestNotification('nearby_pet')}
            >
              <Text style={styles.testButtonEmoji}>🐾</Text>
              <Text style={styles.testButtonText}>Yakındaki Hayvan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}
              onPress={() => sendTestNotification('achievement')}
            >
              <Award size={20} color="#10B981" />
              <Text style={styles.testButtonText}>Başarı</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}
              onPress={() => sendTestNotification('tier_upgrade')}
            >
              <Crown size={20} color="#8B5CF6" />
              <Text style={styles.testButtonText}>Seviye Atlama</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
              onPress={() => sendTestNotification('emergency')}
            >
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={styles.testButtonText}>Acil Durum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}
              onPress={() => sendTestNotification('challenge_reminder')}
            >
              <Calendar size={20} color="#F59E0B" />
              <Text style={styles.testButtonText}>Görev Hatırlatma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: 'rgba(107, 114, 128, 0.2)' }]}
              onPress={handleSnoozeTest}
            >
              <Text style={styles.testButtonEmoji}>🔕</Text>
              <Text style={styles.testButtonText}>Ertele</Text>
            </TouchableOpacity>
          </View>
        </GlassContainer>

        {/* System Functions */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Sistem Fonksiyonları</Text>
          </View>
          <TouchableOpacity
            style={styles.systemButton}
            onPress={sendDailyChallengeReminder}
          >
            <Calendar size={20} color="#60A5FA" />
            <Text style={styles.systemButtonText}>Günlük Görev Hatırlatması Gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.systemButton}
            onPress={sendWeeklyDigest}
          >
            <BarChart3 size={20} color="#10B981" />
            <Text style={styles.systemButtonText}>Haftalık Özet Gönder</Text>
          </TouchableOpacity>
        </GlassContainer>

        {/* Settings Overview */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Ayarlar Özeti</Text>
          </View>
          <View style={styles.settingsGrid}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Yakındaki Hayvanlar</Text>
              <View style={[
                styles.settingStatus,
                { backgroundColor: settings.nearbyPets ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.settingStatusText}>
                  {settings.nearbyPets ? 'Açık' : 'Kapalı'}
                </Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Başarılar</Text>
              <View style={[
                styles.settingStatus,
                { backgroundColor: settings.achievements ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.settingStatusText}>
                  {settings.achievements ? 'Açık' : 'Kapalı'}
                </Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Günlük Görevler</Text>
              <View style={[
                styles.settingStatus,
                { backgroundColor: settings.dailyChallenges ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.settingStatusText}>
                  {settings.dailyChallenges ? 'Açık' : 'Kapalı'}
                </Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Acil Durumlar</Text>
              <View style={[
                styles.settingStatus,
                { backgroundColor: settings.emergencyBroadcasts ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.settingStatusText}>
                  {settings.emergencyBroadcasts ? 'Açık' : 'Kapalı'}
                </Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Ses</Text>
              <View style={[
                styles.settingStatus,
                { backgroundColor: settings.soundEnabled ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.settingStatusText}>
                  {settings.soundEnabled ? 'Açık' : 'Kapalı'}
                </Text>
              </View>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sessiz Saatler</Text>
              <View style={[
                styles.settingStatus,
                { backgroundColor: settings.quietHours.enabled ? '#10B981' : '#6B7280' }
              ]}>
                <Text style={styles.settingStatusText}>
                  {settings.quietHours.enabled ? `${settings.quietHours.start}-${settings.quietHours.end}` : 'Kapalı'}
                </Text>
              </View>
            </View>
          </View>
        </GlassContainer>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  snoozeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  snoozeText: {
    color: '#F59E0B',
    fontSize: 14,
    flex: 1,
  },
  unsnoozeText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  testButtonEmoji: {
    fontSize: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  systemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  systemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsGrid: {
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  settingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settingStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default NotificationDemo;