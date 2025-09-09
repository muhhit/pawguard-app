import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { 
  Trophy, 
  Users, 
  Gift, 
  Target,
  Share2,
  Award
} from 'lucide-react-native';
import { GamificationDashboard } from '@/components/GamificationDashboard';
import { CommunityFeatures } from '@/components/CommunityFeatures';
import CommunityMissions from '@/components/CommunityMissions';
import ReferralSystem from '@/components/ReferralSystem';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';
import { performanceMonitor, useMemoizedCallback } from '@/utils/performance';
import { NoCommunityEmpty, NoAchievementsEmpty } from '@/components/EmptyStates';
import { router } from 'expo-router';

type TabType = 'gamification' | 'community' | 'referral';

// Memoized tab content components for better performance
const TabButton = memo<{
  tab: TabType;
  activeTab: TabType;
  icon: React.ComponentType<any>;
  label: string;
  onPress: (tab: TabType) => void;
}>(({ tab, activeTab, icon: Icon, label, onPress }) => (
  <TouchableOpacity 
    style={[styles.tab, activeTab === tab && styles.activeTab]}
    onPress={() => onPress(tab)}
  >
    <Icon size={20} color={activeTab === tab ? '#8B5CF6' : '#6B7280'} />
    <Text style={[
      styles.tabText, 
      activeTab === tab && styles.activeTabText
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
));

TabButton.displayName = 'TabButton';

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('gamification');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingTabContent, setIsLoadingTabContent] = useState<boolean>(false);

  // Initialize loading state - optimized
  useEffect(() => {
    const measureRender = performanceMonitor.measureRender('CommunityScreen');
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced loading time

    return () => {
      clearTimeout(timer);
      measureRender();
    };
  }, []);

  // Handle tab changes with loading - optimized
  const handleTabChange = useMemoizedCallback((tab: TabType) => {
    if (tab !== activeTab) {
      setIsLoadingTabContent(true);
      setActiveTab(tab);
      setTimeout(() => {
        setIsLoadingTabContent(false);
      }, 300); // Reduced loading time for better UX
    }
  }, [activeTab]);

  const renderTabContent = () => {
    if (isLoadingTabContent) {
      return (
        <LoadingSpinner 
          text="İçerik yükleniyor..."
          style={{ marginTop: 60 }}
        />
      );
    }

    switch (activeTab) {
      case 'gamification':
        return (
          <View style={{ flex: 1 }}>
            <GamificationDashboard />
            {/* Only show empty state when user has no achievements - this should be rare with proper gamification */}
            {/* <NoAchievementsEmpty onExplore={() => {
              console.log('Exploring achievements...');
              // Navigate to achievements guide
            }} /> */}
          </View>
        );
      case 'community':
        return (
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <CommunityFeatures />
            <CommunityMissions />
            <View style={{ height: 12 }} />
            <TouchableOpacity style={styles.primaryCta} onPress={() => router.push('/matchmaking')}>
              <Text style={styles.primaryCtaTxt}>Arkadaş Bul (Paw Match)</Text>
            </TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity style={styles.secondaryCta} onPress={() => router.push('/circles')}>
              <Text style={styles.secondaryCtaTxt}>Paw Çemberleri (Gruplar)</Text>
            </TouchableOpacity>
          </View>
        );
      case 'referral':
        return (
          <View style={styles.referralTabContent}>
            <TouchableOpacity 
              style={styles.openReferralButton}
              onPress={() => setShowReferralModal(true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.openReferralButtonGradient}
              >
                <Share2 size={24} color="#FFF" />
                <Text style={styles.openReferralButtonText}>Davet Programını Aç</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.referralInfo}>
              <Text style={styles.referralInfoTitle}>Arkadaşlarını Davet Et!</Text>
              <Text style={styles.referralInfoText}>
                Her 3 arkadaşın için 1 ay ücretsiz premium kazan. 
                Arkadaşların da kayıt olduğunda premium alacak!
              </Text>
            </View>
            
            {/* Mock referral stats */}
            <View style={styles.referralStatsContainer}>
              <View style={styles.referralStatCard}>
                <Text style={styles.referralStatNumber}>7</Text>
                <Text style={styles.referralStatLabel}>Davet Edildi</Text>
              </View>
              <View style={styles.referralStatCard}>
                <Text style={styles.referralStatNumber}>3</Text>
                <Text style={styles.referralStatLabel}>Kayıt Oldu</Text>
              </View>
              <View style={styles.referralStatCard}>
                <Text style={styles.referralStatNumber}>1</Text>
                <Text style={styles.referralStatLabel}>Ödül Kazanıldı</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          fullScreen
          text="Topluluk verileri yükleniyor..."
          variant="glass"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Topluluk & Ödüller</Text>
        <Text style={styles.headerSubtitle}>
          Rozetler kazan, arkadaşlarını davet et, topluluğa katıl!
        </Text>
      </LinearGradient>

      {/* Tab Navigation - Optimized */}
      <View style={styles.tabNavigation}>
        <TabButton
          tab="gamification"
          activeTab={activeTab}
          icon={Trophy}
          label="Rozetler"
          onPress={handleTabChange}
        />
        <TabButton
          tab="community"
          activeTab={activeTab}
          icon={Users}
          label="Topluluk"
          onPress={handleTabChange}
        />
        <TabButton
          tab="referral"
          activeTab={activeTab}
          icon={Gift}
          label="Davet Et"
          onPress={handleTabChange}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      {/* Referral Modal */}
      <ReferralSystem
        visible={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  tabContent: {
    flex: 1,
  },
  referralTabContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openReferralButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  openReferralButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 12,
  },
  openReferralButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  referralInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  referralInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  referralInfoText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  referralStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  referralStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  primaryCta: { backgroundColor: '#0EA5E9', alignItems: 'center', paddingVertical: 12, borderRadius: 10 },
  primaryCtaTxt: { color: 'white', fontWeight: '700' },
  secondaryCta: { backgroundColor: '#E5E7EB', alignItems: 'center', paddingVertical: 12, borderRadius: 10 },
  secondaryCtaTxt: { color: '#111827', fontWeight: '700' },
});
