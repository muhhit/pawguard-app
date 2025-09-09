import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Bell,
  Shield,
  Heart,
  MapPin,
  HelpCircle,
  LogOut,
  Edit3,
  Camera,
  Star,
  Trophy,
  Target,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/auth-store';
import { usePremium } from '@/hooks/premium-store';
import { FadeTransition } from '@/components/PageTransition';
import NeighborhoodSelectionModal from '@/components/NeighborhoodSelectionModal';
import { PremiumBadge } from '@/components/PremiumBadge';
import { NoActivityEmpty } from '@/components/EmptyStates';
import type { Neighborhood } from '@/constants/neighborhoods';

interface UserStats {
  petsFound: number;
  totalPoints: number;
  successRate: number;
  level: number;
  rank: number;
  badges: string[];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const { isPremium } = usePremium();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState<boolean>(false);

  const mockUserStats: UserStats = {
    petsFound: 12,
    totalPoints: 1847,
    successRate: 92,
    level: 8,
    rank: 15,
    badges: ['🏆', '⭐', '💎', '🎯', '❤️', '🦮', '🐕'],
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Profil Düzenle',
      'Profil düzenleme özelliği yakında eklenecek!',
      [{ text: 'Tamam' }]
    );
  };

  const handleNeighborhoodSelect = async (neighborhood: Neighborhood) => {
    try {
      const result = await updateProfile(undefined, undefined, neighborhood);
      if (result.error) {
        Alert.alert('Hata', result.error);
      } else {
        Alert.alert('Başarılı', 'Mahalle bilginiz güncellendi!');
      }
    } catch (error) {
      console.error('Error updating neighborhood:', error);
      Alert.alert('Hata', 'Mahalle güncellenirken bir hata oluştu.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const menuItems = [
    {
      id: 'neighborhood',
      title: 'Mahalle',
      subtitle: user?.neighborhood ? `${user.neighborhood.name}, ${user.neighborhood.city}` : 'Mahalle seçin',
      icon: MapPin,
      color: '#FF6B6B',
      onPress: () => setShowNeighborhoodModal(true),
    },
    {
      id: 'notifications',
      title: 'Bildirimler',
      subtitle: 'Push bildirimleri ve e-posta ayarları',
      icon: Bell,
      color: '#FF6B6B',
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      id: 'location',
      title: 'Konum Servisleri',
      subtitle: 'GPS ve konum paylaşımı',
      icon: MapPin,
      color: '#4ECDC4',
      hasSwitch: true,
      switchValue: locationEnabled,
      onSwitchChange: setLocationEnabled,
    },
    {
      id: 'privacy',
      title: 'Gizlilik ve Güvenlik',
      subtitle: 'Hesap güvenliği ve gizlilik ayarları',
      icon: Shield,
      color: '#9B59B6',
    },
    {
      id: 'help',
      title: 'Yardım ve Destek',
      subtitle: 'SSS, iletişim ve geri bildirim',
      icon: HelpCircle,
      color: '#3498DB',
    },
    {
      id: 'about',
      title: 'Uygulama Hakkında',
      subtitle: 'Sürüm bilgisi ve yasal metinler',
      icon: Settings,
      color: '#95A5A6',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={handleEditProfile}>
                <Camera color="#FFFFFF" size={16} />
              </TouchableOpacity>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{mockUserStats.level}</Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
                {isPremium && (
                  <PremiumBadge size="medium" style={styles.profilePremiumBadge} />
                )}
              </View>
              <Text style={styles.userTitle}>Sokak Hayvanları Kahramanı</Text>
              <View style={styles.rankContainer}>
                <Trophy color="#FFD700" size={16} />
                <Text style={styles.rankText}>#{mockUserStats.rank} Sırada</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Edit3 color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
              <Heart color="#FF6B6B" size={20} />
            </View>
            <Text style={styles.statNumber}>{mockUserStats.petsFound}</Text>
            <Text style={styles.statLabel}>Bulunan Pet</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#4ECDC420' }]}>
              <Star color="#4ECDC4" size={20} />
            </View>
            <Text style={styles.statNumber}>{mockUserStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Toplam Puan</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#9B59B620' }]}>
              <Target color="#9B59B6" size={20} />
            </View>
            <Text style={styles.statNumber}>{mockUserStats.successRate}%</Text>
            <Text style={styles.statLabel}>Başarı Oranı</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>Rozetlerim</Text>
          {mockUserStats.badges.length > 0 ? (
            <View style={styles.badgesRow}>
              {mockUserStats.badges.map((badge, index) => (
                <View key={index} style={styles.badgeItem}>
                  <Text style={styles.badgeEmoji}>{badge}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.moreBadges}>
                <Text style={styles.moreBadgesText}>+{Math.max(0, mockUserStats.badges.length - 4)}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <NoActivityEmpty onStart={() => {
              console.log('Starting community activities to earn badges...');
              // Navigate to community or tracking screen
            }} />
          )}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                } else if (!item.hasSwitch) {
                  Alert.alert(item.title, 'Bu özellik yakında eklenecek!');
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <IconComponent color={item.color} size={20} />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              
              <View style={styles.menuItemRight}>
                {item.hasSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: '#E2E8F0', true: item.color + '40' }}
                    thumbColor={item.switchValue ? item.color : '#FFFFFF'}
                  />
                ) : (
                  <ChevronRight color="#94A3B8" size={20} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#EF4444" size={20} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PawGuard v1.0.0</Text>
          <Text style={styles.versionSubtext}>Sokak hayvanları için güvenli bir dünya</Text>
        </View>
      </ScrollView>

      {/* Neighborhood Selection Modal */}
      <NeighborhoodSelectionModal
        visible={showNeighborhoodModal}
        onClose={() => setShowNeighborhoodModal(false)}
        onSelect={handleNeighborhoodSelect}
        selectedNeighborhood={user?.neighborhood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profilePremiumBadge: {
    marginTop: 2,
  },
  userTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -10,
    zIndex: 5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  badgesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeItem: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  moreBadges: {
    width: 48,
    height: 48,
    backgroundColor: '#FF6B6B20',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B40',
  },
  moreBadgesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 100,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
  },
});