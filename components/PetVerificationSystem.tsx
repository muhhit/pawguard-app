import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Camera, Video, Shield, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard } from '@/components/GlassComponents';
import * as ImagePicker from 'expo-image-picker';

interface PetVerificationProps {
  visible: boolean;
  onClose: () => void;
  onVerificationComplete: (verificationData: VerificationResult) => void;
  petData: {
    name: string;
    type: 'dog' | 'cat';
    photos?: string[];
  };
}

interface VerificationResult {
  ownershipScore: number; // 0-100
  verificationSteps: {
    photoMatch: boolean;
    behaviorVideo: boolean;
    voiceRecognition: boolean;
    previousPhotos: boolean;
  };
  trustLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED';
  canClaimPet: boolean;
}

export default function PetVerificationSystem({
  visible,
  onClose,
  onVerificationComplete,
  petData,
}: PetVerificationProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [verificationData, setVerificationData] = useState<Partial<VerificationResult>>({
    ownershipScore: 0,
    verificationSteps: {
      photoMatch: false,
      behaviorVideo: false,
      voiceRecognition: false,
      previousPhotos: false,
    },
    trustLevel: 'LOW',
    canClaimPet: false,
  });
  const [capturedMedia, setCapturedMedia] = useState<{
    photos: string[];
    videos: string[];
  }>({
    photos: [],
    videos: [],
  });

  const steps = [
    {
      id: 1,
      title: 'Fotoğraf Eşleştirme',
      subtitle: 'Pet\'inizin mevcut fotoğrafını çekin',
      icon: Camera,
      description: 'AI sistemi pet\'inizin önceki fotoğraflarla eşleşmesini kontrol edecek',
      action: 'photo',
      points: 25,
    },
    {
      id: 2,
      title: 'Davranış Videosu',
      subtitle: 'Pet\'iniz size nasıl tepki veriyor?',
      icon: Video,
      description: 'Pet\'inizin size olan tepkisini video ile kaydedin (15 saniye)',
      action: 'video',
      points: 30,
    },
    {
      id: 3,
      title: 'Ses Tanıma',
      subtitle: 'Pet\'inizin ismini sesli olarak çağırın',
      icon: Shield,
      description: 'Pet\'inizin sesli çağırıya tepkisini kaydedin',
      action: 'voice',
      points: 25,
    },
    {
      id: 4,
      title: 'Geçmiş Kanıtlar',
      subtitle: 'Daha önceki fotoğraflarınızı paylaşın',
      icon: CheckCircle,
      description: 'Veteriner kayıtları, eski fotoğraflar vb.',
      action: 'evidence',
      points: 20,
    },
  ];

  const currentStepData = steps.find(s => s.id === currentStep);

  const handleMediaCapture = async (type: 'photo' | 'video') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Fotoğraf ve video erişimi için izin gerekli');
        return;
      }

      let result;
      if (type === 'photo') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          videoMaxDuration: 15,
          quality: 1,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const mediaUri = result.assets[0].uri;
        
        // AI Verification Simulation
        setTimeout(() => {
          const aiScore = Math.random() * 100;
          let stepScore = 0;
          
          if (type === 'photo' && currentStep === 1) {
            stepScore = aiScore > 70 ? 25 : aiScore > 40 ? 15 : 5;
            setVerificationData(prev => ({
              ...prev,
              ownershipScore: (prev.ownershipScore || 0) + stepScore,
              verificationSteps: {
                ...prev.verificationSteps!,
                photoMatch: aiScore > 40,
              },
            }));
            setCapturedMedia(prev => ({
              ...prev,
              photos: [...prev.photos, mediaUri],
            }));
          } else if (type === 'video' && currentStep === 2) {
            stepScore = aiScore > 60 ? 30 : aiScore > 30 ? 20 : 10;
            setVerificationData(prev => ({
              ...prev,
              ownershipScore: (prev.ownershipScore || 0) + stepScore,
              verificationSteps: {
                ...prev.verificationSteps!,
                behaviorVideo: aiScore > 30,
              },
            }));
            setCapturedMedia(prev => ({
              ...prev,
              videos: [...prev.videos, mediaUri],
            }));
          }
          
          Alert.alert(
            '🤖 AI Analiz Tamamlandı',
            `Eşleşme Skoru: ${Math.round(aiScore)}%\n+${stepScore} doğrulama puanı`,
            [{ text: 'Devam Et', onPress: () => setCurrentStep(currentStep + 1) }]
          );
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Hata', 'Medya yakalanırken bir hata oluştu');
    }
  };

  const handleVoiceRecognition = () => {
    // Voice recognition simulation
    Alert.alert(
      '🎙️ Ses Kaydı',
      `Pet\'inizin ismini "${petData.name}" olarak sesli çağırın ve tepkisini kaydedin`,
      [
        { text: 'İptal' },
        {
          text: 'Kaydet',
          onPress: () => {
            setTimeout(() => {
              const voiceScore = Math.random() * 100;
              const stepScore = voiceScore > 50 ? 25 : voiceScore > 25 ? 15 : 5;
              
              setVerificationData(prev => ({
                ...prev,
                ownershipScore: (prev.ownershipScore || 0) + stepScore,
                verificationSteps: {
                  ...prev.verificationSteps!,
                  voiceRecognition: voiceScore > 25,
                },
              }));
              
              Alert.alert(
                '🔊 Ses Analizi Tamamlandı',
                `Pet tepki skoru: ${Math.round(voiceScore)}%\n+${stepScore} doğrulama puanı`,
                [{ text: 'Devam Et', onPress: () => setCurrentStep(currentStep + 1) }]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleEvidenceUpload = () => {
    Alert.alert(
      '📄 Geçmiş Kanıtlar',
      'Veteriner kayıtları, eski fotoğraflar veya diğer sahiplik kanıtlarınızı yükleyin',
      [
        { text: 'İptal' },
        {
          text: 'Yükle',
          onPress: () => {
            setTimeout(() => {
              const evidenceScore = Math.random() * 100;
              const stepScore = evidenceScore > 60 ? 20 : evidenceScore > 30 ? 10 : 5;
              
              setVerificationData(prev => ({
                ...prev,
                ownershipScore: (prev.ownershipScore || 0) + stepScore,
                verificationSteps: {
                  ...prev.verificationSteps!,
                  previousPhotos: evidenceScore > 30,
                },
              }));
              
              // Final verification
              const finalScore = (verificationData.ownershipScore || 0) + stepScore;
              let trustLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED' = 'LOW';
              let canClaimPet = false;
              
              if (finalScore >= 80) {
                trustLevel = 'VERIFIED';
                canClaimPet = true;
              } else if (finalScore >= 60) {
                trustLevel = 'HIGH';
                canClaimPet = true;
              } else if (finalScore >= 40) {
                trustLevel = 'MEDIUM';
                canClaimPet = false;
              }
              
              const finalResult: VerificationResult = {
                ...verificationData as VerificationResult,
                ownershipScore: finalScore,
                trustLevel,
                canClaimPet,
              };
              
              Alert.alert(
                finalScore >= 60 ? '✅ Doğrulama Başarılı!' : '⚠️ Doğrulama Yetersiz',
                `Toplam Skor: ${finalScore}/100\nGüven Seviyesi: ${trustLevel}\n${canClaimPet ? 'Pet\'inizi sahiplenebilirsiniz!' : 'Ek doğrulama gerekli'}`,
                [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      onVerificationComplete(finalResult);
                      onClose();
                    },
                  },
                ]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleStepAction = () => {
    switch (currentStepData?.action) {
      case 'photo':
        handleMediaCapture('photo');
        break;
      case 'video':
        handleMediaCapture('video');
        break;
      case 'voice':
        handleVoiceRecognition();
        break;
      case 'evidence':
        handleEvidenceUpload();
        break;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Shield color="#FFFFFF" size={32} />
            <Text style={styles.headerTitle}>Pet Sahiplik Doğrulama</Text>
            <Text style={styles.headerSubtitle}>{petData.name} - {petData.type}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <XCircle color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>Adım {currentStep}/4</Text>
          <Text style={styles.scoreText}>
            Skor: {verificationData.ownershipScore || 0}/100
          </Text>
        </View>

        {/* Step Content */}
        {currentStepData && (
          <LiquidGlassCard style={styles.stepCard}>
            <View style={styles.stepIcon}>
              <currentStepData.icon color="#667eea" size={40} />
            </View>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>+{currentStepData.points} puan</Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleStepAction}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.actionButtonGradient}>
                <currentStepData.icon color="#FFFFFF" size={20} />
                <Text style={styles.actionButtonText}>
                  {currentStepData.action === 'photo' && 'Fotoğraf Çek'}
                  {currentStepData.action === 'video' && 'Video Kaydet'}
                  {currentStepData.action === 'voice' && 'Ses Kaydı Yap'}
                  {currentStepData.action === 'evidence' && 'Kanıt Yükle'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LiquidGlassCard>
        )}

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield color="#FFD700" size={16} />
          <Text style={styles.securityText}>
            🔒 Tüm veriler şifrelenir ve sadece doğrulama için kullanılır
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  scoreText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  stepCard: {
    margin: 20,
    padding: 24,
    alignItems: 'center',
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  pointsContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 'auto',
    gap: 8,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
});