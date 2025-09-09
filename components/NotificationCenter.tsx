import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  X, 
  Filter, 
  MoreVertical, 
  CheckCheck, 
  Trash2,
  Clock,
  Settings,
  VolumeX
} from 'lucide-react-native';
import { useNotifications, InAppNotification, NotificationFilter } from '@/hooks/notification-store';
import GlassContainer from '@/components/GlassContainer';
import { router } from 'expo-router';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ visible, onClose }) => {
  const {
    unreadCount,
    snoozedUntil,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getFilteredNotifications,
    snoozeNotifications,
    unsnoozeNotifications,
    settings,
    updateSettings,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const filteredNotifications = useMemo(() => {
    return getFilteredNotifications(activeFilter);
  }, [getFilteredNotifications, activeFilter]);

  const handleNotificationPress = async (notification: InAppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Handle notification actions
    if (notification.data?.petId) {
      onClose();
      router.push({
        pathname: '/pet-details',
        params: { id: notification.data.petId }
      });
    } else if (notification.type === 'achievement' || notification.type === 'tier_upgrade') {
      onClose();
      router.push('/gamified-profile');
    } else if (notification.type === 'daily_challenge' || notification.type === 'challenge_reminder') {
      onClose();
      router.push('/(tabs)/community');
    }
  };

  const handleSnooze = (minutes: number) => {
    snoozeNotifications(minutes);
    Alert.alert(
      'Bildirimler Ertelendi',
      `Bildirimler ${minutes} dakika boyunca susturuldu.`,
      [{ text: 'Tamam' }]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Tüm Bildirimleri Temizle',
      'Tüm bildirimler kalıcı olarak silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive',
          onPress: clearAllNotifications
        }
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'nearby_pet': return '🐾';
      case 'achievement': return '🏆';
      case 'tier_upgrade': return '👑';
      case 'daily_challenge': return '📅';
      case 'challenge_reminder': return '⏰';
      case 'emergency': return '🚨';
      case 'weekly_digest': return '📊';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'normal': return '#3B82F6';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins}dk önce`;
    if (diffHours < 24) return `${diffHours}sa önce`;
    if (diffDays < 7) return `${diffDays}g önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <GlassContainer style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtreler</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterSectionTitle}>Bildirim Türü</Text>
            {['nearby_pet', 'achievement', 'daily_challenge', 'emergency', 'weekly_digest'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  activeFilter.type?.includes(type) && styles.filterOptionActive
                ]}
                onPress={() => {
                  const currentTypes = activeFilter.type || [];
                  const newTypes = currentTypes.includes(type)
                    ? currentTypes.filter(t => t !== type)
                    : [...currentTypes, type];
                  setActiveFilter({ ...activeFilter, type: newTypes.length > 0 ? newTypes : undefined });
                }}
              >
                <Text style={styles.filterOptionText}>
                  {getNotificationIcon(type)} {type === 'nearby_pet' ? 'Yakındaki Hayvanlar' :
                   type === 'achievement' ? 'Başarılar' :
                   type === 'daily_challenge' ? 'Günlük Görevler' :
                   type === 'emergency' ? 'Acil Durumlar' :
                   type === 'weekly_digest' ? 'Haftalık Özet' : type}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.filterSectionTitle}>Öncelik</Text>
            {['critical', 'high', 'normal', 'low'].map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterOption,
                  activeFilter.priority?.includes(priority) && styles.filterOptionActive
                ]}
                onPress={() => {
                  const currentPriorities = activeFilter.priority || [];
                  const newPriorities = currentPriorities.includes(priority)
                    ? currentPriorities.filter(p => p !== priority)
                    : [...currentPriorities, priority];
                  setActiveFilter({ ...activeFilter, priority: newPriorities.length > 0 ? newPriorities : undefined });
                }}
              >
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                <Text style={styles.filterOptionText}>
                  {priority === 'critical' ? 'Kritik' :
                   priority === 'high' ? 'Yüksek' :
                   priority === 'normal' ? 'Normal' :
                   priority === 'low' ? 'Düşük' : priority}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.filterSectionTitle}>Durum</Text>
            <TouchableOpacity
              style={[
                styles.filterOption,
                activeFilter.read === false && styles.filterOptionActive
              ]}
              onPress={() => {
                setActiveFilter({ 
                  ...activeFilter, 
                  read: activeFilter.read === false ? undefined : false 
                });
              }}
            >
              <Text style={styles.filterOptionText}>Sadece Okunmamış</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => setActiveFilter({})}
            >
              <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
            </TouchableOpacity>
          </ScrollView>
        </GlassContainer>
      </View>
    </Modal>
  );

  const SettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <GlassContainer style={styles.settingsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Yakındaki Hayvanlar</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.nearbyPets && styles.toggleActive]}
                onPress={() => updateSettings({ nearbyPets: !settings.nearbyPets })}
              >
                <View style={[styles.toggleThumb, settings.nearbyPets && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Başarılar</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.achievements && styles.toggleActive]}
                onPress={() => updateSettings({ achievements: !settings.achievements })}
              >
                <View style={[styles.toggleThumb, settings.achievements && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Günlük Görevler</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.dailyChallenges && styles.toggleActive]}
                onPress={() => updateSettings({ dailyChallenges: !settings.dailyChallenges })}
              >
                <View style={[styles.toggleThumb, settings.dailyChallenges && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Acil Durumlar</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.emergencyBroadcasts && styles.toggleActive]}
                onPress={() => updateSettings({ emergencyBroadcasts: !settings.emergencyBroadcasts })}
              >
                <View style={[styles.toggleThumb, settings.emergencyBroadcasts && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Haftalık Özet</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.weeklyDigest && styles.toggleActive]}
                onPress={() => updateSettings({ weeklyDigest: !settings.weeklyDigest })}
              >
                <View style={[styles.toggleThumb, settings.weeklyDigest && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Ses</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.soundEnabled && styles.toggleActive]}
                onPress={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              >
                <View style={[styles.toggleThumb, settings.soundEnabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sessiz Saatler</Text>
              <TouchableOpacity
                style={[styles.toggle, settings.quietHours.enabled && styles.toggleActive]}
                onPress={() => updateSettings({ 
                  quietHours: { ...settings.quietHours, enabled: !settings.quietHours.enabled }
                })}
              >
                <View style={[styles.toggleThumb, settings.quietHours.enabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>

            {settings.quietHours.enabled && (
              <View style={styles.quietHoursInfo}>
                <Text style={styles.quietHoursText}>
                  {settings.quietHours.start} - {settings.quietHours.end}
                </Text>
              </View>
            )}
          </ScrollView>
        </GlassContainer>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Bildirimler</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(true)}
            >
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
            >
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {snoozedUntil && new Date(snoozedUntil) > new Date() && (
          <GlassContainer style={styles.snoozeBar}>
            <VolumeX size={16} color="#F59E0B" />
            <Text style={styles.snoozeText}>
              Bildirimler {new Date(snoozedUntil).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} kadar susturuldu
            </Text>
            <TouchableOpacity onPress={unsnoozeNotifications}>
              <Text style={styles.unsnoozeButton}>Aç</Text>
            </TouchableOpacity>
          </GlassContainer>
        )}

        <View style={styles.actionBar}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={markAllAsRead}
            >
              <CheckCheck size={16} color="#10B981" />
              <Text style={styles.actionButtonText}>Tümünü Okundu İşaretle</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Bildirimleri Ertele',
                'Ne kadar süreyle ertelemek istiyorsunuz?',
                [
                  { text: 'İptal', style: 'cancel' },
                  { text: '15 dakika', onPress: () => handleSnooze(15) },
                  { text: '1 saat', onPress: () => handleSnooze(60) },
                  { text: '4 saat', onPress: () => handleSnooze(240) },
                ]
              );
            }}
          >
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Ertele</Text>
          </TouchableOpacity>

          {filteredNotifications.length > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearAll}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.actionButtonText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.notificationsList}>
          {filteredNotifications.length === 0 ? (
            <GlassContainer style={styles.emptyState}>
              <Bell size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>Bildirim Yok</Text>
              <Text style={styles.emptyStateText}>
                {Object.keys(activeFilter).length > 0 
                  ? 'Seçilen filtrelere uygun bildirim bulunamadı.'
                  : 'Henüz hiç bildiriminiz yok.'
                }
              </Text>
            </GlassContainer>
          ) : (
            filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationItemUnread
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <GlassContainer style={styles.notificationCard}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationIcon}>
                      <Text style={styles.notificationEmoji}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                    </View>
                    <View style={styles.notificationMeta}>
                      <Text style={styles.notificationCategory}>
                        {notification.category}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.notificationActions}>
                      <View style={[
                        styles.priorityIndicator,
                        { backgroundColor: getPriorityColor(notification.priority) }
                      ]} />
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          Alert.alert(
                            'Bildirim İşlemleri',
                            notification.title,
                            [
                              { text: 'İptal', style: 'cancel' },
                              !notification.read && {
                                text: 'Okundu İşaretle',
                                onPress: () => markAsRead(notification.id)
                              },
                              {
                                text: 'Sil',
                                style: 'destructive',
                                onPress: () => deleteNotification(notification.id)
                              }
                            ].filter(Boolean) as any
                          );
                        }}
                      >
                        <MoreVertical size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationBody}>
                    {notification.body}
                  </Text>

                  {notification.actionable && notification.actions && (
                    <View style={styles.notificationActionsBar}>
                      {notification.actions.map((action) => (
                        <TouchableOpacity
                          key={action.id}
                          style={styles.notificationActionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleNotificationPress(notification);
                          }}
                        >
                          <Text style={styles.notificationActionText}>
                            {action.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </GlassContainer>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <FilterModal />
        <SettingsModal />
      </SafeAreaView>
    </Modal>
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
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  snoozeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 12,
  },
  snoozeText: {
    flex: 1,
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
  },
  unsnoozeButton: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  notificationItem: {
    marginBottom: 12,
  },
  notificationItemUnread: {
    // Add visual indicator for unread notifications
  },
  notificationCard: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 16,
  },
  notificationMeta: {
    flex: 1,
  },
  notificationCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  notificationActionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  notificationActionText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    margin: 16,
    maxHeight: '80%',
  },
  settingsModal: {
    margin: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterContent: {
    padding: 20,
  },
  settingsContent: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  filterOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  clearFiltersButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  clearFiltersText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  quietHoursInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  quietHoursText: {
    color: '#60A5FA',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NotificationCenter;