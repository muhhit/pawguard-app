import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { petVisionService, PetRecognitionResult, HealthAssessment, VisionOptions, BatchProcessingResult, MatchingPet } from '../services/petVisionService';

export interface UseAIPetRecognitionOptions {
  enableHealthAssessment?: boolean;
  enableBreedIdentification?: boolean;
  enableLostPetMatching?: boolean;
  priority?: 'speed' | 'accuracy';
  useEdgeML?: boolean;
  enableHaptics?: boolean;
}

export interface RecognitionState {
  isScanning: boolean;
  isProcessing: boolean;
  result: PetRecognitionResult | null;
  error: string | null;
  confidence: number;
  processingTime: number;
  progress: number;
}

export interface BatchRecognitionState {
  isProcessing: boolean;
  results: PetRecognitionResult[];
  progress: number;
  totalImages: number;
  successCount: number;
  errors: string[];
  processingTime: number;
}

export interface ScanOptions {
  enableHealthAssessment?: boolean;
  enableBreedIdentification?: boolean;
  enableLostPetMatching?: boolean;
  batchMode?: boolean;
  realTimeMode?: boolean;
  priority?: 'speed' | 'accuracy';
}

export const useAIPetRecognition = (options: UseAIPetRecognitionOptions = {}) => {
  const [state, setState] = useState<RecognitionState>({
    isScanning: false,
    isProcessing: false,
    result: null,
    error: null,
    confidence: 0,
    processingTime: 0,
    progress: 0,
  });

  const [batchState, setBatchState] = useState<BatchRecognitionState>({
    isProcessing: false,
    results: [],
    progress: 0,
    totalImages: 0,
    successCount: 0,
    errors: [],
    processingTime: 0
  });

  const [healthAssessment, setHealthAssessment] = useState<HealthAssessment | null>(null);
  const processingQueue = useRef<string[]>([]);
  const lastProcessTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const THROTTLE_DELAY = 1000; // 1 saniye throttle

  const startScanning = useCallback(() => {
    setState(prev => ({ ...prev, isScanning: true, error: null, progress: 0 }));
    if (options.enableHaptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [options.enableHaptics]);

  const stopScanning = useCallback(() => {
    setState(prev => ({ ...prev, isScanning: false }));
    processingQueue.current = [];
  }, []);

  const processImage = useCallback(async (
    imageUri: string,
    scanOptions: ScanOptions = {}
  ): Promise<PetRecognitionResult | null> => {
    const startTime = Date.now();
    
    // Throttle real-time processing
    if (scanOptions.realTimeMode && startTime - lastProcessTime.current < THROTTLE_DELAY) {
      return null;
    }

    try {
      // Haptic feedback on start
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setState(prev => ({ ...prev, isProcessing: true, error: null, progress: 0 }));
      lastProcessTime.current = startTime;

      console.log('🤖 Starting advanced AI pet recognition...');
      
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      // Merge options
      const visionOptions: VisionOptions = {
        enableHealthAssessment: scanOptions.enableHealthAssessment ?? options.enableHealthAssessment ?? true,
        enableBreedIdentification: scanOptions.enableBreedIdentification ?? options.enableBreedIdentification ?? true,
        enableLostPetMatching: scanOptions.enableLostPetMatching ?? options.enableLostPetMatching ?? true,
        priority: scanOptions.priority ?? options.priority ?? 'accuracy',
        useEdgeML: options.useEdgeML ?? false,
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const result = await petVisionService.recognizePet(imageUri, visionOptions);
      const processingTime = Date.now() - startTime;

      clearInterval(progressInterval);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        result,
        confidence: result.confidence,
        processingTime,
        progress: 100,
      }));

      // Success haptic feedback
      if (options.enableHaptics && Platform.OS !== 'web' && result.confidence > 0.8) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      console.log('✅ Advanced AI pet recognition completed:', result.breed, `${result.confidence * 100}%`);
      return result;
    } catch (error: any) {
      console.error('❌ Advanced AI pet recognition failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Tanıma işlemi başarısız';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        progress: 0,
      }));

      // Error haptic feedback
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      return null;
    }
  }, [options]);

  const processBatch = useCallback(async (
    imageUris: string[],
    scanOptions: ScanOptions = {}
  ): Promise<BatchProcessingResult> => {
    try {
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setBatchState({
        isProcessing: true,
        results: [],
        progress: 0,
        totalImages: imageUris.length,
        successCount: 0,
        errors: [],
        processingTime: 0
      });

      console.log(`🔄 Starting batch AI recognition for ${imageUris.length} images...`);

      const visionOptions: VisionOptions = {
        enableHealthAssessment: scanOptions.enableHealthAssessment ?? false, // Disable for batch to speed up
        enableBreedIdentification: scanOptions.enableBreedIdentification ?? options.enableBreedIdentification ?? true,
        enableLostPetMatching: scanOptions.enableLostPetMatching ?? false, // Disable for batch
        priority: scanOptions.priority ?? 'speed', // Use speed for batch
        useEdgeML: options.useEdgeML ?? true, // Use edge ML for batch
      };

      const result = await petVisionService.processBatch(imageUris, visionOptions);

      setBatchState({
        isProcessing: false,
        results: result.results,
        progress: 100,
        totalImages: result.totalImages,
        successCount: result.successCount,
        errors: result.errors,
        processingTime: result.processingTime
      });

      // Update main state with first result
      if (result.results.length > 0) {
        setState(prev => ({
          ...prev,
          result: result.results[0],
          confidence: result.results[0].confidence,
        }));
      }

      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      console.log(`✅ Batch AI recognition completed: ${result.successCount}/${result.totalImages} successful`);
      return result;
    } catch (error: any) {
      console.error('❌ Batch AI recognition failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Toplu işlem başarısız';
      
      setBatchState(prev => ({
        ...prev,
        isProcessing: false,
        errors: [...prev.errors, errorMessage]
      }));

      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      throw error;
    }
  }, [options]);

  const findLostPetMatches = useCallback(async (
    imageUri: string,
    location?: { lat: number; lng: number }
  ): Promise<MatchingPet[]> => {
    try {
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      console.log('🔍 Searching for matching lost pets with facial recognition...');
      
      const matches = await petVisionService.findMatchingLostPets(imageUri, location);

      if (options.enableHaptics && Platform.OS !== 'web') {
        const feedbackType = matches.length > 0 
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning;
        await Haptics.notificationAsync(feedbackType);
      }

      console.log(`✅ Found ${matches.length} potential matches`);
      return matches;
    } catch (error) {
      console.error('❌ Lost pet matching failed:', error);
      
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return [];
    }
  }, [options]);

  const assessHealth = useCallback(async (
    imageUri: string
  ): Promise<HealthAssessment | null> => {
    try {
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      console.log('🏥 Starting advanced health assessment...');
      setHealthAssessment(null);
      
      const assessment = await petVisionService.assessHealth(imageUri);
      setHealthAssessment(assessment);

      if (options.enableHaptics && Platform.OS !== 'web') {
        const feedbackType = assessment.urgency === 'high' || assessment.urgency === 'emergency' 
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success;
        await Haptics.notificationAsync(feedbackType);
      }

      console.log('✅ Health assessment completed:', assessment.overallHealth);
      return assessment;
    } catch (error: any) {
      console.error('❌ Health assessment failed:', error);
      
      if (options.enableHaptics && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return null;
    }
  }, [options]);

  // Cancel current recognition
  const cancelRecognition = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isProcessing: false,
      progress: 0,
      error: 'Recognition cancelled'
    }));

    setBatchState(prev => ({
      ...prev,
      isProcessing: false
    }));

    console.log('🚫 AI recognition cancelled');
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isScanning: false,
      isProcessing: false,
      result: null,
      error: null,
      confidence: 0,
      processingTime: 0,
      progress: 0,
    });

    setBatchState({
      isProcessing: false,
      results: [],
      progress: 0,
      totalImages: 0,
      successCount: 0,
      errors: [],
      processingTime: 0
    });

    setHealthAssessment(null);
  }, []);

  // Clear only the last recognition result (keep batch/health)
  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
      confidence: 0,
      processingTime: 0,
      progress: 0,
    }));
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    petVisionService.clearCache();
    console.log('🗑️ AI recognition cache cleared');
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return petVisionService.getCacheStats();
  }, []);

  return {
    // State
    ...state,
    batchState,
    healthAssessment,
    
    // Actions
    startScanning,
    stopScanning,
    processImage,
    processBatch,
    findLostPetMatches,
    assessHealth,
    cancelRecognition,
    reset,
    clearResult,
    clearCache,
    getCacheStats,
    
    // Computed
    isReady: !state.isProcessing && !batchState.isProcessing,
    hasResult: !!state.result,
    hasError: !!state.error,
    breed: state.result?.breed || null,
    species: state.result?.species || null,
    turkishBreed: state.result?.turkishBreed || false,
    
    // Batch computed
    batchSuccessRate: batchState.totalImages > 0 ? (batchState.successCount / batchState.totalImages) * 100 : 0,
    batchHasErrors: batchState.errors.length > 0,
    
    // Health computed
    hasHealthAssessment: !!healthAssessment,
    healthUrgency: healthAssessment?.urgency || 'none',
    needsVet: healthAssessment?.veterinaryConsultation || false
  };
};
