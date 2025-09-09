import React, { useState } from "react";
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
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Camera, X, User, Heart, Plus, Trash2, FileText, Calendar, Stethoscope } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { usePets, type MedicalRecord } from "@/hooks/pet-store";
import { useAuth } from "@/hooks/auth-store";
import GlassContainer from "@/components/GlassContainer";

const { width: screenWidth } = Dimensions.get('window');

const DOG_BREEDS = [
  "Golden Retriever", "Labrador", "German Shepherd", "Bulldog", "Poodle",
  "Beagle", "Rottweiler", "Yorkshire Terrier", "Dachshund", "Siberian Husky",
  "Boxer", "Border Collie", "Chihuahua", "Shih Tzu", "Boston Terrier",
  "Pomeranian", "Australian Shepherd", "Cocker Spaniel", "French Bulldog", "Mixed Breed"
];

const CAT_BREEDS = [
  "Persian", "Maine Coon", "British Shorthair", "Ragdoll", "Bengal",
  "Siamese", "Abyssinian", "Russian Blue", "Scottish Fold", "Sphynx",
  "American Shorthair", "Birman", "Oriental Shorthair", "Devon Rex", "Turkish Angora",
  "Norwegian Forest Cat", "Exotic Shorthair", "Cornish Rex", "Manx", "Mixed Breed"
];

