import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Heart, Stethoscope, Sparkles, BookOpen, ArrowLeft } from 'lucide-react-native';
import BreedIdentification from '@/components/BreedIdentification';
import VeterinaryGuidance from '@/components/VeterinaryGuidance';
import GlassContainer from '@/components/GlassContainer';
import { router } from 'expo-router';

type ActiveSection = 'overview' | 'breed' | 'veterinary' | 'tips';

export default function AIFeaturesScreen() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [selectedBreed, setSelectedBreed] = useState<string>('');

  const handleBreedSelected = (breed: string) => {
    setSelectedBreed(breed);
    console.log('Selected breed:', breed);
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.title}>Pet Health & AI Assistant</Text>
      <Text style={styles.subtitle}>
        Get AI-powered insights for your pet&apos;s health and breed identification
      </Text>

      <View style={styles.featuresGrid}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setActiveSection('breed')}
        >
          <Sparkles color="#FF6B6B" size={32} />
          <Text style={styles.featureTitle}>Breed Identification</Text>
          <Text style={styles.featureDescription}>
            Describe your pet and get AI-powered breed identification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setActiveSection('veterinary')}
        >
          <Stethoscope color="#10B981" size={32} />
          <Text style={styles.featureTitle}>Veterinary Guidance</Text>
          <Text style={styles.featureDescription}>
            Get preliminary health guidance for symptoms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setActiveSection('tips')}
        >
          <BookOpen color="#3B82F6" size={32} />
          <Text style={styles.featureTitle}>Care Tips</Text>
          <Text style={styles.featureDescription}>
            Personalized care recommendations
          </Text>
        </TouchableOpacity>
      </View>

      {selectedBreed && (
        <GlassContainer style={styles.selectedBreedContainer}>
          <Heart color="#FF6B6B" size={20} />
          <Text style={styles.selectedBreedText}>
            Last identified breed: <Text style={styles.breedName}>{selectedBreed}</Text>
          </Text>
        </GlassContainer>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ AI guidance is for educational purposes only. Always consult a veterinarian for proper diagnosis and treatment.
        </Text>
      </View>

      <View style={styles.apiInfo}>
        <Text style={styles.apiInfoTitle}>🤖 AI Services Available:</Text>
        <Text style={styles.apiInfoText}>• OpenAI API (Primary)</Text>
        <Text style={styles.apiInfoText}>• OpenAI GPT-4o-mini (Fallback)</Text>
        <Text style={styles.apiInfoText}>• Automatic failover for reliability</Text>
      </View>
    </View>
  );

  const renderCareTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.sectionTitle}>Pet Care Tips</Text>
      <Text style={styles.comingSoon}>Coming soon: Personalized care tips based on your pet&apos;s breed and age</Text>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setActiveSection('overview')}
      >
        <ArrowLeft color="#FFFFFF" size={16} />
        <Text style={styles.backButtonText}>Back to Overview</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#64748B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Features Demo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeSection === 'overview' && renderOverview()}
        
        {activeSection === 'breed' && (
          <View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveSection('overview')}
            >
              <ArrowLeft color="#FFFFFF" size={16} />
              <Text style={styles.backButtonText}>Back to Overview</Text>
            </TouchableOpacity>
            
            <BreedIdentification onBreedSelected={handleBreedSelected} />
          </View>
        )}
        
        {activeSection === 'veterinary' && (
          <View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveSection('overview')}
            >
              <ArrowLeft color="#FFFFFF" size={16} />
              <Text style={styles.backButtonText}>Back to Overview</Text>
            </TouchableOpacity>
            
            <VeterinaryGuidance />
          </View>
        )}
        
        {activeSection === 'tips' && renderCareTips()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  overviewContainer: {
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedBreedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  selectedBreedText: {
    fontSize: 16,
    color: '#1E293B',
  },
  breedName: {
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  disclaimer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#DC2626',
    lineHeight: 18,
  },
  apiInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  apiInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  apiInfoText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: '#64748B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  tipsContainer: {
    gap: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
});