import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import Slider from '@react-native-community/slider';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  Settings as SettingsIcon,
  ChevronRight,
  MapPin,
  Heart,
  LogOut,
  DollarSign,
  Users,
  LucideIcon,
  MessageCircle,
  Building2,
  Lock,
  Eye,
  Info,
  CreditCard,
  Star,
  Headphones,
  FileText,
  Globe,
  Coins,
  WifiOff,
} from "lucide-react-native";
import { useAuth } from "@/hooks/auth-store";
import { useNotifications } from "@/hooks/notification-store";
import { useLanguage } from "@/hooks/language-store";
import LoadingSpinner from "@/components/LoadingSpinner";
import { router } from "expo-router";
import ReferralSystem from "@/components/ReferralSystem";
import RedditStrategy from "@/components/RedditStrategy";
import VeterinaryPartnership from "@/components/VeterinaryPartnership";
import CurrencySelectionModal from "@/components/CurrencySelectionModal";

type SettingItemWithPress = {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
  hasSwitch?: never;
  value?: never;
  onToggle?: never;
};

type SettingItemWithSwitch = {
  icon: LucideIcon;
  label: string;
  hasSwitch: true;
  value: boolean;
  onToggle: (value: boolean) => void | Promise<void>;
  subtitle?: string;
  onPress?: never;
  isDestructive?: never;
};

type SettingItem = SettingItemWithPress | SettingItemWithSwitch;