function AddPetScreen() {
  const { addPet } = usePets();
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [ownerName, setOwnerName] = useState<string>(user?.name || "");
  const [ownerPhone, setOwnerPhone] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [microchipId, setMicrochipId] = useState<string>("");
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBreedPicker, setShowBreedPicker] = useState<boolean>(false);
  const [showMedicalForm, setShowMedicalForm] = useState<boolean>(false);
  const [editingMedicalRecord, setEditingMedicalRecord] = useState<MedicalRecord | null>(null);

  const availableBreeds = type === "Dog" ? DOG_BREEDS : type === "Cat" ? CAT_BREEDS : [];

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length, // Max 5 photos total
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Ensure max 5 photos
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit Reached", "You can add maximum 5 photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const showImagePicker = () => {
    if (photos.length >= 5) {
      Alert.alert("Limit Reached", "You can add maximum 5 photos");
      return;
    }

    Alert.alert(
      "Add Photos",
      "Choose how you'd like to add photos of your pet",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImages },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const removePhoto = (index: number) => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            setPhotos(prev => prev.filter((_, i) => i !== index));
            if (selectedPhotoIndex === index) {
              setSelectedPhotoIndex(null);
            } else if (selectedPhotoIndex !== null && selectedPhotoIndex > index) {
              setSelectedPhotoIndex(prev => prev! - 1);
            }
          }
        },
      ]
    );
  };

  const viewPhotoGallery = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const addMedicalRecord = (record: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: 'med-' + Date.now(),
    };
    setMedicalRecords(prev => [...prev, newRecord]);
  };

  const updateMedicalRecord = (recordId: string, updates: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => 
      prev.map(record => 
        record.id === recordId ? { ...record, ...updates } : record
      )
    );
  };

  const deleteMedicalRecord = (recordId: string) => {
    Alert.alert(
      "Kaydı Sil",
      "Bu tıbbi kaydı silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            setMedicalRecords(prev => prev.filter(record => record.id !== recordId));
          }
        }
      ]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Lütfen evcil hayvanınızın adını girin");
      return false;
    }
    if (!type) {
      Alert.alert("Hata", "Lütfen evcil hayvan türünü seçin");
      return false;
    }
    if (!age.trim()) {
      Alert.alert("Hata", "Lütfen evcil hayvanınızın yaşını girin");
      return false;
    }
    if (!ownerName.trim()) {
      Alert.alert("Hata", "Lütfen sahip adını girin");
      return false;
    }
    if (!ownerPhone.trim()) {
      Alert.alert("Hata", "Lütfen iletişim numaranızı girin");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await addPet({
        name: name.trim(),
        type: type,
        breed: breed || null,
        age: age.trim() || undefined,
        weight: weight.trim() || undefined,
        microchip_id: microchipId.trim() || undefined,
        last_location: null, // Not needed for basic profile
        reward_amount: 0,
        is_found: true, // This is a pet profile, not a lost pet report
        photos: photos,
        medical_records: medicalRecords,
      });

      Alert.alert(
        "Başarılı! 🎉",
        `${name} profili başarıyla oluşturuldu!`,
        [
          {
            text: "Tamam",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert("Hata", "Profil oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Evcil Hayvan Profili",
          headerStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
          headerBlurEffect: 'light',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X color="#64748B" size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yeni Evcil Hayvan Profili</Text>
          <Text style={styles.headerSubtitle}>Sevimli dostunuzun bilgilerini ekleyin</Text>
        </View>

        {/* Photo Section */}
        <GlassContainer style={styles.photoSection}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>Pet Photos ({photos.length}/5)</Text>
            <TouchableOpacity 
              style={styles.addPhotoButton} 
              onPress={showImagePicker}
              disabled={photos.length >= 5}
            >
              <Plus color={photos.length >= 5 ? "#94A3B8" : "#FF6B6B"} size={20} />
              <Text style={[styles.addPhotoText, photos.length >= 5 && styles.addPhotoTextDisabled]}>Add</Text>
            </TouchableOpacity>
          </View>

          {photos.length === 0 ? (
            <TouchableOpacity style={styles.photoPlaceholderContainer} onPress={showImagePicker}>
              <View style={styles.photoPlaceholder}>
                <Camera color="#FF6B6B" size={40} />
                <Text style={styles.photoPlaceholderText}>Add Pet Photos</Text>
                <Text style={styles.photoPlaceholderSubtext}>Tap to add up to 5 photos</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.photoGrid}>
              <FlatList
                data={photos}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `photo-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.photoThumbnailContainer}>
                    <TouchableOpacity 
                      style={styles.photoThumbnail}
                      onPress={() => viewPhotoGallery(index)}
                    >
                      <Image source={{ uri: item }} style={styles.thumbnailImage} />
                      <TouchableOpacity 
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <X color="#FFFFFF" size={16} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {index === 0 && (
                      <Text style={styles.primaryPhotoLabel}>Main</Text>
                    )}
                  </View>
                )}
                contentContainerStyle={styles.photoListContainer}
              />
            </View>
          )}
        </GlassContainer>

        {/* Pet Information */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart color="#FF6B6B" size={20} />
            <Text style={styles.sectionTitle}>Evcil Hayvan Bilgileri</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İsim *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Örn: Buddy, Luna, Max"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Tür *</Text>
              <View style={styles.typeButtons}>
                {["Dog", "Cat", "Bird", "Other"].map((petType) => (
                  <TouchableOpacity
                    key={petType}
                    style={[
                      styles.typeButton,
                      type === petType && styles.typeButtonActive
                    ]}
                    onPress={() => {
                      setType(petType);
                      setBreed(""); // Reset breed when type changes
                    }}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      type === petType && styles.typeButtonTextActive
                    ]}>
                      {petType === "Dog" ? "🐕 Köpek" : 
                       petType === "Cat" ? "🐱 Kedi" :
                       petType === "Bird" ? "🐦 Kuş" : "🐾 Diğer"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Yaş *</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Örn: 2 yaş"
                placeholderTextColor="rgba(148, 163, 184, 0.8)"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Ağırlık</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Örn: 25 kg"
                placeholderTextColor="rgba(148, 163, 184, 0.8)"
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Mikroçip ID</Text>
              <TextInput
                style={styles.input}
                value={microchipId}
                onChangeText={setMicrochipId}
                placeholder="Örn: TR123456789"
                placeholderTextColor="rgba(148, 163, 184, 0.8)"
              />
            </View>
          </View>

          {type && availableBreeds.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cins</Text>
              <TouchableOpacity
                style={styles.breedSelector}
                onPress={() => setShowBreedPicker(true)}
              >
                <Text style={[
                  styles.breedSelectorText,
                  !breed && styles.breedSelectorPlaceholder
                ]}>
                  {breed || "Cins seçin (opsiyonel)"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassContainer>

        {/* Medical Records */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Stethoscope color="#FF6B6B" size={20} />
            <Text style={styles.sectionTitle}>Tıbbi Kayıtlar</Text>
            <TouchableOpacity 
              style={styles.addRecordButton}
              onPress={() => {
                setEditingMedicalRecord(null);
                setShowMedicalForm(true);
              }}
            >
              <Plus color="#FF6B6B" size={16} />
              <Text style={styles.addRecordText}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {medicalRecords.length === 0 ? (
            <View style={styles.noRecordsContainer}>
              <FileText color="#94A3B8" size={32} />
              <Text style={styles.noRecordsText}>Henüz tıbbi kayıt eklenmemiş</Text>
              <Text style={styles.noRecordsSubtext}>Aşı tarihleri ve veteriner ziyaretlerini ekleyin</Text>
            </View>
          ) : (
            <View style={styles.medicalRecordsList}>
              {medicalRecords.map((record) => (
                <View key={record.id} style={styles.medicalRecordItem}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordTypeContainer}>
                      <View style={[
                        styles.recordTypeBadge,
                        record.type === 'vaccination' && styles.vaccinationBadge,
                        record.type === 'vet_visit' && styles.vetVisitBadge,
                        record.type === 'medication' && styles.medicationBadge,
                        record.type === 'surgery' && styles.surgeryBadge,
                      ]}>
                        <Text style={styles.recordTypeText}>
                          {record.type === 'vaccination' ? '💉 Aşı' :
                           record.type === 'vet_visit' ? '🏥 Muayene' :
                           record.type === 'medication' ? '💊 İlaç' :
                           record.type === 'surgery' ? '🔬 Ameliyat' : '📋 Diğer'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteRecordButton}
                      onPress={() => deleteMedicalRecord(record.id)}
                    >
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordDate}>
                    📅 {new Date(record.date).toLocaleDateString('tr-TR')}
                  </Text>
                  
                  {record.veterinarian && (
                    <Text style={styles.recordDetail}>👨‍⚕️ {record.veterinarian}</Text>
                  )}
                  
                  {record.clinic && (
                    <Text style={styles.recordDetail}>🏥 {record.clinic}</Text>
                  )}
                  
                  {record.notes && (
                    <Text style={styles.recordNotes}>{record.notes}</Text>
                  )}
                  
                  {record.next_due_date && (
                    <Text style={styles.nextDueDate}>
                      🔔 Sonraki: {new Date(record.next_due_date).toLocaleDateString('tr-TR')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </GlassContainer>

        {/* Owner Information */}
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <User color="#FF6B6B" size={20} />
            <Text style={styles.sectionTitle}>Sahip Bilgileri</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sahip Adı *</Text>
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Adınız ve soyadınız"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İletişim Numarası *</Text>
            <TextInput
              style={styles.input}
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              placeholder="0555 123 45 67"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
              keyboardType="phone-pad"
            />
          </View>
        </GlassContainer>

        {/* Photo Gallery Modal */}
        {selectedPhotoIndex !== null && (
          <View style={styles.galleryOverlay}>
            <TouchableOpacity 
              style={styles.galleryCloseButton}
              onPress={() => setSelectedPhotoIndex(null)}
            >
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
            
            <View style={styles.galleryContainer}>
              <Image 
                source={{ uri: photos[selectedPhotoIndex] }} 
                style={styles.galleryImage} 
                resizeMode="contain"
              />
              
              <View style={styles.galleryControls}>
                <TouchableOpacity
                  style={[styles.galleryButton, selectedPhotoIndex === 0 && styles.galleryButtonDisabled]}
                  onPress={() => setSelectedPhotoIndex(prev => Math.max(0, prev! - 1))}
                  disabled={selectedPhotoIndex === 0}
                >
                  <Text style={styles.galleryButtonText}>Previous</Text>
                </TouchableOpacity>
                
                <Text style={styles.galleryCounter}>
                  {selectedPhotoIndex + 1} of {photos.length}
                </Text>
                
                <TouchableOpacity
                  style={[styles.galleryButton, selectedPhotoIndex === photos.length - 1 && styles.galleryButtonDisabled]}
                  onPress={() => setSelectedPhotoIndex(prev => Math.min(photos.length - 1, prev! + 1))}
                  disabled={selectedPhotoIndex === photos.length - 1}
                >
                  <Text style={styles.galleryButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.galleryRemoveButton}
                onPress={() => {
                  const indexToRemove = selectedPhotoIndex;
                  setSelectedPhotoIndex(null);
                  removePhoto(indexToRemove);
                }}
              >
                <Trash2 color="#FF6B6B" size={20} />
                <Text style={styles.galleryRemoveText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Breed Picker Modal */}
        {showBreedPicker && (
          <View style={styles.breedPickerOverlay}>
            <GlassContainer style={styles.breedPickerModal}>
              <View style={styles.breedPickerHeader}>
                <Text style={styles.breedPickerTitle}>Cins Seçin</Text>
                <TouchableOpacity onPress={() => setShowBreedPicker(false)}>
                  <X color="#64748B" size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.breedList}>
                {availableBreeds.map((breedOption) => (
                  <TouchableOpacity
                    key={breedOption}
                    style={styles.breedOption}
                    onPress={() => {
                      setBreed(breedOption);
                      setShowBreedPicker(false);
                    }}
                  >
                    <Text style={styles.breedOptionText}>{breedOption}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </GlassContainer>
          </View>
        )}

        {/* Medical Record Form Modal */}
        {showMedicalForm && (
          <MedicalRecordForm
            visible={showMedicalForm}
            onClose={() => {
              setShowMedicalForm(false);
              setEditingMedicalRecord(null);
            }}
            onSave={(record) => {
              if (editingMedicalRecord) {
                updateMedicalRecord(editingMedicalRecord.id, record);
              } else {
                addMedicalRecord(record);
              }
              setShowMedicalForm(false);
              setEditingMedicalRecord(null);
            }}
            initialData={editingMedicalRecord}
          />
        )}
      </ScrollView>



      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Profil Oluşturuluyor..." : "Profil Oluştur 🐾"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  photoSection: {
    paddingVertical: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
  },
  addPhotoTextDisabled: {
    color: '#94A3B8',
  },
  photoPlaceholderContainer: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  photoGrid: {
    marginTop: 8,
  },
  photoListContainer: {
    paddingHorizontal: 4,
  },
  photoThumbnailContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryPhotoLabel: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 4,
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  galleryCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryImage: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    borderRadius: 12,
  },
  galleryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  galleryButtonDisabled: {
    opacity: 0.3,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  galleryCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  galleryRemoveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  galleryRemoveText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  typeButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  breedSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  breedSelectorText: {
    fontSize: 16,
    color: '#1E293B',
  },
  breedSelectorPlaceholder: {
    color: 'rgba(148, 163, 184, 0.8)',
  },
  breedPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  breedPickerModal: {
    width: '100%',
    maxHeight: '70%',
    padding: 0,
  },
  breedPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  breedPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  breedList: {
    maxHeight: 300,
  },
  breedOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  breedOptionText: {
    fontSize: 16,
    color: '#1E293B',
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginLeft: 'auto',
  },
  addRecordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
  },
  noRecordsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  noRecordsText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  noRecordsSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  medicalRecordsList: {
    gap: 12,
  },
  medicalRecordItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordTypeContainer: {
    flex: 1,
  },
  recordTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  vaccinationBadge: {
    backgroundColor: '#DBEAFE',
  },
  vetVisitBadge: {
    backgroundColor: '#FEF3C7',
  },
  medicationBadge: {
    backgroundColor: '#ECFDF5',
  },
  surgeryBadge: {
    backgroundColor: '#FEE2E2',
  },
  recordTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  deleteRecordButton: {
    padding: 4,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  recordDetail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  recordNotes: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 20,
  },
  nextDueDate: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Medical Form Styles
  medicalFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  medicalFormModal: {
    width: '100%',
    maxHeight: '90%',
    padding: 0,
  },
  medicalFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  medicalFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicalFormContent: {
    padding: 20,
    maxHeight: 400,
  },
  recordTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recordTypeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  medicalFormActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveRecordButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveRecordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Medical Record Form Component
interface MedicalRecordFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<MedicalRecord, 'id'>) => void;
  initialData?: MedicalRecord | null;
}

function MedicalRecordForm({ visible, onClose, onSave, initialData }: MedicalRecordFormProps) {
  const [recordType, setRecordType] = useState<MedicalRecord['type']>('vaccination');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [veterinarian, setVeterinarian] = useState<string>('');
  const [clinic, setClinic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [nextDueDate, setNextDueDate] = useState<string>('');

  React.useEffect(() => {
    if (initialData) {
      setRecordType(initialData.type);
      setTitle(initialData.title);
      setDate(initialData.date);
      setVeterinarian(initialData.veterinarian || '');
      setClinic(initialData.clinic || '');
      setNotes(initialData.notes || '');
      setNextDueDate(initialData.next_due_date || '');
    } else {
      setRecordType('vaccination');
      setTitle('');
      setDate('');
      setVeterinarian('');
      setClinic('');
      setNotes('');
      setNextDueDate('');
    }
  }, [initialData, visible]);

  const handleSave = () => {
    if (!title.trim() || !date.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve tarih alanlarını doldurun');
      return;
    }

    onSave({
      type: recordType,
      title: title.trim(),
      date: date.trim(),
      veterinarian: veterinarian.trim() || undefined,
      clinic: clinic.trim() || undefined,
      notes: notes.trim() || undefined,
      next_due_date: nextDueDate.trim() || undefined,
      documents: [],
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.medicalFormOverlay}>
      <GlassContainer style={styles.medicalFormModal}>
        <View style={styles.medicalFormHeader}>
          <Text style={styles.medicalFormTitle}>
            {initialData ? 'Tıbbi Kaydı Düzenle' : 'Yeni Tıbbi Kayıt'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.medicalFormContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kayıt Türü *</Text>
            <View style={styles.recordTypeButtons}>
              {[
                { key: 'vaccination', label: '💉 Aşı', color: '#3B82F6' },
                { key: 'vet_visit', label: '🏥 Muayene', color: '#F59E0B' },
                { key: 'medication', label: '💊 İlaç', color: '#10B981' },
                { key: 'surgery', label: '🔬 Ameliyat', color: '#EF4444' },
                { key: 'other', label: '📋 Diğer', color: '#6B7280' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.recordTypeButton,
                    recordType === type.key && { backgroundColor: type.color },
                  ]}
                  onPress={() => setRecordType(type.key as MedicalRecord['type'])}
                >
                  <Text style={[
                    styles.recordTypeButtonText,
                    recordType === type.key && { color: '#FFFFFF' },
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Başlık *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Örn: Kuduz Aşısı, Rutin Kontrol"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tarih *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD (Örn: 2024-01-15)"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Veteriner Hekim</Text>
            <TextInput
              style={styles.input}
              value={veterinarian}
              onChangeText={setVeterinarian}
              placeholder="Örn: Dr. Mehmet Yılmaz"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Klinik/Hastane</Text>
            <TextInput
              style={styles.input}
              value={clinic}
              onChangeText={setClinic}
              placeholder="Örn: İstanbul Veteriner Kliniği"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
            />
          </View>

          {recordType === 'vaccination' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sonraki Aşı Tarihi</Text>
              <TextInput
                style={styles.input}
                value={nextDueDate}
                onChangeText={setNextDueDate}
                placeholder="YYYY-MM-DD (Örn: 2025-01-15)"
                placeholderTextColor="rgba(148, 163, 184, 0.8)"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notlar</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ek bilgiler, gözlemler..."
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        <View style={styles.medicalFormActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveRecordButton} onPress={handleSave}>
            <Text style={styles.saveRecordButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </GlassContainer>
    </View>
  );
}



export default AddPetScreen;