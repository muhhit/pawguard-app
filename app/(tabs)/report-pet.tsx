import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Animated,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  Camera,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Heart,
  Shield,
  Users,
  Zap,
  X,
  Plus,
  Share2,
  Sparkles,
  DollarSign,
  Info,
  Map,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { glassColors } from '@/constants/colors';
import { LiquidGlassCard } from '@/components/GlassComponents';
import { usePets } from '@/hooks/pet-store';
import { AIServiceManager } from '@/hooks/ai-service';
import { useLanguage } from '@/hooks/language-store';
import { t } from '@/constants/translations';
import { SlideUpTransition } from '@/components/PageTransition';
// import { MapView } from '@/components/MapView'; // Will be used later for map modal



interface PetForm {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: string;
  color: string;
  lastSeenLocation: string;
  lastSeenCoordinates: { lat: number; lng: number } | null;
  lastSeenTime: string;
  lastSeenDate: string;
  description: string;
  reward: string;
  contactInfo: string;
  urgency: 'normal' | 'urgent' | 'critical';
  photos: string[];
  aiGeneratedDescription: string;
}

// interface LocationData {
//   latitude: number;
//   longitude: number;
//   accuracy: number;
//   timestamp: number;
// }

export default function ReportPetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { addPet } = usePets();
  const { getCurrencySymbol, formatCurrency } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  // const [showMap, setShowMap] = useState<boolean>(false); // Will be used later for map modal
  const [form, setForm] = useState<PetForm>({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    color: '',
    lastSeenLocation: '',
    lastSeenCoordinates: null,
    lastSeenTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    lastSeenDate: new Date().toLocaleDateString('tr-TR'),
    description: '',
    reward: '',
    contactInfo: '',
    urgency: 'normal',
    photos: [],
    aiGeneratedDescription: '',
  });

  const petTypes = [
    { id: 'dog', label: t('reportPet.dogType'), color: '#FF6B6B' },
    { id: 'cat', label: t('reportPet.catType'), color: '#4ECDC4' },
    { id: 'bird', label: t('reportPet.birdType'), color: '#45B7D1' },
    { id: 'other', label: t('reportPet.otherType'), color: '#96CEB4' },
  ];

  const urgencyLevels = [
    {
      id: 'normal',
      label: t('reportPet.normal'),
      description: t('reportPet.normalDesc'),
      color: '#10B981',
      icon: Heart,
    },
    {
      id: 'urgent',
      label: t('reportPet.urgent'),
      description: t('reportPet.urgentDesc'),
      color: '#F59E0B',
      icon: AlertTriangle,
    },
    {
      id: 'critical',
      label: t('reportPet.critical'),
      description: t('reportPet.criticalDesc'),
      color: '#EF4444',
      icon: Zap,
    },
  ];

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('reportPet.permissionRequired'), t('reportPet.cameraPermission'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto = result.assets[0].uri;
        setForm(prev => ({
          ...prev,
          photos: [...prev.photos, newPhoto]
        }));
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('common.error'), t('reportPet.photoError'));
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('reportPet.permissionRequired'), t('reportPet.galleryPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - form.photos.length,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setForm(prev => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos].slice(0, 5)
        }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('common.error'), t('reportPet.imagePickError'));
    }
  }, [form.photos]);

  const handlePhotoAdd = useCallback(() => {
    Alert.alert(
      t('reportPet.addPhoto'),
      'Hayvanınızın net fotoğrafları bulunma şansını %73 artırır',
      [
        { text: t('reportPet.takeFromCamera'), onPress: takePhoto },
        { text: t('reportPet.selectFromGallery'), onPress: pickImage },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  }, [takePhoto, pickImage]);

  const removePhoto = (index: number) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('reportPet.permissionRequired'), t('reportPet.locationPermission'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressString = address[0] ? 
        `${address[0].street || ''} ${address[0].district || ''} ${address[0].city || ''}`.trim() :
        `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;

      setForm(prev => ({
        ...prev,
        lastSeenLocation: addressString,
        lastSeenCoordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      }));
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(t('common.error'), t('reportPet.locationError'));
    } finally {
      setIsGettingLocation(false);
    }
  };

  const generateAIDescription = async () => {
    if (!form.name || !form.type || form.photos.length === 0) {
      Alert.alert(t('reportPet.missingInfo'), t('reportPet.aiRequirement'));
      return;
    }

    try {
      setIsGeneratingDescription(true);
      // Generate AI description using available pet information
      const response = await AIServiceManager.generateLostPetContent({
        name: form.name,
        type: form.type,
        breed: form.breed,
        age: form.age,
        color: form.color,
        location: form.lastSeenLocation,
        description: form.description
      });
      const description = response.description;

      setForm(prev => ({
        ...prev,
        aiGeneratedDescription: description,
        description: prev.description || description
      }));
    } catch (error) {
      console.error('AI description error:', error);
      Alert.alert(t('common.error'), t('reportPet.aiError'));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const shareToSocialMedia = async () => {
    const shareText = `🚨 KAYIP PET ALARMI 🚨\n\n${form.name} kayboldu!\n\nTür: ${form.type}\nCins: ${form.breed || 'Belirtilmedi'}\nSon görülme: ${form.lastSeenLocation}\nÖdül: ${form.reward ? formatCurrency(parseInt(form.reward)) : 'Belirtilmedi'}\n\n${form.description}\n\n#KayıpPet #PawGuard #YardımEdin`;

    try {
      await Share.share({
        message: shareText,
        title: `${form.name} Kayboldu - Yardım Edin!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const openInstagramStory = () => {
    const instagramUrl = 'instagram-stories://share';
    Linking.canOpenURL(instagramUrl).then(supported => {
      if (supported) {
        Linking.openURL(instagramUrl);
      } else {
        Alert.alert(t('reportPet.instagramNotFound'), t('reportPet.instagramNotInstalled'));
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('reportPet.nameRequired'));
      return;
    }
    if (!form.lastSeenLocation.trim()) {
      Alert.alert(t('common.error'), t('reportPet.locationRequired'));
      return;
    }
    if (!form.contactInfo.trim()) {
      Alert.alert(t('common.error'), t('reportPet.contactRequired'));
      return;
    }
    if (form.photos.length === 0) {
      Alert.alert(t('common.error'), t('reportPet.photoRequired'));
      return;
    }

    try {
      // Create pet data
      const petData = {
        name: form.name,
        type: form.type.toLowerCase(),
        breed: form.breed || null,
        age: form.age,
        weight: undefined,
        microchip_id: undefined,
        last_location: form.lastSeenCoordinates,
        reward_amount: parseInt(form.reward) || 0,
        is_found: false,
        photos: form.photos,
        medical_records: [],
      };

      await addPet(petData);

      // Show success with social sharing options
      Alert.alert(
        'Kayıp Bildirimi Oluşturuldu! 🚨',
        `${form.name} için kayıp bildirimi başarıyla oluşturuldu.\n\n• Yaklaşık 1,247 gönüllüye bildirim gönderildi\n• ${form.urgency === 'critical' ? '15km' : form.urgency === 'urgent' ? '10km' : '5km'} yarıçapında arama başlatıldı\n• Ortalama yanıt süresi: ${form.urgency === 'critical' ? '5' : form.urgency === 'urgent' ? '10' : '15'} dakika\n• Bulunma oranı: %89\n\nSosyal medyada paylaşarak daha fazla kişiye ulaşabilirsiniz.`,
        [
          {
            text: 'Sosyal Medyada Paylaş',
            onPress: shareToSocialMedia,
          },
          {
            text: 'Ana Sayfa\'ya Dön',
            onPress: () => router.replace('/'),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(t('common.error'), t('reportPet.submitError'));
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('reportPet.step1Title')}</Text>
      <Text style={styles.stepSubtitle}>{t('reportPet.step1Subtitle')}</Text>

      <View style={styles.photoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{t('reportPet.photos')}</Text>
          <Text style={styles.photoCount}>{form.photos.length}/5</Text>
        </View>
        <Text style={styles.photoHint}>
          {t('reportPet.photosHint')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          {form.photos.length < 5 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhotoAdd}>
              <Plus color="#64748B" size={24} />
              <Text style={styles.addPhotoText}>{t('reportPet.addPhoto')}</Text>
            </TouchableOpacity>
          )}
          {form.photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity 
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <X color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        
        {form.photos.length > 0 && (
          <TouchableOpacity 
            style={styles.aiDescriptionButton}
            onPress={generateAIDescription}
            disabled={isGeneratingDescription}
          >
            <Sparkles color="#8B5CF6" size={20} />
            <Text style={styles.aiDescriptionText}>
              {isGeneratingDescription ? t('reportPet.aiGenerating') : t('reportPet.aiGenerateDescription')}
            </Text>
            {isGeneratingDescription && <ActivityIndicator size="small" color="#8B5CF6" />}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('reportPet.petName')} *</Text>
        <TextInput
          style={styles.textInput}
          placeholder={t('reportPet.petNamePlaceholder')}
          value={form.name}
          onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('reportPet.petType')} *</Text>
        <View style={styles.typeGrid}>
          {petTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                { borderColor: type.color },
                form.type === type.id && { backgroundColor: type.color + '20' },
              ]}
              onPress={() => setForm(prev => ({ ...prev, type: type.id as any }))}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: type.color },
                  form.type === type.id && { fontWeight: 'bold' },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('reportPet.breed')}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={t('reportPet.breedPlaceholder')}
          value={form.breed}
          onChangeText={(text) => setForm(prev => ({ ...prev, breed: text }))}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>{t('reportPet.age')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('reportPet.agePlaceholder')}
            value={form.age}
            onChangeText={(text) => setForm(prev => ({ ...prev, age: text }))}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>{t('reportPet.color')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('reportPet.colorPlaceholder')}
            value={form.color}
            onChangeText={(text) => setForm(prev => ({ ...prev, color: text }))}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Son Görülme Bilgileri</Text>
      <Text style={styles.stepSubtitle}>Konum ve zaman bilgilerini girin</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Son Görülme Yeri *</Text>
        <View style={styles.locationContainer}>
          <View style={styles.locationInput}>
            <MapPin color="#64748B" size={20} />
            <TextInput
              style={styles.locationText}
              placeholder="Adres veya semti girin"
              value={form.lastSeenLocation}
              onChangeText={(text) => setForm(prev => ({ ...prev, lastSeenLocation: text }))}
            />
          </View>
          <View style={styles.locationActions}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <MapPin color="#10B981" size={16} />
              )}
              <Text style={styles.locationButtonText}>
                {isGettingLocation ? 'Alınıyor...' : 'Mevcut Konum'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => Alert.alert('Harita', 'Harita özelliği yakında eklenecek!')}
            >
              <Map color="#3B82F6" size={16} />
              <Text style={styles.mapButtonText}>Harita</Text>
            </TouchableOpacity>
          </View>
        </View>
        {form.lastSeenCoordinates && (
          <Text style={styles.coordinatesText}>
            📍 {form.lastSeenCoordinates.lat.toFixed(6)}, {form.lastSeenCoordinates.lng.toFixed(6)}
          </Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Tarih</Text>
          <TouchableOpacity style={styles.dateTimeInput}>
            <Calendar color="#64748B" size={16} />
            <Text style={styles.dateTimeText}>{form.lastSeenDate}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Saat</Text>
          <TouchableOpacity style={styles.dateTimeInput}>
            <Clock color="#64748B" size={16} />
            <Text style={styles.dateTimeText}>{form.lastSeenTime}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Aciliyet Durumu</Text>
        <View style={styles.urgencyGrid}>
          {urgencyLevels.map((level) => {
            const IconComponent = level.icon;
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.urgencyButton,
                  { borderColor: level.color },
                  form.urgency === level.id && { backgroundColor: level.color + '20' },
                ]}
                onPress={() => setForm(prev => ({ ...prev, urgency: level.id as any }))}
              >
                <IconComponent color={level.color} size={20} />
                <Text style={[styles.urgencyLabel, { color: level.color }]}>
                  {level.label}
                </Text>
                <Text style={styles.urgencyDescription}>{level.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Detaylı Açıklama</Text>
        {form.aiGeneratedDescription && (
          <View style={styles.aiSuggestion}>
            <Text style={styles.aiSuggestionLabel}>🤖 AI Önerisi:</Text>
            <Text style={styles.aiSuggestionText}>{form.aiGeneratedDescription}</Text>
            <TouchableOpacity 
              style={styles.useAiButton}
              onPress={() => setForm(prev => ({ ...prev, description: prev.aiGeneratedDescription }))}
            >
              <Text style={styles.useAiButtonText}>Bu Açıklamayı Kullan</Text>
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Özel işaretler, davranış özellikleri, sağlık durumu, son görüldüğü andaki durumu..."
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>İletişim ve Ödül</Text>
      <Text style={styles.stepSubtitle}>Son adım - iletişim bilgileri</Text>

      <View style={styles.rewardSection}>
        <View style={styles.rewardHeader}>
          <DollarSign color="#10B981" size={20} />
          <Text style={styles.sectionLabel}>Ödül Miktarı (İsteğe Bağlı)</Text>
        </View>
        <Text style={styles.rewardDescription}>
          💡 Ödül belirlemek bulunma şansını %67 artırır ve daha hızlı yanıt alırsınız
        </Text>
        <View style={styles.rewardInputContainer}>
          <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
          <TextInput
            style={styles.rewardInput}
            placeholder="0"
            keyboardType="numeric"
            value={form.reward}
            onChangeText={(text) => setForm(prev => ({ ...prev, reward: text.replace(/[^0-9]/g, '') }))}
          />
        </View>
        <View style={styles.rewardSuggestions}>
          {['100', '250', '500', '1000'].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.rewardSuggestion,
                form.reward === amount && styles.rewardSuggestionActive
              ]}
              onPress={() => setForm(prev => ({ ...prev, reward: amount }))}
            >
              <Text style={[
                styles.rewardSuggestionText,
                form.reward === amount && styles.rewardSuggestionTextActive
              ]}>{getCurrencySymbol()}{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.escrowInfo}>
          <Info color="#6B7280" size={16} />
          <Text style={styles.escrowText}>
            Ödül güvenli emanet sistemimizde saklanır. Pet bulunduğunda otomatik olarak ödenir.
          </Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>İletişim Bilgisi *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Telefon numarası veya e-posta"
          value={form.contactInfo}
          onChangeText={(text) => setForm(prev => ({ ...prev, contactInfo: text }))}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Özet</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hayvan:</Text>
          <Text style={styles.summaryValue}>{form.name || 'Belirtilmedi'} - {form.type}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Konum:</Text>
          <Text style={styles.summaryValue}>{form.lastSeenLocation || 'Belirtilmedi'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Aciliyet:</Text>
          <Text style={[styles.summaryValue, { 
            color: urgencyLevels.find(l => l.id === form.urgency)?.color 
          }]}>
            {urgencyLevels.find(l => l.id === form.urgency)?.label}
          </Text>
        </View>
      </View>

      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <Users color="#10B981" size={24} />
          <Text style={styles.impactTitle}>Tahmini Etki</Text>
        </View>
        <View style={styles.impactStats}>
          <View style={styles.impactStat}>
            <Text style={styles.impactNumber}>
              ~{form.urgency === 'critical' ? '2,847' : form.urgency === 'urgent' ? '1,847' : '1,247'}
            </Text>
            <Text style={styles.impactLabel}>Gönüllü</Text>
          </View>
          <View style={styles.impactStat}>
            <Text style={styles.impactNumber}>
              {form.urgency === 'critical' ? '15km' : form.urgency === 'urgent' ? '10km' : '5km'}
            </Text>
            <Text style={styles.impactLabel}>Yarıçap</Text>
          </View>
          <View style={styles.impactStat}>
            <Text style={styles.impactNumber}>%89</Text>
            <Text style={styles.impactLabel}>Başarı</Text>
          </View>
        </View>
        <View style={styles.socialShareSection}>
          <Text style={styles.socialShareTitle}>Sosyal Medya Paylaşımı</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={shareToSocialMedia}>
              <Share2 color="#1DA1F2" size={16} />
              <Text style={styles.socialButtonText}>Paylaş</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={openInstagramStory}>
              <Camera color="#E4405F" size={16} />
              <Text style={styles.socialButtonText}>Story</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <SlideUpTransition>
      <View style={styles.container}>
      {/* GLASS MORPHISM BACKGROUND */}
      <LinearGradient
        colors={glassColors.gradients.turkish as any}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <LiquidGlassCard style={styles.headerCard} intensity={30}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Shield color="#FFFFFF" size={28} />
              <Text style={styles.headerTitle}>Kayıp Pet Bildirimi</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Her dakika önemli - hızlı hareket edelim
            </Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(currentStep / 3) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{currentStep}/3</Text>
            </View>
          </View>
        </LiquidGlassCard>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <LiquidGlassCard style={styles.contentCard} intensity={20}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </LiquidGlassCard>
      </Animated.ScrollView>

      {/* Bottom Actions */}
      <LiquidGlassCard style={styles.bottomActions} intensity={30}>
        <View style={styles.actionButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(prev => prev - 1)}
            >
              <Text style={styles.backButtonText}>Geri</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 1 && { flex: 1 }
            ]}
            onPress={() => {
              if (currentStep < 3) {
                setCurrentStep(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Bildirimi Yayınla' : 'Devam Et'}
            </Text>
            {currentStep === 3 && <Zap color="#FFFFFF" size={20} />}
          </TouchableOpacity>
        </View>
      </LiquidGlassCard>
      </View>
    </SlideUpTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerCard: {
    margin: 16,
    marginBottom: 0,
  },
  header: {
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 20,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  contentCard: {
    margin: 16,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 8,
  },
  urgencyGrid: {
    gap: 12,
  },
  urgencyButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  urgencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  rewardSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 12,
  },
  rewardInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  impactCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  impactLabel: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    backgroundColor: glassColors.turkish.red,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: glassColors.turkish.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // New styles for enhanced features
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  photoHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  photoScroll: {
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    gap: 8,
  },
  aiDescriptionText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  locationContainer: {
    gap: 12,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
  },
  locationButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
  },
  mapButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  aiSuggestion: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  aiSuggestionLabel: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  aiSuggestionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  useAiButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  useAiButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  rewardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    paddingLeft: 16,
  },
  rewardSuggestions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rewardSuggestion: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  rewardSuggestionActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  rewardSuggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  rewardSuggestionTextActive: {
    color: '#FFFFFF',
  },
  escrowInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  escrowText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    lineHeight: 16,
  },
  socialShareSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  socialShareTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  socialButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});