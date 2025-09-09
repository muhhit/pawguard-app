import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIServiceManager } from './ai-service';

interface BreedIdentificationResult {
  breed: string;
  confidence: 'high' | 'medium' | 'low';
  alternativeBreeds?: string[];
  characteristics?: string[];
}

interface CachedResult {
  result: BreedIdentificationResult;
  timestamp: number;
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_KEY_PREFIX = 'breed_cache_';

export function useBreedIdentification() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateCacheKey = (description: string): string => {
    // Create a simple hash of the description for caching
    const normalized = description.toLowerCase().trim().replace(/\s+/g, ' ');
    return CACHE_KEY_PREFIX + btoa(normalized).replace(/[^a-zA-Z0-9]/g, '');
  };

  const checkSemanticCache = useCallback(async (description: string): Promise<BreedIdentificationResult | null> => {
    try {
      const cacheKey = generateCacheKey(description);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const parsedCache: CachedResult = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          console.log('Breed identification cache hit for:', description.substring(0, 50));
          return parsedCache.result;
        } else {
          // Clean up expired cache
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Error checking breed cache:', error);
    }
    
    return null;
  }, []);

  const saveToCache = useCallback(async (description: string, result: BreedIdentificationResult): Promise<void> => {
    try {
      const cacheKey = generateCacheKey(description);
      const cacheData: CachedResult = {
        result,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('Breed identification result cached for:', description.substring(0, 50));
    } catch (error) {
      console.error('Error saving to breed cache:', error);
    }
  }, []);

  const identifyBreed = useCallback(async (description: string): Promise<BreedIdentificationResult | null> => {
    if (!description.trim()) {
      setError('Please provide a description of the pet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await checkSemanticCache(description);
      if (cached) {
        setIsLoading(false);
        return cached;
      }

      console.log('Making AI request for breed identification:', description.substring(0, 50));
      
      // Use the new AI service manager with automatic fallback
      const aiResponse = await AIServiceManager.identifyBreed(description);
      console.log(`✅ Breed identification completed using ${aiResponse.service} service`);

      // Parse the JSON response
      let result: BreedIdentificationResult;
      try {
        // Extract JSON from the completion text
        const jsonMatch = aiResponse.completion.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        result = JSON.parse(jsonMatch[0]);
        
        // Validate the result structure
        if (!result.breed || !result.confidence) {
          throw new Error('Invalid result structure');
        }
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback: extract breed from text response
        result = {
          breed: 'Mixed Breed',
          confidence: 'low' as const,
          alternativeBreeds: [],
          characteristics: ['Unable to determine specific breed from description']
        };
      }

      // Cache the result
      await saveToCache(description, result);
      
      setIsLoading(false);
      return result;
      
    } catch (error) {
      console.error('Error identifying breed:', error);
      setError(error instanceof Error ? error.message : 'Failed to identify breed');
      setIsLoading(false);
      return null;
    }
  }, [checkSemanticCache, saveToCache]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} breed identification cache entries`);
    } catch (error) {
      console.error('Error clearing breed cache:', error);
    }
  }, []);

  return {
    identifyBreed,
    isLoading,
    error,
    clearCache
  };
}