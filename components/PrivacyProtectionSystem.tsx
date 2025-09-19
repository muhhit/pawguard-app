import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Shield, Eye, EyeOff, MapPin, Users, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard } from '@/components/GlassComponents';

interface PrivacyLevel {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  radiusBlur: number; // meters
  whoCanSee: string;
  trustRequirement: number; // 0-100
}

interface PrivacyProtectionProps {
  userTrustScore: number;
  petType: 'owned' | 'street';
  onPrivacyChange: (level: PrivacyLevel) => void;
  currentLevel?: PrivacyLevel;
}

export default function PrivacyProtectionSystem({
  userTrustScore,
  petType,
  onPrivacyChange,
  currentLevel,
}: PrivacyProtectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<PrivacyLevel | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const privacyLevels: PrivacyLevel[] = [
    {
      id: 'public',
      name: 'Herkese Açık',
      description: 'Tam konum herkese görünür (Sadece sahipli hayvanlar için)',
      icon: Eye,
      color: '#EF4444',
      radiusBlur: 0,
      whoCanSee: 'Tüm kullanıcılar',
      trustRequirement: 0,
    },
    {
      id: 'community',
      name: 'Mahalle Topluluğu',
      description: '500m yarıçapında bulanık konum, sadece yakın kullanıcılar',
      icon: Users,
      color: '#F59E0B',
      radiusBlur: 500,
      whoCanSee: '2km çevredeki kullanıcılar',
      trustRequirement: 30,
    },
    {
      id: 'trusted',
      name: 'Güvenilir Kullanıcılar',
      description: 'Sadece doğrulanmış gönüllüler tam konumu görebilir',
      icon: Shield,
      color: '#10B981',
      radiusBlur: 250,
      whoCanSee: 'Trust score >70 olan kullanıcılar',
      trustRequirement: 70,
    },
    {
      id: 'protected',
      name: 'Maksimum Koruma',
      description: '1km yarıçapında bulanık, sadece veterinerler ve yetkili STK\'lar',
      icon: Lock,
      color: '#8B5CF6',
      radiusBlur: 1000,
      whoCanSee: 'Veterinerler ve yetkili STK\'lar',
      trustRequirement: 90,
    },
  ];

  // Street animals default to protected mode
  const availableLevels = petType === 'street' 
    ? privacyLevels.filter(level => level.id !== 'public')
    : privacyLevels;

  const recommendedLevel = React.useMemo(() => {
    if (petType === 'street') {
      return privacyLevels.find(l => l.id === 'protected')!;
    }
    
    if (userTrustScore >= 80) {
      return privacyLevels.find(l => l.id === 'trusted')!;
    } else if (userTrustScore >= 50) {
      return privacyLevels.find(l => l.id === 'community')!;
    } else {
      return privacyLevels.find(l => l.id === 'community')!;
    }
  }, [userTrustScore, petType]);

  useEffect(() => {
    if (!currentLevel) {
      setSelectedLevel(recommendedLevel);
      onPrivacyChange(recommendedLevel);
    } else {
      setSelectedLevel(currentLevel);
    }
  }, [recommendedLevel, currentLevel]);

  const handleLevelSelect = (level: PrivacyLevel) => {
    // Security check for street animals
    if (petType === 'street' && level.id === 'public') {
      Alert.alert(
        '🚫 Güvenlik Uyarısı',
        'Sokak hayvanları için tam konum paylaşımı güvenlik riski oluşturabilir. Daha güvenli bir seviye seçin.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Trust score check
    if (userTrustScore < level.trustRequirement && level.id === 'trusted') {
      Alert.alert(
        '⚠️ Yetersiz Güven Skoru',
        `Bu seviye için en az ${level.trustRequirement} güven skoru gerekli. Mevcut skorunuz: ${userTrustScore}`,
        [{ text: 'Tamam' }]
      );
      return;
    }

    setSelectedLevel(level);
    onPrivacyChange(level);

    // Show confirmation for high-risk selections
    if (level.id === 'public') {
      Alert.alert(
        '🔍 Tam Konum Paylaşımı',
        'Pet\'inizin tam konumu herkese görünür olacak. Emin misiniz?',
        [
          { text: 'İptal', onPress: () => setSelectedLevel(recommendedLevel) },
          { text: 'Eminim', style: 'destructive' },
        ]
      );
    }
  };

  const getMaliciousUserWarning = () => {
    if (petType === 'street' && selectedLevel?.radiusBlur && selectedLevel.radiusBlur < 500) {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Güvenlik Uyarısı</Text>
          <Text style={styles.warningText}>
            Sokak hayvanları için düşük gizlilik seviyesi kötü niyetli kişiler tarafından 
            istismar edilebilir. Hayvanların güvenliği için daha yüksek koruma öneririz.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <LiquidGlassCard style={styles.headerCard}>
        <View style={styles.header}>
          <Shield color="#667eea" size={24} />
          <Text style={styles.headerTitle}>Gizlilik & Güvenlik</Text>
          <Text style={styles.headerSubtitle}>
            {petType === 'street' ? 'Sokak Hayvanı' : 'Sahipli Pet'} Koruma Seviyesi
          </Text>
        </View>
        
        <View style={styles.trustScore}>
          <Text style={styles.trustLabel}>Güven Skorunuz:</Text>
          <Text style={[styles.trustValue, { 
            color: userTrustScore >= 70 ? '#10B981' : userTrustScore >= 40 ? '#F59E0B' : '#EF4444' 
          }]}>
            {userTrustScore}/100
          </Text>
        </View>
      </LiquidGlassCard>

      {/* Recommended Badge */}
      <View style={styles.recommendedBadge}>
        <Text style={styles.recommendedText}>
          ✨ Önerilen: {recommendedLevel.name}
        </Text>
      </View>

      {/* Privacy Levels */}
      <View style={styles.levelsContainer}>
        {availableLevels.map((level) => {
          const IconComponent = level.icon;
          const isSelected = selectedLevel?.id === level.id;
          const isRecommended = level.id === recommendedLevel.id;
          const isAccessible = userTrustScore >= level.trustRequirement;

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                isSelected && styles.levelCardSelected,
                !isAccessible && styles.levelCardDisabled,
              ]}
              onPress={() => isAccessible && handleLevelSelect(level)}
              disabled={!isAccessible}
            >
              <LinearGradient
                colors={isSelected ? [level.color, level.color + '80'] : ['#FFFFFF', '#F8FAFC']}
                style={styles.levelGradient}
              >
                <View style={styles.levelHeader}>
                  <View style={[styles.levelIcon, { backgroundColor: level.color + '20' }]}>
                    <IconComponent 
                      color={isSelected ? '#FFFFFF' : level.color} 
                      size={20} 
                    />
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={[
                      styles.levelName,
                      isSelected && styles.levelNameSelected,
                    ]}>
                      {level.name}
                      {isRecommended && ' ⭐'}
                    </Text>
                    <Text style={[
                      styles.levelDescription,
                      isSelected && styles.levelDescriptionSelected,
                    ]}>
                      {level.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.levelDetails}>
                  <View style={styles.levelDetail}>
                    <MapPin size={12} color={isSelected ? '#FFFFFF' : '#64748B'} />
                    <Text style={[
                      styles.levelDetailText,
                      isSelected && styles.levelDetailTextSelected,
                    ]}>
                      {level.radiusBlur > 0 ? `~${level.radiusBlur}m bulanık` : 'Tam konum'}
                    </Text>
                  </View>
                  <View style={styles.levelDetail}>
                    <Users size={12} color={isSelected ? '#FFFFFF' : '#64748B'} />
                    <Text style={[
                      styles.levelDetailText,
                      isSelected && styles.levelDetailTextSelected,
                    ]}>
                      {level.whoCanSee}
                    </Text>
                  </View>
                </View>

                {!isAccessible && (
                  <View style={styles.lockOverlay}>
                    <Lock color="#EF4444" size={16} />
                    <Text style={styles.lockText}>
                      Gereken güven skoru: {level.trustRequirement}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Malicious User Warning */}
      {getMaliciousUserWarning()}

      {/* Advanced Settings Toggle */}
      <View style={styles.advancedToggle}>
        <Text style={styles.advancedLabel}>Gelişmiş Ayarlar</Text>
        <Switch
          value={showAdvanced}
          onValueChange={setShowAdvanced}
          trackColor={{ false: '#E2E8F0', true: '#667eea' }}
          thumbColor={showAdvanced ? '#FFFFFF' : '#94A3B8'}
        />
      </View>

      {/* Advanced Settings */}
      {showAdvanced && (
        <LiquidGlassCard style={styles.advancedCard}>
          <Text style={styles.advancedTitle}>🔧 Gelişmiş Güvenlik</Text>
          <View style={styles.advancedOptions}>
            <View style={styles.advancedOption}>
              <Text style={styles.optionLabel}>Konum geçmişi sakla</Text>
              <Switch 
                value={true} 
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              />
            </View>
            <View style={styles.advancedOption}>
              <Text style={styles.optionLabel}>Şüpheli aktivite bildirimi</Text>
              <Switch 
                value={true} 
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              />
            </View>
            <View style={styles.advancedOption}>
              <Text style={styles.optionLabel}>Veteriner otomatik erişimi</Text>
              <Switch 
                value={false} 
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              />
            </View>
          </View>
        </LiquidGlassCard>
      )}

      {/* Security Tips */}
      <View style={styles.securityTips}>
        <Text style={styles.tipsTitle}>🛡️ Güvenlik İpuçları</Text>
        <Text style={styles.tipText}>
          • Sokak hayvanları için her zaman yüksek koruma seviyesi seçin{'\n'}
          • Şüpheli kullanıcıları hemen bildirin{'\n'}
          • Pet'inizin fotoğraflarında kişisel bilgiler bulunmasın{'\n'}
          • Buluşma yerlerini güvenli, kalabalık yerler seçin
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  trustScore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  trustLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  trustValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendedBadge: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendedText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  levelsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  levelCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelCardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  levelCardDisabled: {
    opacity: 0.6,
  },
  levelGradient: {
    padding: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  levelNameSelected: {
    color: '#FFFFFF',
  },
  levelDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  levelDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  levelDetails: {
    gap: 6,
  },
  levelDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelDetailText: {
    fontSize: 11,
    color: '#64748B',
  },
  levelDetailTextSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  advancedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  advancedCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  advancedOptions: {
    gap: 12,
  },
  advancedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  securityTips: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#075985',
    lineHeight: 18,
  },
});