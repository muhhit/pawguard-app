import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from '@/hooks/location-store';
import { usePets, Pet } from '@/hooks/pet-store';
import { useGamification } from '@/hooks/gamification-store';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export interface NotificationSettings {
  enabled: boolean;
  radius: number; // in kilometers
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  nearbyPets: boolean;
  achievements: boolean;
  dailyChallenges: boolean;
  emergencyBroadcasts: boolean;
  weeklyDigest: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

interface EmergencyBroadcastResult {
  recipientCount: number;
  success: boolean;
  error?: string;
}

export interface InAppNotification {
  id: string;
  type: 'nearby_pet' | 'achievement' | 'daily_challenge' | 'emergency' | 'weekly_digest' | 'tier_upgrade' | 'challenge_reminder';
  title: string;
  body: string;
  data?: any;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: string;
  actionable: boolean;
  actions?: {
    id: string;
    title: string;
    action: string;
  }[];
}

export interface NotificationFilter {
  type?: string[];
  priority?: string[];
  read?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface NotificationStore {
  settings: NotificationSettings;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  inAppNotifications: InAppNotification[];
  unreadCount: number;
  snoozedUntil: string | null;
  requestPermissions: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  sendNearbyPetAlert: (pet: Pet, distance: number) => Promise<void>;
  sendAchievementNotification: (achievement: any) => Promise<void>;
  sendDailyChallengeReminder: () => Promise<void>;
  sendTierUpgradeNotification: (tier: any) => Promise<void>;
  sendWeeklyDigest: () => Promise<void>;
  setupNotificationHandlers: () => void;
  checkNearbyPets: () => Promise<void>;
  sendEmergencyBroadcast: (petId: string, location: { lat: number; lng: number }) => Promise<EmergencyBroadcastResult>;
  sendBulkNotifications: (userIds: string[], notification: { title: string; body: string; data?: any }) => Promise<void>;
  addInAppNotification: (notification: Omit<InAppNotification, 'id' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getFilteredNotifications: (filter: NotificationFilter) => InAppNotification[];
  snoozeNotifications: (minutes: number) => Promise<void>;
  unsnoozeNotifications: () => Promise<void>;
  isInQuietHours: () => boolean;
  scheduleRecurringNotifications: () => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  radius: 5, // 5km default
  soundEnabled: true,
  vibrationEnabled: true,
  nearbyPets: true,
  achievements: true,
  dailyChallenges: true,
  emergencyBroadcasts: true,
  weeklyDigest: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

const STORAGE_KEY = 'notification_settings';
const LAST_CHECK_KEY = 'last_nearby_check';
const NOTIFIED_PETS_KEY = 'notified_pets';
const IN_APP_NOTIFICATIONS_KEY = 'in_app_notifications';
const SNOOZE_KEY = 'notifications_snoozed_until';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationProvider, useNotifications] = createContextHook((): NotificationStore => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifiedPets, setNotifiedPets] = useState<Set<string>>(new Set());
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [snoozedUntil, setSnoozedUntil] = useState<string | null>(null);
  
  const { currentLocation } = useLocation();
  const { nearbyPets } = usePets();
  const gamification = useGamification();
  const { userStats, dailyChallenges } = gamification || { userStats: null, dailyChallenges: [] };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (err: any) {
      console.error('Error loading notification settings:', err?.message || err);
    }
  };

  const loadNotifiedPets = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFIED_PETS_KEY);
      if (stored) {
        const petIds = JSON.parse(stored);
        setNotifiedPets(new Set(petIds));
      }
    } catch (err: any) {
      console.error('Error loading notified pets:', err?.message || err);
    }
  };

  const loadInAppNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(IN_APP_NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        setInAppNotifications(notifications);
      }
    } catch (err: any) {
      console.error('Error loading in-app notifications:', err?.message || err);
    }
  };

  const saveInAppNotifications = async (notifications: InAppNotification[]) => {
    try {
      await AsyncStorage.setItem(IN_APP_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error('Error saving in-app notifications:', err);
    }
  };

  const loadSnoozedUntil = async () => {
    try {
      const stored = await AsyncStorage.getItem(SNOOZE_KEY);
      if (stored) {
        const snoozedTime = JSON.parse(stored);
        if (new Date(snoozedTime) > new Date()) {
          setSnoozedUntil(snoozedTime);
        } else {
          await AsyncStorage.removeItem(SNOOZE_KEY);
        }
      }
    } catch (err: any) {
      console.error('Error loading snooze settings:', err?.message || err);
    }
  };

  const saveNotifiedPets = async (petIds: Set<string>) => {
    try {
      await AsyncStorage.setItem(NOTIFIED_PETS_KEY, JSON.stringify(Array.from(petIds)));
    } catch (err) {
      console.error('Error saving notified pets:', err);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking notification permissions:', err);
    }
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      if (Platform.OS === 'web') {
        console.log('Push notifications not fully supported on web');
        return false;
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        setError('Notification permission denied. Please enable notifications in settings.');
      }

      // Save Expo push token if granted
      if (granted && supabase) {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        try {
          await supabase.from('user_push_tokens').insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            push_token: token,
            device_type: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
          });
        } catch (e) {
          console.warn('Failed to save push token:', e);
        }
      }

      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request notification permissions';
      setError(errorMessage);
      console.error('Error requesting notification permissions:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      
      // If notifications are being enabled, request permissions
      if (newSettings.enabled && !hasPermission) {
        await requestPermissions();
      }
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Failed to update notification settings');
    }
  }, [settings, hasPermission, requestPermissions]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isInQuietHours = useCallback((): boolean => {
    if (!settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = settings.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }, [settings.quietHours]);

  const addInAppNotification = useCallback((notification: Omit<InAppNotification, 'id' | 'timestamp'>) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    
    const updatedNotifications = [newNotification, ...inAppNotifications].slice(0, 100); // Keep only last 100
    setInAppNotifications(updatedNotifications);
    saveInAppNotifications(updatedNotifications);
  }, [inAppNotifications]);

  const sendNearbyPetAlert = useCallback(async (pet: Pet, distance: number) => {
    try {
      if (!hasPermission || !settings.enabled || !settings.nearbyPets) {
        return;
      }

      if (snoozedUntil && new Date(snoozedUntil) > new Date()) {
        return;
      }

      const distanceText = distance < 1 
        ? `${Math.round(distance * 1000)}m away`
        : `${distance.toFixed(1)}km away`;

      // Add in-app notification
      addInAppNotification({
        type: 'nearby_pet',
        title: '🐾 Yakında Kayıp Hayvan!',
        body: `${pet.name} (${pet.type}) ${distanceText} mesafede görüldü`,
        data: { petId: pet.id, distance: distance.toString() },
        read: false,
        priority: 'high',
        category: 'Kayıp Hayvanlar',
        actionable: true,
        actions: [
          { id: 'view', title: 'Görüntüle', action: 'view_pet' },
          { id: 'directions', title: 'Yol Tarifi', action: 'get_directions' }
        ]
      });

      if (Platform.OS === 'web') {
        console.log(`Would send notification: Lost ${pet.name} spotted ${distance.toFixed(1)}km away`);
        return;
      }

      if (!isInQuietHours()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🐾 Yakında Kayıp Hayvan!',
            body: `${pet.name} (${pet.type}) ${distanceText} mesafede görüldü`,
            data: {
              petId: pet.id,
              type: 'nearby_pet',
              distance: distance.toString(),
            },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: null,
        });
      }

      console.log(`Sent notification for ${pet.name} at ${distanceText}`);
    } catch (err) {
      console.error('Error sending nearby pet alert:', err);
    }
  }, [hasPermission, settings, snoozedUntil, isInQuietHours, addInAppNotification]);

  const sendBulkNotifications = useCallback(async (userIds: string[], notification: { title: string; body: string; data?: any }) => {
    try {
      if (Platform.OS === 'web') {
        console.log(`Would send bulk notification to ${userIds.length} users:`, notification.title);
        return;
      }

      // Get push tokens for all users
      if (!supabase) return;
      const { data: pushTokens, error } = await supabase
        .from('user_push_tokens')
        .select('push_token')
        .in('user_id', userIds)
        .not('push_token', 'is', null);

      if (error) {
        console.error('Error fetching push tokens:', error.message || error);
        return;
      }

      // Send notifications in batches of 100 (Expo's limit)
      const batchSize = 100;
      const tokens = pushTokens?.map(t => t.push_token) || [];
      
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const messages = batch.map(token => ({
          to: token,
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: 'high',
        }));

        // Send to Expo Push API
        try {
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
          });

          if (!response.ok) {
            console.error('Failed to send push notifications batch:', response.status);
          } else {
            console.log(`Sent ${batch.length} emergency notifications`);
          }
        } catch (err) {
          console.error('Error sending push notification batch:', err);
        }
      }
    } catch (err) {
      console.error('Error in bulk notification sending:', err);
    }
  }, []);

  const sendEmergencyBroadcast = useCallback(async (petId: string, location: { lat: number; lng: number }): Promise<EmergencyBroadcastResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get pet details
      if (!supabase) return;
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (petError || !pet) {
        throw new Error('Pet not found');
      }

      // Get all users within 15km radius for emergency broadcasts
      const radiusKm = 15;
      if (!supabase) return;
      const { data: nearbyUsers, error: usersError } = await supabase.rpc('users_within_radius', {
        center_lat: location.lat,
        center_lng: location.lng,
        radius_km: radiusKm
      });

      if (usersError) {
        console.error('Error fetching nearby users:', usersError.message || usersError);
        // Fallback: get all users (for testing)
        if (supabase) {
        const { data: allUsers } = await supabase
          .from('users')
          .select('id')
          .limit(1000);
        
        if (allUsers) {
          const userIds = allUsers.map(u => u.id);
          await sendBulkNotifications(userIds, {
            title: '🚨 ACİL DURUM - Kayıp Hayvan!',
            body: `${pet.name} (${pet.type}) kritik tehlikede! Acil yardım gerekiyor - Ödül: ${pet.reward_amount}₺`,
            data: { 
              petId: petId, 
              urgency: 'critical',
              type: 'emergency_broadcast',
              lat: location.lat,
              lng: location.lng,
              heroPoints: 500,
              emergencyRadius: 15
            }
          });

          // Track analytics
          if (supabase) {
          await supabase.from('emergency_broadcasts').insert({
            pet_id: petId,
            location: `POINT(${location.lng} ${location.lat})`,
            recipients_count: userIds.length,
            broadcast_type: 'emergency'
          });
          }
        }

          return {
            recipientCount: userIds.length,
            success: true
          };
        }
      }

      const userIds = nearbyUsers?.map((u: any) => u.id) || [];
      
      if (userIds.length === 0) {
        return {
          recipientCount: 0,
          success: true,
          error: 'No users found in the area'
        };
      }

      // Send emergency notifications
      await sendBulkNotifications(userIds, {
        title: '🚨 ACİL DURUM - Kayıp Hayvan!',
        body: `${pet.name} (${pet.type}) kritik tehlikede! Acil yardım gerekiyor - Ödül: ${pet.reward_amount}₺`,
        data: { 
          petId: petId, 
          urgency: 'critical',
          type: 'emergency_broadcast',
          lat: location.lat,
          lng: location.lng,
          reward: pet.reward_amount,
          heroPoints: 500,
          emergencyRadius: 15
        }
      });

      // Log the broadcast for analytics
      if (!supabase) return;
      await supabase.from('emergency_broadcasts').insert({
        pet_id: petId,
        location: `POINT(${location.lng} ${location.lat})`,
        recipients_count: userIds.length,
        broadcast_type: 'emergency'
      });

      console.log(`Emergency broadcast sent to ${userIds.length} users for pet ${pet.name}`);
      
      return {
        recipientCount: userIds.length,
        success: true
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send emergency broadcast';
      setError(errorMessage);
      console.error('Error sending emergency broadcast:', err);
      
      return {
        recipientCount: 0,
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [sendBulkNotifications]);

  const checkNearbyPets = useCallback(async () => {
    try {
      if (!currentLocation || !settings.enabled || !hasPermission) {
        return;
      }

      // Check if we've checked recently (avoid spam)
      const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
      const now = Date.now();
      if (lastCheck && now - parseInt(lastCheck) < 60000) { // 1 minute cooldown
        return;
      }

      const newNotifiedPets = new Set(notifiedPets);
      let hasNewNotifications = false;

      for (const pet of nearbyPets) {
        if (!pet.last_location || notifiedPets.has(pet.id)) {
          continue;
        }

        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          pet.last_location.lat,
          pet.last_location.lng
        );

        if (distance <= settings.radius) {
          await sendNearbyPetAlert(pet, distance);
          newNotifiedPets.add(pet.id);
          hasNewNotifications = true;
        }
      }

      if (hasNewNotifications) {
        setNotifiedPets(newNotifiedPets);
        await saveNotifiedPets(newNotifiedPets);
      }

      await AsyncStorage.setItem(LAST_CHECK_KEY, now.toString());
    } catch (err) {
      console.error('Error checking nearby pets:', err);
    }
  }, [currentLocation, settings, hasPermission, nearbyPets, notifiedPets, sendNearbyPetAlert]);

  const sendAchievementNotification = useCallback(async (achievement: any) => {
    try {
      if (!settings.achievements) return;

      addInAppNotification({
        type: 'achievement',
        title: '🏆 Yeni Başarı Kazandın!',
        body: `"${achievement.name}" rozetini kazandın! ${achievement.reward}`,
        data: { achievementId: achievement.id },
        read: false,
        priority: 'normal',
        category: 'Başarılar',
        actionable: true,
        actions: [
          { id: 'view', title: 'Görüntüle', action: 'view_achievement' }
        ]
      });

      if (Platform.OS !== 'web' && !isInQuietHours()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🏆 Yeni Başarı!',
            body: `"${achievement.name}" rozetini kazandın!`,
            data: { type: 'achievement', achievementId: achievement.id },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: null,
        });
      }
    } catch (err) {
      console.error('Error sending achievement notification:', err);
    }
  }, [settings.achievements, addInAppNotification, isInQuietHours, settings.soundEnabled]);

  const sendDailyChallengeReminder = useCallback(async () => {
    try {
      if (!settings.dailyChallenges) return;

      const incompleteChallenges = dailyChallenges.filter(c => !c.completed);
      if (incompleteChallenges.length === 0) return;

      addInAppNotification({
        type: 'challenge_reminder',
        title: '📅 Günlük Görevlerin Seni Bekliyor!',
        body: `${incompleteChallenges.length} görev tamamlanmayı bekliyor. Hadi başlayalım!`,
        data: { challengeCount: incompleteChallenges.length },
        read: false,
        priority: 'low',
        category: 'Günlük Görevler',
        actionable: true,
        actions: [
          { id: 'view', title: 'Görevleri Gör', action: 'view_challenges' }
        ]
      });

      if (Platform.OS !== 'web' && !isInQuietHours()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📅 Günlük Görevler',
            body: `${incompleteChallenges.length} görev tamamlanmayı bekliyor!`,
            data: { type: 'daily_challenge' },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: null,
        });
      }
    } catch (err) {
      console.error('Error sending daily challenge reminder:', err);
    }
  }, [settings.dailyChallenges, dailyChallenges, addInAppNotification, isInQuietHours, settings.soundEnabled]);

  const sendTierUpgradeNotification = useCallback(async (tier: any) => {
    try {
      if (!settings.achievements) return;

      addInAppNotification({
        type: 'tier_upgrade',
        title: '👑 Seviye Atladın!',
        body: `Tebrikler! Artık "${tier.name}" seviyesindesin! ${tier.benefits.join(', ')}`,
        data: { tierId: tier.id },
        read: false,
        priority: 'high',
        category: 'Seviye Atlama',
        actionable: true,
        actions: [
          { id: 'view', title: 'Detayları Gör', action: 'view_tier' }
        ]
      });

      if (Platform.OS !== 'web' && !isInQuietHours()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '👑 Seviye Atladın!',
            body: `Artık "${tier.name}" seviyesindesin!`,
            data: { type: 'tier_upgrade', tierId: tier.id },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: null,
        });
      }
    } catch (err) {
      console.error('Error sending tier upgrade notification:', err);
    }
  }, [settings.achievements, addInAppNotification, isInQuietHours, settings.soundEnabled]);

  const sendWeeklyDigest = useCallback(async () => {
    try {
      if (!settings.weeklyDigest) return;

      const weeklyStats = {
        reportsThisWeek: userStats.weeklyReports,
        petsHelped: userStats.petsHelped,
        currentStreak: userStats.streak
      };

      addInAppNotification({
        type: 'weekly_digest',
        title: '📊 Haftalık Özet',
        body: `Bu hafta ${weeklyStats.reportsThisWeek} rapor verdin ve ${weeklyStats.petsHelped} hayvana yardım ettin!`,
        data: weeklyStats,
        read: false,
        priority: 'low',
        category: 'Haftalık Özet',
        actionable: true,
        actions: [
          { id: 'view', title: 'Detayları Gör', action: 'view_stats' }
        ]
      });

      if (Platform.OS !== 'web' && !isInQuietHours()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📊 Haftalık Özet',
            body: `Bu hafta ${weeklyStats.reportsThisWeek} rapor verdin!`,
            data: { type: 'weekly_digest' },
            sound: settings.soundEnabled ? 'default' : undefined,
          },
          trigger: null,
        });
      }
    } catch (err) {
      console.error('Error sending weekly digest:', err);
    }
  }, [settings.weeklyDigest, userStats, addInAppNotification, isInQuietHours, settings.soundEnabled]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const updatedNotifications = inAppNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setInAppNotifications(updatedNotifications);
    await saveInAppNotifications(updatedNotifications);
  }, [inAppNotifications]);

  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = inAppNotifications.map(n => ({ ...n, read: true }));
    setInAppNotifications(updatedNotifications);
    await saveInAppNotifications(updatedNotifications);
  }, [inAppNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const updatedNotifications = inAppNotifications.filter(n => n.id !== notificationId);
    setInAppNotifications(updatedNotifications);
    await saveInAppNotifications(updatedNotifications);
  }, [inAppNotifications]);

  const clearAllNotifications = useCallback(async () => {
    setInAppNotifications([]);
    await AsyncStorage.removeItem(IN_APP_NOTIFICATIONS_KEY);
  }, []);

  const getFilteredNotifications = useCallback((filter: NotificationFilter): InAppNotification[] => {
    return inAppNotifications.filter(notification => {
      if (filter.type && !filter.type.includes(notification.type)) return false;
      if (filter.priority && !filter.priority.includes(notification.priority)) return false;
      if (filter.read !== undefined && notification.read !== filter.read) return false;
      if (filter.dateRange) {
        const notificationDate = new Date(notification.timestamp);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (notificationDate < startDate || notificationDate > endDate) return false;
      }
      return true;
    });
  }, [inAppNotifications]);

  const snoozeNotifications = useCallback(async (minutes: number) => {
    const snoozedTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setSnoozedUntil(snoozedTime);
    await AsyncStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozedTime));
  }, []);

  const unsnoozeNotifications = useCallback(async () => {
    setSnoozedUntil(null);
    await AsyncStorage.removeItem(SNOOZE_KEY);
  }, []);

  const scheduleRecurringNotifications = useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;

      // Cancel existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!hasPermission || !settings.enabled) return;

      // Schedule daily challenge reminder (9 AM daily)
      if (settings.dailyChallenges) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📅 Günlük Görevler',
            body: 'Bugünkü görevlerin seni bekliyor!',
            data: { type: 'daily_challenge_reminder' },
          },
          trigger: {
            hour: 9,
            minute: 0,
            repeats: true,
          } as any,
        });
      }

      // Schedule weekly digest (Sunday 8 PM)
      if (settings.weeklyDigest) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📊 Haftalık Özet',
            body: 'Bu haftaki başarıların hazır!',
            data: { type: 'weekly_digest' },
          },
          trigger: {
            weekday: 1, // Sunday
            hour: 20,
            minute: 0,
            repeats: true,
          } as any,
        });
      }
    } catch (err) {
      console.error('Error scheduling recurring notifications:', err);
    }
  }, [hasPermission, settings]);

  const setupNotificationHandlers = useCallback(() => {
    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'nearby_pet' && data?.petId) {
        router.push({
          pathname: '/pet-details',
          params: { id: data.petId as string }
        });
      } else if (data?.type === 'achievement') {
        router.push('/gamified-profile');
      } else if (data?.type === 'daily_challenge') {
        router.push('/(tabs)/community');
      } else if (data?.type === 'emergency_broadcast' && data?.petId) {
        router.push({
          pathname: '/pet-details',
          params: { id: data.petId as string }
        });
      }
    });

    return () => subscription.remove();
  }, []);

  // Computed values
  const unreadCount = useMemo(() => {
    return inAppNotifications.filter(n => !n.read).length;
  }, [inAppNotifications]);

  // Load settings and check permissions on mount
  useEffect(() => {
    loadSettings();
    checkPermissions();
    loadNotifiedPets();
    loadInAppNotifications();
    loadSnoozedUntil();
  }, []);

  // Schedule recurring notifications when settings change
  useEffect(() => {
    if (hasPermission) {
      scheduleRecurringNotifications();
    }
  }, [hasPermission, settings.dailyChallenges, settings.weeklyDigest, scheduleRecurringNotifications]);

  // Setup notification handlers
  useEffect(() => {
    const cleanup = setupNotificationHandlers();
    return cleanup;
  }, [setupNotificationHandlers]);

  // Check for nearby pets when location or pets change
  useEffect(() => {
    if (settings.enabled && currentLocation && nearbyPets.length > 0) {
      checkNearbyPets();
    }
  }, [settings.enabled, currentLocation, nearbyPets, checkNearbyPets]);

  // Clear notified pets daily
  useEffect(() => {
    const clearNotifiedPets = async () => {
      const lastClear = await AsyncStorage.getItem('last_clear_notified');
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (!lastClear || now - parseInt(lastClear) > oneDayMs) {
        setNotifiedPets(new Set());
        await AsyncStorage.setItem('last_clear_notified', now.toString());
        await AsyncStorage.removeItem(NOTIFIED_PETS_KEY);
      }
    };

    clearNotifiedPets();
  }, []);

  return useMemo(() => ({
    settings,
    hasPermission,
    isLoading,
    error,
    inAppNotifications,
    unreadCount,
    snoozedUntil,
    requestPermissions,
    updateSettings,
    sendNearbyPetAlert,
    sendAchievementNotification,
    sendDailyChallengeReminder,
    sendTierUpgradeNotification,
    sendWeeklyDigest,
    setupNotificationHandlers,
    checkNearbyPets,
    sendEmergencyBroadcast,
    sendBulkNotifications,
    addInAppNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getFilteredNotifications,
    snoozeNotifications,
    unsnoozeNotifications,
    isInQuietHours,
    scheduleRecurringNotifications,
  }), [
    settings,
    hasPermission,
    isLoading,
    error,
    inAppNotifications,
    unreadCount,
    snoozedUntil,
    requestPermissions,
    updateSettings,
    sendNearbyPetAlert,
    sendAchievementNotification,
    sendDailyChallengeReminder,
    sendTierUpgradeNotification,
    sendWeeklyDigest,
    setupNotificationHandlers,
    checkNearbyPets,
    sendEmergencyBroadcast,
    sendBulkNotifications,
    addInAppNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getFilteredNotifications,
    snoozeNotifications,
    unsnoozeNotifications,
    isInQuietHours,
    scheduleRecurringNotifications,
  ]);
});