type SettingsGroup = {
  title: string;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const { user, signOut, locationPrivacy, updateLocationPrivacy } = useAuth();
  const { settings, updateSettings, hasPermission, requestPermissions } = useNotifications();
  const { language, currency, setLanguage, t } = useLanguage();
  const [radiusModalVisible, setRadiusModalVisible] = React.useState(false);
  const [referralModalVisible, setReferralModalVisible] = React.useState(false);
  const [redditStrategyVisible, setRedditStrategyVisible] = React.useState(false);
  const [vetPartnershipVisible, setVetPartnershipVisible] = React.useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = React.useState(false);
  const [fuzzingRadius, setFuzzingRadius] = React.useState(locationPrivacy.custom_fuzzing_radius);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState<boolean>(false);

  const radiusOptions = [1, 2, 5, 10, 15, 20];

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Simulate initial data loading

    return () => clearTimeout(timer);
  }, []);

  const handleToggleSetting = async (key: string, value: boolean) => {
    setIsUpdatingSettings(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Update the setting here
    setIsUpdatingSettings(false);
  };

  const handleRadiusSelect = async (radius: number) => {
    setIsUpdatingSettings(true);
    await updateSettings({ radius });
    setRadiusModalVisible(false);
    setIsUpdatingSettings(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      'Are you sure you want to sign out?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handlePrivacyLevelChange = async (level: 'strict' | 'moderate' | 'open') => {
    await updateLocationPrivacy({ location_privacy_level: level });
  };

  const handleFuzzingRadiusChange = async (radius: number) => {
    setFuzzingRadius(radius);
    await updateLocationPrivacy({ custom_fuzzing_radius: radius });
  };

  const getPrivacyLevelDescription = (level: string) => {
    switch (level) {
      case 'strict':
        return 'Maximum privacy - location shown at city level only';
      case 'moderate':
        return 'Balanced privacy - location shown at neighborhood level';
      case 'open':
        return 'Minimal privacy - exact location visible to all users';
      default:
        return 'Balanced privacy - location shown at neighborhood level';
    }
  };

  const handleLanguageSelect = async (lang: 'tr' | 'en') => {
    await setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const settingsGroups: SettingsGroup[] = [
    {
      title: t('settings.account'),
      items: [
        { icon: User, label: t('settings.personalInfo'), subtitle: user?.email, onPress: () => {} },
        { icon: Star, label: t('settings.premiumMembership'), subtitle: "Özel özelliklere erişin", onPress: () => {} },
        { icon: CreditCard, label: t('settings.paymentMethods'), subtitle: "Kartlarınızı yönetin", onPress: () => {} },
      ],
    },
    {
      title: t('settings.features'),
      items: [
        { icon: SettingsIcon, label: t('settings.aiFeatures'), subtitle: "Yapay zeka araçlarını deneyin", onPress: () => router.push('/ai-features') },
        { icon: DollarSign, label: t('settings.rewardClaims'), subtitle: "Kazançlarınızı yönetin", onPress: () => router.push('/reward-claims') },
        { icon: Users, label: t('settings.referralProgram'), subtitle: "Arkadaş davet edin, ödül kazanın", onPress: () => setReferralModalVisible(true) },
      ],
    },
    {
      title: t('settings.notifications'),
      items: [
        {
          icon: Bell,
          label: t('settings.pushNotifications'),
          subtitle: hasPermission ? "Etkin" : "Etkinleştirmek için dokunun",
          hasSwitch: true,
          value: settings.enabled,
          onToggle: async (value: boolean) => {
            if (value && !hasPermission) {
              const granted = await requestPermissions();
              if (granted) {
                await updateSettings({ enabled: true });
              }
            } else {
              await updateSettings({ enabled: value });
            }
          },
        },
        {
          icon: MapPin,
          label: t('settings.alertRadius'),
          subtitle: `${settings.radius}km`,
          onPress: () => setRadiusModalVisible(true),
        },
        {
          icon: Heart,
          label: t('settings.soundAlerts'),
          hasSwitch: true,
          value: settings.soundEnabled,
          onToggle: async (value: boolean) => {
            await updateSettings({ soundEnabled: value });
          },
        },
      ],
    },
    {
      title: t('settings.privacy'),
      items: [
        {
          icon: Lock,
          label: t('settings.locationPrivacy'),
          subtitle: getPrivacyLevelDescription(locationPrivacy.location_privacy_level),
          onPress: () => setPrivacyModalVisible(true),
        },
        {
          icon: Eye,
          label: t('settings.showExactToFinders'),
          subtitle: "Aktif talepleri olan kişiler kesin konumu görebilir",
          hasSwitch: true,
          value: locationPrivacy.show_exact_to_finders,
          onToggle: async (value: boolean) => {
            await updateLocationPrivacy({ show_exact_to_finders: value });
          },
        },
        { icon: Shield, label: t('settings.securitySettings'), subtitle: "Hesap güvenliğinizi yönetin", onPress: () => {} },
        { icon: Globe, label: t('settings.language'), subtitle: language === 'tr' ? t('settings.turkish') : t('settings.english'), onPress: () => setLanguageModalVisible(true) },
        { icon: DollarSign, label: t('profile.currency'), subtitle: currency === 'TRY' ? t('currency.turkishLira') : currency === 'USD' ? t('currency.usDollar') : t('currency.euro'), onPress: () => setCurrencyModalVisible(true) },
      ],
    },
    {
      title: t('settings.partnerships'),
      items: [
        { icon: MessageCircle, label: t('settings.redditStrategy'), subtitle: "Topluluk odaklı organik büyüme", onPress: () => setRedditStrategyVisible(true) },
        { icon: Building2, label: t('settings.veterinaryPartnerships'), subtitle: "Stratejik klinik işbirlikleri", onPress: () => setVetPartnershipVisible(true) },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        { icon: HelpCircle, label: t('settings.helpFaq'), subtitle: "Sık sorulan sorular", onPress: () => {} },
        { icon: Headphones, label: t('settings.liveSupport'), subtitle: "7/24 müşteri hizmetleri", onPress: () => {} },
        { icon: FileText, label: t('settings.feedback'), subtitle: "Önerilerinizi paylaşın", onPress: () => {} },
        { icon: FileText, label: 'Kullanım Şartları', subtitle: 'ToS', onPress: () => router.push('/tos') },
        { icon: Shield, label: 'Gizlilik Politikası', subtitle: 'Privacy', onPress: () => router.push('/privacy') },
        { icon: WifiOff, label: "Offline Mode Demo", subtitle: "Test offline functionality", onPress: () => router.push('/offline-mode-demo') },
      ],
    },
    {
      title: t('settings.session'),
      items: [
        { icon: LogOut, label: t('settings.signOut'), onPress: handleSignOut, isDestructive: true },
      ],
    },
  ];

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          fullScreen
          text="Ayarlar yükleniyor..."
          variant="glass"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color="#FFFFFF" size={36} strokeWidth={2} />
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.email?.split('@')[0] || 'Kullanıcı'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.premiumBadge}>
              <Star color="#8B5CF6" size={14} fill="#8B5CF6" />
              <Text style={styles.premiumText}>Premium Üye</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isUpdatingSettings && (
          <View style={styles.loadingOverlay}>
            <LoadingSpinner 
              text="Ayarlar güncelleniyor..."
              variant="glass"
            />
          </View>
        )}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContent}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === group.items.length - 1 && styles.lastItem,
                  ]}
                  onPress={item.hasSwitch ? undefined : item.onPress}
                  disabled={item.hasSwitch || isUpdatingSettings}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, !item.hasSwitch && item.isDestructive && styles.destructiveIconContainer]}>
                      <item.icon 
                        color={!item.hasSwitch && item.isDestructive ? "#DC2626" : Platform.OS === 'ios' ? "#FFFFFF" : "#64748B"} 
                        size={Platform.OS === 'ios' ? 18 : 20}
                        strokeWidth={Platform.OS === 'ios' ? 1.5 : 2}
                      />
                    </View>
                    <View style={styles.labelContainer}>
                      <Text style={[styles.settingLabel, !item.hasSwitch && item.isDestructive && styles.destructiveLabel]}>{item.label}</Text>
                      {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
                    </View>
                  </View>
                  <View style={styles.settingRight}>
                    {item.hasSwitch ? (
                      <Switch
                        value={item.value}
                        onValueChange={(value) => {
                          item.onToggle(value);
                          handleToggleSetting(item.label, value);
                        }}
                        trackColor={{ false: "#E2E8F0", true: "#FF6B6B" }}
                        thumbColor="#FFFFFF"
                        disabled={isUpdatingSettings}
                      />
                    ) : (
                      <ChevronRight color="#94A3B8" size={20} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.appInfo}>
          <Text style={styles.appName}>PawGuard</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Keep your furry friends safe and healthy with real-time tracking and monitoring.
          </Text>
        </View>
      </ScrollView>

      {/* Radius Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={radiusModalVisible}
        onRequestClose={() => setRadiusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.alertRadius')}</Text>
              <Text style={styles.modalSubtitle}>
                Choose how far you want to be notified about lost pets
              </Text>
            </View>
            
            <View style={styles.radiusOptions}>
              {radiusOptions.map((radius) => (
                <Pressable
                  key={radius}
                  style={[
                    styles.radiusOption,
                    settings.radius === radius && styles.radiusOptionSelected,
                  ]}
                  onPress={() => handleRadiusSelect(radius)}
                >
                  <Text
                    style={[
                      styles.radiusOptionText,
                      settings.radius === radius && styles.radiusOptionTextSelected,
                    ]}
                  >
                    {radius}km
                  </Text>
                  {settings.radius === radius && (
                    <View style={styles.radiusOptionCheck}>
                      <Text style={styles.radiusOptionCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setRadiusModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Referral System Modal */}
      <ReferralSystem 
        visible={referralModalVisible}
        onClose={() => setReferralModalVisible(false)}
      />
      
      {/* Reddit Strategy Modal */}
      <RedditStrategy 
        visible={redditStrategyVisible}
        onClose={() => setRedditStrategyVisible(false)}
      />
      
      {/* Veterinary Partnership Modal */}
      <VeterinaryPartnership 
        visible={vetPartnershipVisible}
        onClose={() => setVetPartnershipVisible(false)}
      />

      {/* Location Privacy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyModalVisible}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.locationPrivacy')}</Text>
              <Text style={styles.modalSubtitle}>
                Control how your pet&apos;s location is shared with other users
              </Text>
            </View>
            
            {/* Privacy Level Selection */}
            <View style={styles.privacySection}>
              <Text style={styles.sectionTitle}>Privacy Level</Text>
              
              {(['strict', 'moderate', 'open'] as const).map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.privacyOption,
                    locationPrivacy.location_privacy_level === level && styles.privacyOptionSelected,
                  ]}
                  onPress={() => handlePrivacyLevelChange(level)}
                >
                  <View style={styles.privacyOptionLeft}>
                    <View style={[
                      styles.privacyOptionIcon,
                      locationPrivacy.location_privacy_level === level && styles.privacyOptionIconSelected
                    ]}>
                      {level === 'strict' && <Lock color={locationPrivacy.location_privacy_level === level ? "#FFFFFF" : "#64748B"} size={16} />}
                      {level === 'moderate' && <Shield color={locationPrivacy.location_privacy_level === level ? "#FFFFFF" : "#64748B"} size={16} />}
                      {level === 'open' && <Eye color={locationPrivacy.location_privacy_level === level ? "#FFFFFF" : "#64748B"} size={16} />}
                    </View>
                    <View style={styles.privacyOptionText}>
                      <Text style={[
                        styles.privacyOptionTitle,
                        locationPrivacy.location_privacy_level === level && styles.privacyOptionTitleSelected
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                      <Text style={[
                        styles.privacyOptionDescription,
                        locationPrivacy.location_privacy_level === level && styles.privacyOptionDescriptionSelected
                      ]}>
                        {getPrivacyLevelDescription(level)}
                      </Text>
                    </View>
                  </View>
                  {locationPrivacy.location_privacy_level === level && (
                    <View style={styles.privacyOptionCheck}>
                      <Text style={styles.privacyOptionCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Custom Fuzzing Radius */}
            <View style={styles.privacySection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sectionTitle}>Location Fuzzing Radius</Text>
                <View style={styles.infoIcon}>
                  <Info color="#64748B" size={16} />
                </View>
              </View>
              <Text style={styles.sliderDescription}>
                Adjust how much your pet&apos;s location is obscured for privacy
              </Text>
              
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>100m</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={5000}
                  value={fuzzingRadius}
                  onValueChange={setFuzzingRadius}
                  onSlidingComplete={handleFuzzingRadiusChange}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="#E2E8F0"
                  thumbTintColor="#FF6B6B"
                />
                <Text style={styles.sliderLabel}>5km</Text>
              </View>
              
              <Text style={styles.sliderValue}>
                Current: {fuzzingRadius >= 1000 ? `${(fuzzingRadius / 1000).toFixed(1)}km` : `${Math.round(fuzzingRadius)}m`}
              </Text>
            </View>
            
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.languageSelection')}</Text>
              <Text style={styles.modalSubtitle}>
                {t('settings.selectLanguage')}
              </Text>
            </View>
            
            <View style={styles.languageOptions}>
              <Pressable
                style={[
                  styles.languageOption,
                  language === 'tr' && styles.languageOptionSelected,
                ]}
                onPress={() => handleLanguageSelect('tr')}
              >
                <View style={styles.languageOptionLeft}>
                  <View style={[
                    styles.languageOptionIcon,
                    language === 'tr' && styles.languageOptionIconSelected
                  ]}>
                    <Text style={[
                      styles.languageFlag,
                      language === 'tr' && styles.languageFlagSelected
                    ]}>🇹🇷</Text>
                  </View>
                  <View style={styles.languageOptionText}>
                    <Text style={[
                      styles.languageOptionTitle,
                      language === 'tr' && styles.languageOptionTitleSelected
                    ]}>
                      {t('settings.turkish')}
                    </Text>
                    <Text style={[
                      styles.languageOptionDescription,
                      language === 'tr' && styles.languageOptionDescriptionSelected
                    ]}>
                      Türkiye
                    </Text>
                  </View>
                </View>
                {language === 'tr' && (
                  <View style={styles.languageOptionCheck}>
                    <Text style={styles.languageOptionCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
              
              <Pressable
                style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionSelected,
                ]}
                onPress={() => handleLanguageSelect('en')}
              >
                <View style={styles.languageOptionLeft}>
                  <View style={[
                    styles.languageOptionIcon,
                    language === 'en' && styles.languageOptionIconSelected
                  ]}>
                    <Text style={[
                      styles.languageFlag,
                      language === 'en' && styles.languageFlagSelected
                    ]}>🇺🇸</Text>
                  </View>
                  <View style={styles.languageOptionText}>
                    <Text style={[
                      styles.languageOptionTitle,
                      language === 'en' && styles.languageOptionTitleSelected
                    ]}>
                      {t('settings.english')}
                    </Text>
                    <Text style={[
                      styles.languageOptionDescription,
                      language === 'en' && styles.languageOptionDescriptionSelected
                    ]}>
                      United States
                    </Text>
                  </View>
                </View>
                {language === 'en' && (
                  <View style={styles.languageOptionCheck}>
                    <Text style={styles.languageOptionCheckText}>✓</Text>
                  </View>
                )}
              </Pressable>
            </View>
            
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <CurrencySelectionModal 
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#F2F2F7' : '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  group: {
    marginBottom: Platform.OS === 'ios' ? 35 : 32,
  },
  groupTitle: {
    fontSize: Platform.OS === 'ios' ? 13 : 14,
    fontWeight: Platform.OS === 'ios' ? '400' : '600',
    color: Platform.OS === 'ios' ? '#8E8E93' : '#64748B',
    textTransform: Platform.OS === 'ios' ? 'uppercase' : 'uppercase',
    letterSpacing: Platform.OS === 'ios' ? -0.08 : 0.5,
    paddingHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  groupContent: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: Platform.OS === 'ios' ? 16 : 20,
    borderRadius: Platform.OS === 'ios' ? 10 : 16,
    ...(Platform.OS === 'ios' ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 20,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? 'rgba(60, 60, 67, 0.29)' : '#F1F5F9',
    minHeight: Platform.OS === 'ios' ? 44 : 56,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: Platform.OS === 'ios' ? 32 : 36,
    height: Platform.OS === 'ios' ? 32 : 36,
    borderRadius: Platform.OS === 'ios' ? 8 : 18,
    backgroundColor: Platform.OS === 'ios' ? '#8B5CF6' : '#F1F5F9',
    justifyContent: "center",
    alignItems: "center",
    marginRight: Platform.OS === 'ios' ? 14 : 14,
  },
  labelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    color: Platform.OS === 'ios' ? '#000000' : '#1E293B',
    fontWeight: Platform.OS === 'ios' ? '400' : '500',
    letterSpacing: Platform.OS === 'ios' ? -0.41 : 0,
  },
  settingSubtitle: {
    fontSize: Platform.OS === 'ios' ? 15 : 14,
    color: Platform.OS === 'ios' ? '#8E8E93' : '#64748B',
    marginTop: Platform.OS === 'ios' ? 1 : 2,
    letterSpacing: Platform.OS === 'ios' ? -0.24 : 0,
  },
  destructiveLabel: {
    color: "#DC2626",
  },
  destructiveIconContainer: {
    backgroundColor: "#FEF2F2",
  },
  settingRight: {
    marginLeft: 12,
  },
  appInfo: {
    alignItems: "center",
    padding: 40,
    marginTop: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  radiusOptions: {
    marginBottom: 30,
  },
  radiusOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  radiusOptionSelected: {
    backgroundColor: "#FF6B6B",
  },
  radiusOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  radiusOptionTextSelected: {
    color: "#FFFFFF",
  },
  radiusOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  radiusOptionCheckText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  modalCloseButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  privacySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "transparent",
  },
  privacyOptionSelected: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  privacyOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  privacyOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  privacyOptionIconSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  privacyOptionText: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  privacyOptionTitleSelected: {
    color: "#FFFFFF",
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 18,
  },
  privacyOptionDescriptionSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  privacyOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  privacyOptionCheckText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginLeft: 8,
  },
  sliderDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 20,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },

  sliderLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    textAlign: "center",
  },
  languageOptions: {
    marginBottom: 30,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageOptionSelected: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  languageOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  languageOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  languageOptionIconSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  languageFlag: {
    fontSize: 20,
  },
  languageFlagSelected: {
    fontSize: 20,
  },
  languageOptionText: {
    flex: 1,
  },
  languageOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  languageOptionTitleSelected: {
    color: "#FFFFFF",
  },
  languageOptionDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 18,
  },
  languageOptionDescriptionSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  languageOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  languageOptionCheckText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
