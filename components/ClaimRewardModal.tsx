import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRewards } from '@/hooks/reward-store';
import { Pet } from '@/hooks/pet-store';
import { DollarSign, Camera, MessageSquare, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ClaimRewardModalProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet;
}

export default function ClaimRewardModal({ visible, onClose, pet }: ClaimRewardModalProps) {
  const { createClaim, isCreatingClaim } = useRewards();
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add evidence photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEvidencePhoto(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take evidence photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEvidencePhoto(result.assets[0].uri);
    }
  };

  const handleSubmitClaim = async () => {
    if (!evidenceNotes.trim()) {
      Alert.alert('Evidence Required', 'Please provide details about finding this pet.');
      return;
    }

    try {
      await createClaim({
        petId: pet.id,
        ownerId: pet.owner_id,
        amount: pet.reward_amount,
        evidencePhoto: evidencePhoto || undefined,
        evidenceNotes: evidenceNotes.trim(),
      });
      
      // Reset form
      setEvidencePhoto(null);
      setEvidenceNotes('');
      onClose();
    } catch (error) {
      console.error('Error submitting claim:', error);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Evidence Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Photo Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Claim Reward</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.petSection}>
            {pet.photos[0] && (
              <Image source={{ uri: pet.photos[0] }} style={styles.petImage} />
            )}
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petType}>{pet.type}</Text>
          </View>

          <View style={styles.rewardSection}>
            <View style={styles.rewardContainer}>
              <DollarSign size={24} color="#10b981" />
              <Text style={styles.rewardAmount}>${pet.reward_amount}</Text>
            </View>
            <Text style={styles.rewardText}>Reward Amount</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Evidence Details</Text>
            <Text style={styles.sectionSubtitle}>
              Please provide details about finding this pet to help the owner verify your claim.
            </Text>

            <View style={styles.inputContainer}>
              <MessageSquare size={20} color="#6b7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Describe where and when you found this pet..."
                value={evidenceNotes}
                onChangeText={setEvidenceNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.photoButton} onPress={showImagePicker}>
              <Camera size={20} color="#3b82f6" />
              <Text style={styles.photoButtonText}>
                {evidencePhoto ? 'Change Photo' : 'Add Evidence Photo'}
              </Text>
            </TouchableOpacity>

            {evidencePhoto && (
              <View style={styles.photoPreview}>
                <Image source={{ uri: evidencePhoto }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setEvidencePhoto(null)}
                >
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <View style={styles.infoStep}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.infoStepText}>Your claim will be sent to the pet owner</Text>
            </View>
            <View style={styles.infoStep}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.infoStepText}>The owner will review your evidence</Text>
            </View>
            <View style={styles.infoStep}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.infoStepText}>If approved, you can arrange payment</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (!evidenceNotes.trim() || isCreatingClaim) && styles.disabledButton]}
            onPress={handleSubmitClaim}
            disabled={!evidenceNotes.trim() || isCreatingClaim}
          >
            <Text style={styles.submitButtonText}>
              {isCreatingClaim ? 'Submitting...' : 'Submit Claim'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  petSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  petName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  petType: {
    fontSize: 16,
    color: '#6b7280',
  },
  rewardSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 8,
  },
  rewardText: {
    fontSize: 16,
    color: '#6b7280',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 8,
  },
  photoPreview: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  removePhotoText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoStepText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});