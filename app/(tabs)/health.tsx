import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Heart, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Syringe,
  Pill,
  Stethoscope,
  FileText,
  Clock,
  X,
  MessageCircle,
  AlertTriangle,
  Info,
  Send,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePets } from "@/hooks/pet-store";
import LoadingSpinner from "@/components/LoadingSpinner";
import { NoHealthRecordsEmpty, NoAppointmentsEmpty } from "@/components/EmptyStates";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'treatment';
  title: string;
  description: string;
  date: string;
  nextDue?: string;
  veterinarian?: string;
  notes?: string;
}

interface Appointment {
  id: string;
  petId: string;
  type: string;
  date: string;
  time: string;
  veterinarian: string;
  notes?: string;
}

interface VetGuidance {
  id: string;
  symptoms: string;
  response: string;
  urgency: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'INFORMATION';
  timestamp: string;
}

export default function HealthScreen() {
  const { pets } = usePets();
  const [modalVisible, setModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'records' | 'appointments' | 'guidance'>('overview');
  
  // Mock pets data for modern design
  const mockPets = [
    {
      id: '1',
      name: 'Luna',
      breed: 'Golden Retriever',
      age: 3,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face',
      vaccinated: true,
      microchipped: true,
      gpsTracked: true
    }
  ];
  
  const [appointments, setAppointments] = useState<Appointment[]>([
    { 
      id: '1', 
      petId: 'pet1', 
      type: 'Vet Checkup', 
      date: '2024-12-15', 
      time: '2:00 PM', 
      veterinarian: 'Dr. Smith',
      notes: 'Annual checkup'
    },
    { 
      id: '2', 
      petId: 'pet2', 
      type: 'Grooming', 
      date: '2024-12-18', 
      time: '10:00 AM', 
      veterinarian: 'Pet Spa',
      notes: 'Full grooming service'
    },
    {
      id: '3',
      petId: 'pet1',
      type: 'Vaccination',
      date: '2024-12-20',
      time: '3:30 PM',
      veterinarian: 'Dr. Johnson',
      notes: 'Booster shots'
    },
    {
      id: '4',
      petId: 'pet1',
      type: 'Dental Exam',
      date: '2024-12-25',
      time: '11:00 AM',
      veterinarian: 'Dr. Brown',
      notes: 'Dental health checkup'
    },
    {
      id: '5',
      petId: 'pet2',
      type: 'Emergency Check',
      date: '2024-12-22',
      time: '4:00 PM',
      veterinarian: 'Dr. Emergency',
      notes: 'Follow-up on recent injury'
    },
  ]);

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    {
      id: '1',
      petId: 'pet1',
      type: 'vaccination',
      title: 'Rabies Vaccination',
      description: 'Annual rabies shot',
      date: '2024-11-15',
      nextDue: '2025-11-15',
      veterinarian: 'Dr. Smith',
    },
    {
      id: '2',
      petId: 'pet1',
      type: 'medication',
      title: 'Flea Prevention',
      description: 'Monthly flea and tick prevention',
      date: '2024-12-01',
      nextDue: '2025-01-01',
      veterinarian: 'Dr. Smith',
    },
    {
      id: '3',
      petId: 'pet1',
      type: 'checkup',
      title: 'Annual Health Checkup',
      description: 'General health examination and blood work',
      date: '2024-10-20',
      nextDue: '2025-10-20',
      veterinarian: 'Dr. Johnson',
    },
    {
      id: '4',
      petId: 'pet1',
      type: 'vaccination',
      title: 'DHPP Vaccine',
      description: 'Distemper, Hepatitis, Parvovirus, Parainfluenza',
      date: '2024-09-10',
      nextDue: '2025-09-10',
      veterinarian: 'Dr. Smith',
    },
    {
      id: '5',
      petId: 'pet1',
      type: 'treatment',
      title: 'Dental Cleaning',
      description: 'Professional dental cleaning and oral exam',
      date: '2024-08-05',
      nextDue: '2025-08-05',
      veterinarian: 'Dr. Brown',
    },
    {
      id: '6',
      petId: 'pet1',
      type: 'medication',
      title: 'Heartworm Prevention',
      description: 'Monthly heartworm prevention medication',
      date: '2024-12-01',
      nextDue: '2025-01-01',
      veterinarian: 'Dr. Smith',
    },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    type: '',
    date: '',
    time: '',
    veterinarian: '',
    notes: '',
  });

  const [newRecord, setNewRecord] = useState({
    type: 'vaccination' as HealthRecord['type'],
    title: '',
    description: '',
    date: '',
    nextDue: '',
    veterinarian: '',
    notes: '',
  });

  const [guidanceHistory, setGuidanceHistory] = useState<VetGuidance[]>([]);
  const [currentSymptoms, setCurrentSymptoms] = useState('');
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [guidanceModalVisible, setGuidanceModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingHealthData, setIsLoadingHealthData] = useState<boolean>(false);

  const healthData = {
    steps: 8420,
    calories: 340,
    distance: 5.2,
    activeMinutes: 120,
  };

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // Simulate initial data loading

    return () => clearTimeout(timer);
  }, []);

  const getVeterinaryGuidance = async (symptoms: string) => {
    try {
      setIsLoadingGuidance(true);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a veterinary assistant providing educational information only. Always recommend consulting a real veterinarian for proper diagnosis.'
          }, {
            role: 'user',
            content: `CRITICAL SAFETY RULES:
1. Never provide specific medical diagnoses
2. Always recommend veterinary consultation
3. Classify as: EMERGENCY/URGENT/ROUTINE/INFORMATION
4. Start response with urgency level in brackets like [EMERGENCY], [URGENT], [ROUTINE], or [INFORMATION]

Pet symptoms: ${symptoms}

Provide helpful guidance while emphasizing the need for professional veterinary care. End with: "This is for educational purposes only. Consult a veterinarian for proper diagnosis."`
          }],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get veterinary guidance');
      }

      const data = await response.json();
      const guidance = data.choices[0].message.content;
      
      // Extract urgency level from response
      const urgencyMatch = guidance.match(/\[(EMERGENCY|URGENT|ROUTINE|INFORMATION)\]/);
      const urgency = urgencyMatch ? urgencyMatch[1] as VetGuidance['urgency'] : 'INFORMATION';
      
      const newGuidance: VetGuidance = {
        id: Date.now().toString(),
        symptoms,
        response: guidance,
        urgency,
        timestamp: new Date().toISOString(),
      };

      setGuidanceHistory(prev => [newGuidance, ...prev]);
      setCurrentSymptoms('');
      setGuidanceModalVisible(false);
      
      if (urgency === 'EMERGENCY') {
        Alert.alert(
          '🚨 Emergency Alert',
          'This appears to be an emergency situation. Please contact your veterinarian or emergency animal hospital immediately.',
          [{ text: 'OK', style: 'default' }]
        );
      }
      
    } catch (error) {
      console.error('Error getting veterinary guidance:', error);
      Alert.alert('Error', 'Failed to get veterinary guidance. Please try again.');
    } finally {
      setIsLoadingGuidance(false);
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.type || !newAppointment.date || !newAppointment.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoadingHealthData(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const appointment: Appointment = {
      id: Date.now().toString(),
      petId: pets[0]?.id || 'pet1',
      ...newAppointment,
    };

    setAppointments(prev => [...prev, appointment]);
    setNewAppointment({ type: '', date: '', time: '', veterinarian: '', notes: '' });
    setModalVisible(false);
    setIsLoadingHealthData(false);
    Alert.alert('Success', 'Appointment scheduled successfully!');
  };

  const handleAddRecord = async () => {
    if (!newRecord.title || !newRecord.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoadingHealthData(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const record: HealthRecord = {
      id: Date.now().toString(),
      petId: pets[0]?.id || 'pet1',
      ...newRecord,
    };

    setHealthRecords(prev => [...prev, record]);
    setNewRecord({
      type: 'vaccination',
      title: '',
      description: '',
      date: '',
      nextDue: '',
      veterinarian: '',
      notes: '',
    });
    setRecordModalVisible(false);
    setIsLoadingHealthData(false);
    Alert.alert('Success', 'Health record added successfully!');
  };

  const getRecordIcon = (type: HealthRecord['type']) => {
    switch (type) {
      case 'vaccination': return Syringe;
      case 'medication': return Pill;
      case 'checkup': return Stethoscope;
      case 'treatment': return Heart;
      default: return FileText;
    }
  };

  const getRecordColor = (type: HealthRecord['type']) => {
    switch (type) {
      case 'vaccination': return '#10B981';
      case 'medication': return '#3B82F6';
      case 'checkup': return '#F59E0B';
      case 'treatment': return '#EF4444';
      default: return '#64748B';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getUrgencyColor = (urgency: VetGuidance['urgency']) => {
    switch (urgency) {
      case 'EMERGENCY': return '#EF4444';
      case 'URGENT': return '#F59E0B';
      case 'ROUTINE': return '#10B981';
      case 'INFORMATION': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getUrgencyIcon = (urgency: VetGuidance['urgency']) => {
    switch (urgency) {
      case 'EMERGENCY': return AlertTriangle;
      case 'URGENT': return Clock;
      case 'ROUTINE': return Stethoscope;
      case 'INFORMATION': return Info;
      default: return Info;
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {pets.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart color="#94A3B8" size={48} />
                <Text style={styles.emptyTitle}>No health data</Text>
                <Text style={styles.emptySubtitle}>Add a pet to start tracking their health</Text>
              </View>
            ) : isLoadingHealthData ? (
              <LoadingSpinner 
                text="Sağlık verileri güncelleniyor..."
                style={{ marginTop: 40 }}
              />
            ) : (
              <>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={styles.statIcon}>
                      <Activity color="#FFFFFF" size={20} />
                    </LinearGradient>
                    <Text style={styles.statValue}>{healthData.steps.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Steps Today</Text>
                  </View>

                  <View style={styles.statCard}>
                    <LinearGradient colors={["#4ECDC4", "#6EE7E0"]} style={styles.statIcon}>
                      <TrendingUp color="#FFFFFF" size={20} />
                    </LinearGradient>
                    <Text style={styles.statValue}>{healthData.calories}</Text>
                    <Text style={styles.statLabel}>Calories Burned</Text>
                  </View>

                  <View style={styles.statCard}>
                    <LinearGradient colors={["#45B7D1", "#6BC5E8"]} style={styles.statIcon}>
                      <Activity color="#FFFFFF" size={20} />
                    </LinearGradient>
                    <Text style={styles.statValue}>{healthData.distance} km</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>

                  <View style={styles.statCard}>
                    <LinearGradient colors={["#F093FB", "#F5BCFF"]} style={styles.statIcon}>
                      <Heart color="#FFFFFF" size={20} />
                    </LinearGradient>
                    <Text style={styles.statValue}>{healthData.activeMinutes} min</Text>
                    <Text style={styles.statLabel}>Active Time</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Weekly Activity</Text>
                    <TouchableOpacity>
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.activityChart}>
                    <View style={styles.chartPlaceholder}>
                      <TrendingUp color="#FF6B6B" size={32} />
                      <Text style={styles.chartText}>Activity Chart</Text>
                      <Text style={styles.chartSubtext}>Weekly activity trends</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        );
      
      case 'records':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Health Records</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setRecordModalVisible(true)}>
                <Plus color="#FF6B6B" size={20} />
              </TouchableOpacity>
            </View>

            {isLoadingHealthData ? (
              <LoadingSpinner 
                text="Sağlık kayıtları yükleniyor..."
                style={{ marginTop: 40 }}
              />
            ) : healthRecords.length === 0 ? (
              <NoHealthRecordsEmpty onAdd={() => setRecordModalVisible(true)} />
            ) : (
              healthRecords.map((record) => {
                const IconComponent = getRecordIcon(record.type);
                const color = getRecordColor(record.type);
                const overdue = record.nextDue && isOverdue(record.nextDue);
                
                return (
                  <View key={record.id} style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <View style={[styles.recordIcon, { backgroundColor: `${color}20` }]}>
                        <IconComponent color={color} size={20} />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text style={styles.recordTitle}>{record.title}</Text>
                        <Text style={styles.recordDescription}>{record.description}</Text>
                        <Text style={styles.recordDate}>Date: {formatDate(record.date)}</Text>
                        {record.nextDue && (
                          <Text style={[styles.recordNextDue, overdue && styles.overdue]}>
                            Next due: {formatDate(record.nextDue)} {overdue && '(Overdue)'}
                          </Text>
                        )}
                        {record.veterinarian && (
                          <Text style={styles.recordVet}>Vet: {record.veterinarian}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );
      
      case 'appointments':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Plus color="#FF6B6B" size={20} />
              </TouchableOpacity>
            </View>

            {isLoadingHealthData ? (
              <LoadingSpinner 
                text="Randevular yükleniyor..."
                style={{ marginTop: 40 }}
              />
            ) : appointments.length === 0 ? (
              <NoAppointmentsEmpty onSchedule={() => setModalVisible(true)} />
            ) : (
              appointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentIcon}>
                    <Calendar color="#FF6B6B" size={20} />
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                    <Text style={styles.appointmentVet}>{appointment.veterinarian}</Text>
                    {appointment.notes && (
                      <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                    )}
                  </View>
                  <View style={styles.appointmentTime}>
                    <Text style={styles.appointmentDate}>{formatDate(appointment.date)}</Text>
                    <Text style={styles.appointmentTimeText}>{appointment.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      
      case 'guidance':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Veterinary Guidance</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setGuidanceModalVisible(true)}>
                <MessageCircle color="#FF6B6B" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimerCard}>
              <AlertTriangle color="#F59E0B" size={20} />
              <Text style={styles.disclaimerText}>
                This AI guidance is for educational purposes only. Always consult a licensed veterinarian for proper diagnosis and treatment.
              </Text>
            </View>

            {guidanceHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Stethoscope color="#94A3B8" size={48} />
                <Text style={styles.emptyTitle}>No guidance history</Text>
                <Text style={styles.emptySubtitle}>Ask about your pet's symptoms to get AI-powered veterinary guidance</Text>
                <TouchableOpacity style={styles.createButton} onPress={() => setGuidanceModalVisible(true)}>
                  <Text style={styles.createButtonText}>Ask for Guidance</Text>
                </TouchableOpacity>
              </View>
            ) : (
              guidanceHistory.map((guidance) => {
                const urgencyColor = getUrgencyColor(guidance.urgency);
                const UrgencyIcon = getUrgencyIcon(guidance.urgency);
                
                return (
                  <View key={guidance.id} style={styles.guidanceCard}>
                    <View style={styles.guidanceHeader}>
                      <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}20` }]}>
                        <UrgencyIcon color={urgencyColor} size={16} />
                        <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                          {guidance.urgency}
                        </Text>
                      </View>
                      <Text style={styles.guidanceTimestamp}>
                        {formatDate(guidance.timestamp)}
                      </Text>
                    </View>
                    
                    <Text style={styles.guidanceSymptoms}>
                      <Text style={styles.guidanceSymptomsLabel}>Symptoms: </Text>
                      {guidance.symptoms}
                    </Text>
                    
                    <Text style={styles.guidanceResponse}>
                      {guidance.response.replace(/\[(EMERGENCY|URGENT|ROUTINE|INFORMATION)\]\s*/, '')}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          fullScreen
          text="Sağlık verileri yükleniyor..."
          variant="glass"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Evcil Dostlarım</Text>
        <Text style={styles.subtitle}>Sağlık ve aktivite takibi</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Cards */}
        <View style={styles.petsSection}>
          {mockPets.map((pet) => (
            <LinearGradient
              key={pet.id}
              colors={['#F3E8FF', '#FCE7F3']}
              style={styles.petCard}
            >
              <View style={styles.petCardHeader}>
                <View style={styles.petInfo}>
                  <Image source={{ uri: pet.image }} style={styles.petAvatar} />
                  <View style={styles.petDetails}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>{pet.breed} • {pet.age} yaş</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text style={styles.viewDetailsText}>Detaylar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.petBadges}>
                {pet.vaccinated && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Aşılar Tam</Text>
                  </View>
                )}
                {pet.microchipped && (
                  <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.badgeText, { color: '#1D4ED8' }]}>Mikroçipli</Text>
                  </View>
                )}
                {pet.gpsTracked && (
                  <View style={[styles.badge, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={[styles.badgeText, { color: '#7C3AED' }]}>GPS Takılı</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          ))}
          
          <TouchableOpacity 
            style={styles.addPetButton}
            onPress={() => router.push('/add-pet')}
          >
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addPetButtonText}>Yeni Dost Ekle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Clock color="#F59E0B" size={24} />
            </View>
            <Text style={styles.actionTitle}>Randevular</Text>
            <Text style={styles.actionSubtitle}>2 yaklaşan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              <TrendingUp color="#3B82F6" size={24} />
            </View>
            <Text style={styles.actionTitle}>Sağlık Takibi</Text>
            <Text style={styles.actionSubtitle}>Tümü normal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Appointment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <TouchableOpacity 
              onPress={handleAddAppointment}
              disabled={isLoadingHealthData}
            >
              <Text style={[styles.saveButton, isLoadingHealthData && styles.disabledButton]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {isLoadingHealthData && (
              <View style={styles.loadingOverlay}>
                <LoadingSpinner 
                  text="Randevu kaydediliyor..."
                  variant="minimal"
                />
              </View>
            )}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Appointment Type *</Text>
              <TextInput
                style={styles.input}
                value={newAppointment.type}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, type: text }))}
                placeholder="e.g., Vet Checkup, Grooming"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={newAppointment.date}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                value={newAppointment.time}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, time: text }))}
                placeholder="e.g., 2:00 PM"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Veterinarian/Clinic</Text>
              <TextInput
                style={styles.input}
                value={newAppointment.veterinarian}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, veterinarian: text }))}
                placeholder="Dr. Smith, Pet Clinic"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newAppointment.notes}
                onChangeText={(text) => setNewAppointment(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Health Record Modal */}
      <Modal
        visible={recordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRecordModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Health Record</Text>
            <TouchableOpacity 
              onPress={handleAddRecord}
              disabled={isLoadingHealthData}
            >
              <Text style={[styles.saveButton, isLoadingHealthData && styles.disabledButton]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {isLoadingHealthData && (
              <View style={styles.loadingOverlay}>
                <LoadingSpinner 
                  text="Kayıt ekleniyor..."
                  variant="minimal"
                />
              </View>
            )}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Record Type</Text>
              <View style={styles.typeGrid}>
                {(['vaccination', 'medication', 'checkup', 'treatment'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newRecord.type === type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setNewRecord(prev => ({ ...prev, type }))}
                  >
                    <Text style={[
                      styles.typeLabel,
                      newRecord.type === type && styles.typeLabelSelected,
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newRecord.title}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, title: text }))}
                placeholder="e.g., Rabies Vaccination"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={newRecord.description}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, description: text }))}
                placeholder="Brief description"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={newRecord.date}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Next Due Date</Text>
              <TextInput
                style={styles.input}
                value={newRecord.nextDue}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, nextDue: text }))}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Veterinarian</Text>
              <TextInput
                style={styles.input}
                value={newRecord.veterinarian}
                onChangeText={(text) => setNewRecord(prev => ({ ...prev, veterinarian: text }))}
                placeholder="Dr. Smith"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Veterinary Guidance Modal */}
      <Modal
        visible={guidanceModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setGuidanceModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setGuidanceModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Veterinary Guidance</Text>
            <TouchableOpacity 
              onPress={() => currentSymptoms.trim() && getVeterinaryGuidance(currentSymptoms)}
              disabled={!currentSymptoms.trim() || isLoadingGuidance}
            >
              <Text style={[styles.saveButton, (!currentSymptoms.trim() || isLoadingGuidance) && styles.disabledButton]}>Ask</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.disclaimerCard}>
              <AlertTriangle color="#F59E0B" size={20} />
              <Text style={styles.disclaimerText}>
                This AI provides educational information only. For emergencies, contact your veterinarian immediately.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Describe your pet's symptoms *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentSymptoms}
                onChangeText={setCurrentSymptoms}
                placeholder="Describe what you've observed about your pet's behavior, appetite, energy level, physical symptoms, etc."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                editable={!isLoadingGuidance}
              />
            </View>

            {isLoadingGuidance && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Getting veterinary guidance...</Text>
              </View>
            )}

            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>Example symptoms to describe:</Text>
              <Text style={styles.exampleText}>• Changes in eating or drinking habits</Text>
              <Text style={styles.exampleText}>• Unusual behavior or lethargy</Text>
              <Text style={styles.exampleText}>• Physical symptoms (vomiting, diarrhea, etc.)</Text>
              <Text style={styles.exampleText}>• Changes in mobility or activity level</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  petsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  petCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E879F9',
  },
  petCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  petBreed: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  petBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: (width - 56) / 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  activityChart: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartPlaceholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  chartText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
  },
  chartSubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  appointmentPet: {
    fontSize: 14,
    color: "#64748B",
  },
  appointmentTime: {
    alignItems: "flex-end",
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  appointmentTimeText: {
    fontSize: 12,
    color: "#64748B",
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  recordSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recordDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  recordNextDue: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 2,
  },
  overdue: {
    color: '#EF4444',
    fontWeight: '600',
  },
  recordVet: {
    fontSize: 12,
    color: '#94A3B8',
  },
  appointmentVet: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  appointmentNotes: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  typeLabelSelected: {
    color: '#FFFFFF',
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 20,
  },
  guidanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  guidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  guidanceTimestamp: {
    fontSize: 12,
    color: '#94A3B8',
  },
  guidanceSymptoms: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  guidanceSymptomsLabel: {
    fontWeight: '600',
    color: '#1E293B',
  },
  guidanceResponse: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  exampleContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
});