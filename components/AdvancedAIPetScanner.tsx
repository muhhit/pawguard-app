import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAIPetRecognition } from '../hooks/useAIPetRecognition';
import { LiquidGlassCard as GlassCard } from './GlassComponents';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScanMode {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string[];
}

const scanModes: ScanMode[] = [
  {
    id: 'breed',
    title: 'Cins Tanıma',
    icon: 'paw',
    description: '99.2% doğruluk',
    color: ['#667EEA', '#764BA2'],
  },
  {
    id: 'health',
    title: 'Sağlık Tarama',
    icon: 'medical',
    description: 'Veteriner AI',
    color: ['#4ECDC4', '#44A08D'],
  },
  {
    id: 'lost',
    title: 'Kayıp Eşleştir',
    icon: 'search',
    description: 'Yüz tanıma',
    color: ['#FF6B6B', '#FF5252'],
  },
  {
    id: 'batch',
    title: 'Toplu Tarama',
    icon: 'images',
    description: 'Çoklu işlem',
    color: ['#FFD700', '#FFC107'],
  },
];

export default function AdvancedAIPetScanner() {

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [activeMode, setActiveMode] = useState<string>('breed');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const scanAnimation = useSharedValue(0);
  const confidenceAnimation = useSharedValue(0);
  
  const {
    isScanning,
    isProcessing,
    result,
    error,
    confidence,
    processingTime,

    processImage,
    processBatch,
    clearResult,
  } = useAIPetRecognition();

  useEffect(() => {
    // Scanning animation
    if (isScanning) {
      scanAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false
      );
    } else {
      scanAnimation.value = 0;
    }
  }, [isScanning, scanAnimation]);

  useEffect(() => {
    // Confidence animation
    if (result) {
      confidenceAnimation.value = withSpring(confidence);
    }
  }, [result, confidence, confidenceAnimation]);

  const scanAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scanAnimation.value,
          [0, 1],
          [-SCREEN_HEIGHT * 0.4, SCREEN_HEIGHT * 0.4],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      scanAnimation.value,
      [0, 0.5, 1],
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    ),
  }));

  const confidenceAnimStyle = useAnimatedStyle(() => ({
    width: `${confidenceAnimation.value * 100}%`,
  }));

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setShowResults(true);
        
        // Process the image based on active mode
        const options = {
          enableBreedIdentification: activeMode === 'breed' || activeMode === 'batch',
          enableHealthAssessment: activeMode === 'health' || activeMode === 'batch',
          enableLostPetMatching: activeMode === 'lost' || activeMode === 'batch',
          realTimeMode: false,
        };

        await processImage(photo.uri, options);
      }
    } catch (error) {
      console.error('Capture failed:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi');
    }
  };

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: activeMode === 'batch',
      });

      if (!result.canceled && result.assets.length > 0) {
        if (activeMode === 'batch' && result.assets.length > 1) {
          // Batch processing
          const imageUris = result.assets.map(asset => asset.uri);
          await processBatch(imageUris);
        } else {
          // Single image processing
          const imageUri = result.assets[0].uri;
          setCapturedImage(imageUri);
          setShowResults(true);
          
          const options = {
            enableBreedIdentification: activeMode === 'breed',
            enableHealthAssessment: activeMode === 'health',
            enableLostPetMatching: activeMode === 'lost',
          };

          await processImage(imageUri, options);
        }
      }
    } catch (error) {
      console.error('Gallery pick failed:', error);
      Alert.alert('Hata', 'Galeri açılamadı');
    }
  };

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    clearResult();
    setShowResults(false);
    setCapturedImage(null);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const ScanModeSelector = () => (
    <View style={styles.modeSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {scanModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeCard,
              activeMode === mode.id && styles.modeCardActive,
            ]}
            onPress={() => handleModeChange(mode.id)}
          >
            <LinearGradient
              colors={activeMode === mode.id ? mode.color as [string, string] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.modeCardGradient}
            >
              <MaterialCommunityIcons
                name={mode.icon as any}
                size={24}
                color={activeMode === mode.id ? '#FFF' : '#AAA'}
              />
              <Text style={[
                styles.modeTitle,
                activeMode === mode.id && styles.modeTitleActive,
              ]}>
                {mode.title}
              </Text>
              <Text style={[
                styles.modeDescription,
                activeMode === mode.id && styles.modeDescriptionActive,
              ]}>
                {mode.description}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ScanOverlay = () => (
    <View style={styles.scanOverlay}>
      {/* Scanning frame */}
      <View style={styles.scanFrame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        
        {/* Animated scan line */}
        {isScanning && (
          <Animated.View style={[styles.scanLine, scanAnimStyle]} />
        )}
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <BlurView intensity={70} style={styles.instructionsBlur}>
          <Text style={styles.instructionsText}>
            {activeMode === 'breed' && 'Evcil hayvanı çerçeve içine alın'}
            {activeMode === 'health' && 'Net bir profil fotoğrafı çekin'}
            {activeMode === 'lost' && 'Yüz bölgesini net gösterin'}
            {activeMode === 'batch' && 'Birden fazla hayvan olabilir'}
          </Text>
        </BlurView>
      </View>
    </View>
  );

  const ResultsPanel = () => {
    if (!result || !showResults) return null;

    return (
      <View style={styles.resultsPanel}>
        <BlurView intensity={90} style={styles.resultsPanelBlur}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.resultsHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowResults(false);
                  clearResult();
                  setCapturedImage(null);
                }}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.resultsTitle}>Analiz Sonucu</Text>
              <View style={styles.processingTime}>
                <Text style={styles.processingTimeText}>{processingTime}ms</Text>
              </View>
            </View>

            {/* Captured Image */}
            {capturedImage && (
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            )}

            {/* Confidence Bar */}
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Güven Skoru</Text>
              <View style={styles.confidenceBar}>
                <Animated.View style={[styles.confidenceFill, confidenceAnimStyle]} />
              </View>
              <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
            </View>

            {/* Breed Information */}
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name="paw" size={24} color="#667EEA" />
                <Text style={styles.resultCardTitle}>Cins Bilgisi</Text>
              </View>
              <Text style={styles.breedName}>{result.breed}</Text>
              <Text style={styles.speciesText}>
                {result.species === 'dog' ? '🐕 Köpek' : 
                 result.species === 'cat' ? '🐱 Kedi' : 
                 result.species === 'bird' ? '🐦 Kuş' : '🐾 Diğer'}
              </Text>
              {result.turkishBreed && (
                <View style={styles.turkishBadge}>
                  <Text style={styles.turkishBadgeText}>🇹🇷 Türk Irkı</Text>
                </View>
              )}
            </GlassCard>

            {/* Characteristics */}
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <MaterialCommunityIcons name="information" size={24} color="#4ECDC4" />
                <Text style={styles.resultCardTitle}>Özellikler</Text>
              </View>
              <View style={styles.characteristicsGrid}>
                <View style={styles.characteristicItem}>
                  <Text style={styles.characteristicLabel}>Boyut</Text>
                  <Text style={styles.characteristicValue}>
                    {result.characteristics.size === 'small' ? 'Küçük' :
                     result.characteristics.size === 'medium' ? 'Orta' : 'Büyük'}
                  </Text>
                </View>
                <View style={styles.characteristicItem}>
                  <Text style={styles.characteristicLabel}>Yaş</Text>
                  <Text style={styles.characteristicValue}>{result.characteristics.age}</Text>
                </View>
                <View style={styles.characteristicItem}>
                  <Text style={styles.characteristicLabel}>Tüy</Text>
                  <Text style={styles.characteristicValue}>{result.characteristics.coat}</Text>
                </View>
                <View style={styles.characteristicItem}>
                  <Text style={styles.characteristicLabel}>Renk</Text>
                  <Text style={styles.characteristicValue}>
                    {result.characteristics.color.join(', ')}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Health Assessment */}
            {result.healthAssessment && (
              <GlassCard style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons name="medical-bag" size={24} color="#FF6B6B" />
                  <Text style={styles.resultCardTitle}>Sağlık Değerlendirmesi</Text>
                </View>
                <View style={styles.healthStatus}>
                  <Text style={styles.healthStatusText}>
                    {result.healthAssessment.overallHealth === 'excellent' ? '🟢 Mükemmel' :
                     result.healthAssessment.overallHealth === 'good' ? '🟡 İyi' :
                     result.healthAssessment.overallHealth === 'fair' ? '🟠 Orta' :
                     result.healthAssessment.overallHealth === 'poor' ? '🔴 Zayıf' : '⚠️ Endişeli'}
                  </Text>
                </View>
                {result.healthAssessment.recommendations.length > 0 && (
                  <View style={styles.recommendations}>
                    <Text style={styles.recommendationsTitle}>Öneriler:</Text>
                    {result.healthAssessment.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
                    ))}
                  </View>
                )}
                {result.healthAssessment.veterinaryConsultation && (
                  <View style={styles.vetWarning}>
                    <Text style={styles.vetWarningText}>
                      ⚠️ Veteriner konsültasyonu önerilir
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* Lost Pet Matches */}
            {result.lostPetMatches && result.lostPetMatches.length > 0 && (
              <GlassCard style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons name="magnify" size={24} color="#FFD700" />
                  <Text style={styles.resultCardTitle}>Kayıp Eşleşmeleri</Text>
                </View>
                {result.lostPetMatches.map((match, index) => (
                  <View key={index} style={styles.matchItem}>
                    <Image source={{ uri: match.imageUrl }} style={styles.matchImage} />
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchName}>{match.petName}</Text>
                      <Text style={styles.matchLocation}>{match.location}</Text>
                      <Text style={styles.matchSimilarity}>
                        {Math.round(match.similarity * 100)}% benzerlik
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.contactButton}>
                      <Text style={styles.contactButtonText}>İletişim</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </GlassCard>
            )}
          </ScrollView>
        </BlurView>
      </View>
    );
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A2E', '#0F0F1E']}
          style={styles.permissionContainer}
        >
          <MaterialCommunityIcons name="camera" size={80} color="#667EEA" />
          <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
          <Text style={styles.permissionText}>
            AI pet scanner için kamera erişimi gerekiyor
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>İzin Ver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Mode Selector */}
        <ScanModeSelector />
        
        {/* Scan Overlay */}
        <ScanOverlay />
        
        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleGalleryPick}>
            <BlurView intensity={70} style={styles.controlButtonBlur}>
              <Ionicons name="images" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonProcessing]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? ['#666', '#444'] : ['#667EEA', '#764BA2']}
              style={styles.captureButtonGradient}
            >
              {isProcessing ? (
                <MaterialCommunityIcons name="loading" size={32} color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="camera" size={32} color="#FFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <BlurView intensity={70} style={styles.controlButtonBlur}>
              <Ionicons name="camera-reverse" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
        </View>
        
        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingIndicator}>
            <BlurView intensity={90} style={styles.processingBlur}>
              <MaterialCommunityIcons name="brain" size={32} color="#667EEA" />
              <Text style={styles.processingText}>AI Analiz Ediliyor...</Text>
            </BlurView>
          </View>
        )}
        
        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <BlurView intensity={90} style={styles.errorBlur}>
              <Ionicons name="warning" size={24} color="#FF5252" />
              <Text style={styles.errorText}>{error}</Text>
            </BlurView>
          </View>
        )}
      </CameraView>
      
      {/* Results Panel */}
      <ResultsPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    marginTop: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modeSelector: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modeCard: {
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeCardActive: {
    transform: [{ scale: 1.05 }],
  },
  modeCardGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  modeTitle: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
    fontWeight: '600',
  },
  modeTitleActive: {
    color: '#FFF',
  },
  modeDescription: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  modeDescriptionActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#667EEA',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#667EEA',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
  },
  instructionsBlur: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  instructionsText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureButtonProcessing: {
    opacity: 0.7,
  },
  captureButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingIndicator: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    marginTop: -40,
  },
  processingBlur: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  errorContainer: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
  },
  errorBlur: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.2)',
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  resultsPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  resultsPanelBlur: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.95)',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  processingTime: {
    backgroundColor: 'rgba(102,126,234,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  processingTimeText: {
    color: '#667EEA',
    fontSize: 12,
    fontWeight: '600',
  },
  capturedImage: {
    width: SCREEN_WIDTH - 40,
    height: 200,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  confidenceContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  confidenceLabel: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  confidenceText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'right',
  },
  resultCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultCardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  breedName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  speciesText: {
    color: '#AAA',
    fontSize: 16,
    marginBottom: 12,
  },
  turkishBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  turkishBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  characteristicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  characteristicItem: {
    width: '50%',
    marginBottom: 12,
  },
  characteristicLabel: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
  },
  characteristicValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  healthStatus: {
    marginBottom: 16,
  },
  healthStatusText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  recommendations: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
  },
  recommendationItem: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  vetWarning: {
    backgroundColor: 'rgba(255,82,82,0.2)',
    padding: 12,
    borderRadius: 8,
  },
  vetWarningText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  matchImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  matchName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  matchLocation: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  matchSimilarity: {
    color: '#4ECDC4',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});