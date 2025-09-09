import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Stethoscope, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  X,
  Plus,
  CheckCircle,
  Clock,
  Target,
  Handshake
} from 'lucide-react-native';

interface VeterinaryPartnershipProps {
  visible: boolean;
  onClose: () => void;
}

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  patients: number;
  status: 'prospect' | 'contacted' | 'negotiating' | 'partner';
  expectedUsers: number;
  monthlyRevenue: number;
}

interface RevenueShare {
  service: string;
  clinicShare: number;
  pawguardShare: number;
  description: string;
}

export default function VeterinaryPartnership({ visible, onClose }: VeterinaryPartnershipProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'clinics' | 'revenue' | 'onboarding'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddClinic, setShowAddClinic] = useState<boolean>(false);
  const [newClinic, setNewClinic] = useState<Partial<VetClinic>>({});

  const partnerClinics: VetClinic[] = [
    {
      id: '1',
      name: 'Istanbul Veterinary Hospital',
      address: 'Beşiktaş, Istanbul',
      phone: '+90 212 555 0123',
      email: 'info@istanbulvet.com',
      patients: 4500,
      status: 'partner',
      expectedUsers: Math.round(4500 * 0.12),
      monthlyRevenue: 810
    },
    {
      id: '2',
      name: 'Ankara Pet Clinic',
      address: 'Çankaya, Ankara',
      phone: '+90 312 555 0456',
      email: 'contact@ankarapet.com',
      patients: 3200,
      status: 'negotiating',
      expectedUsers: Math.round(3200 * 0.12),
      monthlyRevenue: 576
    },
    {
      id: '3',
      name: 'Izmir Animal Care',
      address: 'Konak, Izmir',
      phone: '+90 232 555 0789',
      email: 'hello@izmircare.com',
      patients: 2800,
      status: 'contacted',
      expectedUsers: Math.round(2800 * 0.12),
      monthlyRevenue: 504
    },
    {
      id: '4',
      name: 'Bursa Veterinary Center',
      address: 'Osmangazi, Bursa',
      phone: '+90 224 555 0321',
      email: 'info@bursavet.com',
      patients: 3800,
      status: 'prospect',
      expectedUsers: Math.round(3800 * 0.12),
      monthlyRevenue: 684
    }
  ];

  const revenueShares: RevenueShare[] = [
    {
      service: 'Microchip Registration',
      clinicShare: 3,
      pawguardShare: 2,
      description: 'Per microchip registration fee split'
    },
    {
      service: 'Premium Subscriptions',
      clinicShare: 15,
      pawguardShare: 85,
      description: '15% commission on premium subscriptions'
    },
    {
      service: 'Pet Insurance Referral',
      clinicShare: 25,
      pawguardShare: 0,
      description: 'Flat fee per successful insurance signup'
    }
  ];

  const overallMetrics = {
    targetClinics: 100,
    currentPartners: partnerClinics.filter(c => c.status === 'partner').length,
    avgPatientsPerClinic: 3000,
    conversionRate: 0.12,
    expectedUsers: 10800,
    monthlyRevenue: 1620,
    timeToOnboard: '2-3 weeks'
  };

  const handleContactClinic = useCallback(async (clinicId: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Contact Initiated! 📞',
        'Partnership proposal has been sent to the clinic. Our business development team will follow up within 24 hours.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to contact clinic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddClinic = useCallback(async () => {
    if (!newClinic.name || !newClinic.address || !newClinic.patients) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Clinic Added! ✅',
        `${newClinic.name} has been added to the prospect list. Our team will begin outreach soon.`,
        [{ text: 'OK' }]
      );
      
      setNewClinic({});
      setShowAddClinic(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add clinic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [newClinic]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'partner': return '#10B981';
      case 'negotiating': return '#F59E0B';
      case 'contacted': return '#6366F1';
      case 'prospect': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'partner': return <CheckCircle color="#10B981" size={16} />;
      case 'negotiating': return <Handshake color="#F59E0B" size={16} />;
      case 'contacted': return <Mail color="#6366F1" size={16} />;
      default: return <Clock color="#6B7280" size={16} />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veterinary Partnership Program</Text>
        <Text style={styles.sectionDescription}>
          Strategic partnerships with veterinary clinics to drive user acquisition and create recurring revenue streams.
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{overallMetrics.currentPartners}</Text>
          <Text style={styles.metricLabel}>Active Partners</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{overallMetrics.expectedUsers.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Expected Users</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{formatCurrency(overallMetrics.monthlyRevenue)}</Text>
          <Text style={styles.metricLabel}>Monthly Revenue</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{Math.round(overallMetrics.conversionRate * 100)}%</Text>
          <Text style={styles.metricLabel}>Conversion Rate</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target color="#FF6B6B" size={20} />
          <Text style={styles.sectionTitle}>Program Goals</Text>
        </View>
        
        <View style={styles.goalsCard}>
          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Target Clinics</Text>
            <Text style={styles.goalValue}>{overallMetrics.targetClinics}</Text>
            <Text style={styles.goalProgress}>
              {overallMetrics.currentPartners}/{overallMetrics.targetClinics} achieved
            </Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Avg Patients per Clinic</Text>
            <Text style={styles.goalValue}>{overallMetrics.avgPatientsPerClinic.toLocaleString()}</Text>
            <Text style={styles.goalProgress}>Industry benchmark</Text>
          </View>
          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Onboarding Time</Text>
            <Text style={styles.goalValue}>{overallMetrics.timeToOnboard}</Text>
            <Text style={styles.goalProgress}>From contact to launch</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderClinics = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Building2 color="#FF6B6B" size={20} />
        <Text style={styles.sectionTitle}>Partner Clinics</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddClinic(true)}
        >
          <Plus color="#FFFFFF" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.clinicsList}>
        {partnerClinics.map((clinic) => (
          <View key={clinic.id} style={styles.clinicCard}>
            <View style={styles.clinicHeader}>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                <View style={styles.clinicLocation}>
                  <MapPin color="#64748B" size={14} />
                  <Text style={styles.clinicAddress}>{clinic.address}</Text>
                </View>
              </View>
              <View style={styles.clinicStatus}>
                {getStatusIcon(clinic.status)}
                <Text style={[styles.statusText, { color: getStatusColor(clinic.status) }]}>
                  {clinic.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.clinicMetrics}>
              <View style={styles.clinicMetric}>
                <Users color="#64748B" size={16} />
                <Text style={styles.metricText}>{clinic.patients.toLocaleString()} patients</Text>
              </View>
              <View style={styles.clinicMetric}>
                <TrendingUp color="#64748B" size={16} />
                <Text style={styles.metricText}>{clinic.expectedUsers} expected users</Text>
              </View>
              <View style={styles.clinicMetric}>
                <DollarSign color="#64748B" size={16} />
                <Text style={styles.metricText}>{formatCurrency(clinic.monthlyRevenue)}/month</Text>
              </View>
            </View>
            
            <View style={styles.clinicContact}>
              <View style={styles.contactInfo}>
                <Phone color="#64748B" size={14} />
                <Text style={styles.contactText}>{clinic.phone}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Mail color="#64748B" size={14} />
                <Text style={styles.contactText}>{clinic.email}</Text>
              </View>
            </View>
            
            {clinic.status === 'prospect' && (
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleContactClinic(clinic.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.contactButtonText}>Contact Clinic</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderRevenue = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Sharing Model</Text>
        <Text style={styles.sectionDescription}>
          Transparent and fair revenue sharing that incentivizes clinic participation while ensuring profitability.
        </Text>
      </View>

      <View style={styles.revenueList}>
        {revenueShares.map((revenue, index) => (
          <View key={index} style={styles.revenueCard}>
            <Text style={styles.revenueService}>{revenue.service}</Text>
            <Text style={styles.revenueDescription}>{revenue.description}</Text>
            
            <View style={styles.revenueShares}>
              <View style={styles.shareItem}>
                <Text style={styles.shareLabel}>Clinic Gets</Text>
                <Text style={styles.shareValue}>
                  {revenue.service === 'Premium Subscriptions' 
                    ? `${revenue.clinicShare}%` 
                    : `$${revenue.clinicShare}`
                  }
                </Text>
              </View>
              <View style={styles.shareItem}>
                <Text style={styles.shareLabel}>PawGuard Gets</Text>
                <Text style={styles.shareValue}>
                  {revenue.service === 'Premium Subscriptions' 
                    ? `${revenue.pawguardShare}%` 
                    : revenue.pawguardShare > 0 
                      ? `$${revenue.pawguardShare}` 
                      : 'Referral fee only'
                  }
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.projectionCard}>
        <Text style={styles.projectionTitle}>Revenue Projections</Text>
        <View style={styles.projectionMetrics}>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Monthly Revenue per Clinic</Text>
            <Text style={styles.projectionValue}>$162 average</Text>
          </View>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Total Monthly Revenue (100 clinics)</Text>
            <Text style={styles.projectionValue}>{formatCurrency(overallMetrics.monthlyRevenue)}</Text>
          </View>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Annual Revenue Potential</Text>
            <Text style={styles.projectionValue}>{formatCurrency(overallMetrics.monthlyRevenue * 12)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderOnboarding = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clinic Onboarding Process</Text>
        <Text style={styles.sectionDescription}>
          Streamlined process to get veterinary clinics up and running with PawGuard integration.
        </Text>
      </View>

      <View style={styles.onboardingSteps}>
        {[
          {
            step: 1,
            title: 'Initial Contact',
            description: 'Reach out to clinic with partnership proposal and benefits overview',
            duration: '1-2 days'
          },
          {
            step: 2,
            title: 'Partnership Agreement',
            description: 'Negotiate terms, revenue sharing, and sign partnership contract',
            duration: '3-5 days'
          },
          {
            step: 3,
            title: 'Technical Integration',
            description: 'Set up clinic portal, train staff, and integrate with existing systems',
            duration: '1 week'
          },
          {
            step: 4,
            title: 'Marketing Launch',
            description: 'Launch marketing materials, patient education, and promotional campaigns',
            duration: '2-3 days'
          },
          {
            step: 5,
            title: 'Ongoing Support',
            description: 'Continuous support, performance monitoring, and optimization',
            duration: 'Ongoing'
          }
        ].map((step) => (
          <View key={step.step} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.step}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
              <Text style={styles.stepDuration}>Duration: {step.duration}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Vet Partnerships</Text>
            <Text style={styles.subtitle}>Strategic clinic partnerships</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'clinics', label: 'Clinics', icon: Building2 },
            { key: 'revenue', label: 'Revenue', icon: DollarSign },
            { key: 'onboarding', label: 'Process', icon: Stethoscope }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
                onPress={() => setSelectedTab(tab.key as any)}
              >
                <Icon 
                  color={selectedTab === tab.key ? '#FF6B6B' : '#64748B'} 
                  size={16} 
                />
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'clinics' && renderClinics()}
          {selectedTab === 'revenue' && renderRevenue()}
          {selectedTab === 'onboarding' && renderOnboarding()}
        </View>

        {/* Add Clinic Modal */}
        <Modal
          visible={showAddClinic}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Clinic</Text>
              
              <TextInput
                style={styles.input}
                value={newClinic.name || ''}
                onChangeText={(text) => setNewClinic({...newClinic, name: text})}
                placeholder="Clinic Name *"
                placeholderTextColor="#94A3B8"
              />
              
              <TextInput
                style={styles.input}
                value={newClinic.address || ''}
                onChangeText={(text) => setNewClinic({...newClinic, address: text})}
                placeholder="Address *"
                placeholderTextColor="#94A3B8"
              />
              
              <TextInput
                style={styles.input}
                value={newClinic.phone || ''}
                onChangeText={(text) => setNewClinic({...newClinic, phone: text})}
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                value={newClinic.email || ''}
                onChangeText={(text) => setNewClinic({...newClinic, email: text})}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                value={newClinic.patients?.toString() || ''}
                onChangeText={(text) => setNewClinic({...newClinic, patients: parseInt(text) || 0})}
                placeholder="Number of Patients *"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowAddClinic(false);
                    setNewClinic({});
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalSubmitButton, isLoading && styles.modalSubmitButtonDisabled]}
                  onPress={handleAddClinic}
                  disabled={isLoading}
                >
                  <Text style={styles.modalSubmitText}>
                    {isLoading ? 'Adding...' : 'Add Clinic'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#FEF2F2',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  goalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalItem: {
    flex: 1,
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  goalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  clinicsList: {
    gap: 16,
  },
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  clinicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  clinicLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#64748B',
  },
  clinicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  clinicMetrics: {
    gap: 8,
    marginBottom: 16,
  },
  clinicMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 14,
    color: '#64748B',
  },
  clinicContact: {
    gap: 4,
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#64748B',
  },
  contactButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  revenueList: {
    gap: 16,
    marginBottom: 24,
  },
  revenueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  revenueService: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  revenueDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  revenueShares: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareItem: {
    alignItems: 'center',
  },
  shareLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  shareValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  projectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  projectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  projectionMetrics: {
    gap: 12,
  },
  projectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectionLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  projectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  onboardingSteps: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  stepDuration: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});