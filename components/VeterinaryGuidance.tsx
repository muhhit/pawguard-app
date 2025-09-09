import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Heart, AlertTriangle, Clock, Info, Stethoscope } from 'lucide-react-native';
import { useVeterinaryGuidance, VeterinaryGuidance } from '@/hooks/veterinary-guidance';

interface VeterinaryGuidanceComponentProps {
  onClose?: () => void;
}

export default function VeterinaryGuidanceComponent({ onClose }: VeterinaryGuidanceComponentProps) {
  const [symptoms, setSymptoms] = useState<string>('');
  const [guidance, setGuidance] = useState<VeterinaryGuidance | null>(null);
  const { getGuidance, isLoading, error } = useVeterinaryGuidance();

  const handleGetGuidance = async () => {
    if (!symptoms.trim()) return;
    
    const result = await getGuidance(symptoms);
    if (result) {
      setGuidance(result);
    }
  };

  const getUrgencyColor = (urgency: VeterinaryGuidance['urgency']) => {
    switch (urgency) {
      case 'EMERGENCY': return '#EF4444';
      case 'URGENT': return '#F59E0B';
      case 'ROUTINE': return '#10B981';
      case 'INFORMATION': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getUrgencyIcon = (urgency: VeterinaryGuidance['urgency']) => {
    const color = getUrgencyColor(urgency);
    switch (urgency) {
      case 'EMERGENCY': return <AlertTriangle color={color} size={20} />;
      case 'URGENT': return <Clock color={color} size={20} />;
      case 'ROUTINE': return <Heart color={color} size={20} />;
      case 'INFORMATION': return <Info color={color} size={20} />;
      default: return <Stethoscope color={color} size={20} />;
    }
  };

  const handleEmergencyAlert = React.useCallback(() => {
    if (guidance?.urgency === 'EMERGENCY') {
      Alert.alert(
        '🚨 Emergency Situation',
        'This appears to be a medical emergency. Please contact your veterinarian or emergency animal hospital immediately.',
        [
          { text: 'I Understand', style: 'default' }
        ]
      );
    }
  }, [guidance?.urgency]);

  React.useEffect(() => {
    if (guidance?.urgency === 'EMERGENCY') {
      handleEmergencyAlert();
    }
  }, [guidance, handleEmergencyAlert]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Stethoscope color="#FF6B6B" size={24} />
        <Text style={styles.title}>Veterinary Guidance</Text>
      </View>
      
      <Text style={styles.disclaimer}>
        ⚠️ This is for educational purposes only. Always consult a veterinarian for proper diagnosis and treatment.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Describe your pet&apos;s symptoms:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Not eating, lethargic, vomiting, limping..."
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={[styles.guidanceButton, (!symptoms.trim() || isLoading) && styles.disabledButton]}
          onPress={handleGetGuidance}
          disabled={!symptoms.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Stethoscope color="#FFFFFF" size={16} />
              <Text style={styles.guidanceButtonText}>Get Guidance</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle color="#EF4444" size={16} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {guidance && (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.urgencyBanner, { backgroundColor: getUrgencyColor(guidance.urgency) + '20' }]}>
            <View style={styles.urgencyHeader}>
              {getUrgencyIcon(guidance.urgency)}
              <Text style={[styles.urgencyText, { color: getUrgencyColor(guidance.urgency) }]}>
                {guidance.urgency} LEVEL
              </Text>
            </View>
          </View>

          <View style={styles.guidanceSection}>
            <Text style={styles.sectionTitle}>General Guidance</Text>
            <Text style={styles.guidanceText}>{guidance.guidance}</Text>
          </View>

          {guidance.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Immediate Care Recommendations</Text>
              {guidance.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {guidance.whenToSeekHelp.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>When to Seek Veterinary Help</Text>
              {guidance.whenToSeekHelp.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.emergencyNote}>
            <AlertTriangle color="#EF4444" size={16} />
            <Text style={styles.emergencyText}>
              If this is a medical emergency, contact your veterinarian or emergency animal hospital immediately.
            </Text>
          </View>

          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  disclaimer: {
    fontSize: 12,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  inputContainer: {
    gap: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
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
  guidanceButton: {
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
  guidanceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
    maxHeight: 400,
  },
  urgencyBanner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  guidanceSection: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  guidanceText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  listItem: {
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
  listText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  emergencyText: {
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#64748B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});