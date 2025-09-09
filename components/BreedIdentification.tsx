import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Search, CheckCircle, AlertCircle, Sparkles } from 'lucide-react-native';
import { useBreedIdentification } from '@/hooks/breed-identification';

interface BreedIdentificationProps {
  onBreedSelected: (breed: string) => void;
  initialDescription?: string;
}

export default function BreedIdentification({ onBreedSelected, initialDescription = '' }: BreedIdentificationProps) {
  const [description, setDescription] = useState<string>(initialDescription);
  const [result, setResult] = useState<any>(null);
  const { identifyBreed, isLoading, error } = useBreedIdentification();

  const handleIdentify = async () => {
    if (!description.trim()) return;
    
    const identificationResult = await identifyBreed(description);
    if (identificationResult) {
      setResult(identificationResult);
    }
  };

  const handleBreedSelect = (breed: string) => {
    onBreedSelected(breed);
    setResult(null);
    setDescription('');
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle color="#10B981" size={16} />;
      case 'medium': return <AlertCircle color="#F59E0B" size={16} />;
      case 'low': return <AlertCircle color="#EF4444" size={16} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles color="#FF6B6B" size={20} />
        <Text style={styles.title}>AI Breed Identification</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Describe your pet&apos;s appearance, size, and characteristics
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Medium-sized dog with golden fur, floppy ears, friendly temperament..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={[styles.identifyButton, (!description.trim() || isLoading) && styles.disabledButton]}
          onPress={handleIdentify}
          disabled={!description.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Search color="#FFFFFF" size={16} />
              <Text style={styles.identifyButtonText}>Identify Breed</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle color="#EF4444" size={16} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.primaryResult}>
            <View style={styles.resultHeader}>
              <Text style={styles.breedName}>{result.breed}</Text>
              <View style={styles.confidenceBadge}>
                {getConfidenceIcon(result.confidence)}
                <Text style={[styles.confidenceText, { color: getConfidenceColor(result.confidence) }]}>
                  {result.confidence} confidence
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleBreedSelect(result.breed)}
            >
              <Text style={styles.selectButtonText}>Select This Breed</Text>
            </TouchableOpacity>
          </View>

          {result.characteristics && result.characteristics.length > 0 && (
            <View style={styles.characteristicsContainer}>
              <Text style={styles.sectionTitle}>Key Characteristics</Text>
              {result.characteristics.map((characteristic: string, index: number) => (
                <View key={index} style={styles.characteristicItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.characteristicText}>{characteristic}</Text>
                </View>
              ))}
            </View>
          )}

          {result.alternativeBreeds && result.alternativeBreeds.length > 0 && (
            <View style={styles.alternativesContainer}>
              <Text style={styles.sectionTitle}>Alternative Breeds</Text>
              {result.alternativeBreeds.map((breed: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.alternativeBreed}
                  onPress={() => handleBreedSelect(breed)}
                >
                  <Text style={styles.alternativeBreedText}>{breed}</Text>
                  <Text style={styles.selectText}>Select</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 100,
    backgroundColor: '#F8FAFC',
  },
  identifyButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  identifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  resultsContainer: {
    marginTop: 16,
    maxHeight: 300,
  },
  primaryResult: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  breedName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  selectButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  characteristicsContainer: {
    marginBottom: 16,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
    marginTop: 6,
  },
  characteristicText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  alternativesContainer: {
    marginBottom: 16,
  },
  alternativeBreed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  alternativeBreedText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  selectText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});