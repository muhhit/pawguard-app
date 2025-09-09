import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useRewards, RewardClaimWithPet } from '@/hooks/reward-store';
import { useLanguage } from '@/hooks/language-store';
import { DollarSign, Clock, CheckCircle, XCircle, MessageSquare, CreditCard } from 'lucide-react-native';
import IyzicoPayment from '@/components/IyzicoPayment';
import ManualPaymentInfo from '@/components/ManualPaymentInfo';
import { uploadEvidenceImage } from '@/utils/storage';

const statusColors = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  paid: '#6366f1',
} as const;

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  paid: DollarSign,
} as const;

export default function RewardClaimsScreen() {
  const {
    myRewardClaims,
    myClaims,
    isLoading,
    updateClaimStatus,
    processPayment,
    isUpdatingStatus,
    isProcessingPayment,
    getPendingClaimsCount,
    updateClaimEvidence,
  } = useRewards();
  const { formatCurrency } = useLanguage();

  const [activeTab, setActiveTab] = useState<'received' | 'made'>('received');
  const [selectedClaim, setSelectedClaim] = useState<RewardClaimWithPet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  const pendingCount = getPendingClaimsCount();

  const handleStatusUpdate = async (claimId: string, status: 'approved' | 'rejected' | 'paid') => {
    try {
      await updateClaimStatus(claimId, status);
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const handlePayWithIyzico = (claim: RewardClaimWithPet) => {
    setSelectedClaim(claim);
    setShowPayment(true);
    setShowDetailModal(false);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!selectedClaim) return;
    
    try {
      await processPayment({
        claimId: selectedClaim.id,
        paymentId: paymentData.paymentId,
        paymentMethod: 'iyzico',
        amount: selectedClaim.amount,
      });
      setShowPayment(false);
      setSelectedClaim(null);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Payment Error', error);
    setShowPayment(false);
  };

  const handleManualPayment = (claim: RewardClaimWithPet) => {
    setSelectedClaim(claim);
    setShowManualPayment(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderClaimCard = (claim: any, isOwner: boolean) => {
    const StatusIcon = statusIcons[claim.status as keyof typeof statusIcons];
    const statusColor = statusColors[claim.status as keyof typeof statusColors];

    return (
      <TouchableOpacity
        key={claim.id}
        style={styles.claimCard}
        onPress={() => {
          setSelectedClaim(claim);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.claimHeader}>
          <View style={styles.petInfo}>
            {claim.pet?.photos?.[0] && (
              <Image source={{ uri: claim.pet.photos[0] }} style={styles.petImage} />
            )}
            <View style={styles.petDetails}>
              <Text style={styles.petName}>{claim.pet?.name || 'Unknown Pet'}</Text>
              <Text style={styles.petType}>{claim.pet?.type || 'Pet'}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <StatusIcon size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.claimDetails}>
          <View style={styles.amountContainer}>
            <DollarSign size={16} color="#10b981" />
            <Text style={styles.amount}>{formatCurrency(claim.amount)}</Text>
          </View>
          <Text style={styles.date}>{formatDate(claim.created_at)}</Text>
        </View>

        {!isOwner && (
          <Text style={styles.ownerInfo}>
            Owner: {claim.owner?.name || claim.owner?.email || 'Unknown'}
          </Text>
        )}

        {isOwner && (
          <Text style={styles.claimerInfo}>
            Claimed by: {claim.claimer?.name || claim.claimer?.email || 'Unknown'}
          </Text>
        )}

        {claim.evidence_notes && (
          <Text style={styles.evidenceNotes} numberOfLines={2}>
            &ldquo;{claim.evidence_notes}&rdquo;
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedClaim) return null;

    const isOwner = activeTab === 'received';
    const canUpdateStatus = isOwner && selectedClaim.status === 'pending';

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reward Claim Details</Text>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.petSection}>
              {selectedClaim.pet?.photos?.[0] && (
                <Image
                  source={{ uri: selectedClaim.pet.photos[0] }}
                  style={styles.modalPetImage}
                />
              )}
              <Text style={styles.modalPetName}>{selectedClaim.pet?.name}</Text>
              <Text style={styles.modalPetType}>{selectedClaim.pet?.type}</Text>
            </View>

            <View style={styles.claimSection}>
              <Text style={styles.sectionTitle}>Claim Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Amount:</Text>
                <Text style={styles.infoValue}>{formatCurrency(selectedClaim.amount)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[styles.infoValue, { color: statusColors[selectedClaim.status] }]}>
                  {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted:</Text>
                <Text style={styles.infoValue}>{formatDate(selectedClaim.created_at)}</Text>
              </View>
            </View>

            {selectedClaim.evidence_notes && (
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionTitle}>Evidence Notes</Text>
                <Text style={styles.evidenceText}>{selectedClaim.evidence_notes}</Text>
              </View>
            )}

            {selectedClaim.evidence_photo && (
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionTitle}>Evidence Photo</Text>
                <Image
                  source={{ uri: selectedClaim.evidence_photo }}
                  style={styles.evidenceImage}
                />
              </View>
            )}

            {!selectedClaim.evidence_photo && (
              <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Upload Evidence</Text>
                <View style={styles.paymentButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.iyzicoButton]}
                    onPress={async () => {
                      try {
                        setIsUploadingEvidence(true);
                        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (!perm.granted) {
                          Alert.alert('Permission required', 'Photo library permission is required.');
                          setIsUploadingEvidence(false);
                          return;
                        }
                        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                        if (res.canceled || !res.assets?.[0]?.uri) { setIsUploadingEvidence(false); return; }
                        const uri = res.assets[0].uri;
                        const url = await uploadEvidenceImage(uri, selectedClaim.id);
                        await updateClaimEvidence({ claimId: selectedClaim.id, evidencePhoto: url });
                        Alert.alert('Uploaded', 'Evidence uploaded successfully.');
                        setSelectedClaim({ ...selectedClaim, evidence_photo: url } as any);
                      } catch (e: any) {
                        console.error(e);
                        Alert.alert('Upload failed', e?.message || 'Could not upload');
                      } finally {
                        setIsUploadingEvidence(false);
                      }
                    }}
                    disabled={isUploadingEvidence}
                  >
                    <Text style={styles.actionButtonText}>{isUploadingEvidence ? 'Uploading...' : 'Choose Photo'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {canUpdateStatus && (
              <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleStatusUpdate(selectedClaim.id, 'approved')}
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle size={20} color="white" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleStatusUpdate(selectedClaim.id, 'rejected')}
                    disabled={isUpdatingStatus}
                  >
                    <XCircle size={20} color="white" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isOwner && selectedClaim.status === 'approved' && (
              <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Payment Options</Text>
                <View style={styles.paymentButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.iyzicoButton]}
                    onPress={() => handlePayWithIyzico(selectedClaim)}
                    disabled={isProcessingPayment}
                  >
                    <CreditCard size={20} color="white" />
                    <Text style={styles.actionButtonText}>Pay with Iyzico</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.paidButton]}
                    onPress={() => handleManualPayment(selectedClaim)}
                    disabled={isUpdatingStatus}
                  >
                    <DollarSign size={20} color="white" />
                    <Text style={styles.actionButtonText}>Manual (EFT/IBAN)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.paidButton]}
                    onPress={() => handleStatusUpdate(selectedClaim.id, 'paid')}
                    disabled={isUpdatingStatus}
                  >
                    <DollarSign size={20} color="white" />
                    <Text style={styles.actionButtonText}>Mark as Paid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedClaim.status === 'paid' && selectedClaim.payment_method && (
              <View style={styles.paymentInfoSection}>
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Method:</Text>
                  <Text style={styles.infoValue}>
                    {selectedClaim.payment_method === 'iyzico' ? 'Iyzico' : 'Manual'}
                  </Text>
                </View>
                {selectedClaim.payment_id && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment ID:</Text>
                    <Text style={[styles.infoValue, styles.paymentId]}>
                      {selectedClaim.payment_id}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Reward Claims',
          headerStyle: { backgroundColor: '#f8fafc' },
        }}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received Claims
          </Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'made' && styles.activeTab]}
          onPress={() => setActiveTab('made')}
        >
          <Text style={[styles.tabText, activeTab === 'made' && styles.activeTabText]}>
            My Claims
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading claims...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'received' && (
              <>
                {myRewardClaims.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <DollarSign size={48} color="#9ca3af" />
                    <Text style={styles.emptyTitle}>No reward claims yet</Text>
                    <Text style={styles.emptyText}>
                      Claims for your lost pets will appear here
                    </Text>
                  </View>
                ) : (
                  myRewardClaims.map((claim) => renderClaimCard(claim, true))
                )}
              </>
            )}

            {activeTab === 'made' && (
              <>
                {myClaims.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MessageSquare size={48} color="#9ca3af" />
                    <Text style={styles.emptyTitle}>No claims made</Text>
                    <Text style={styles.emptyText}>
                      Your reward claims will appear here
                    </Text>
                  </View>
                ) : (
                  myClaims.map((claim) => renderClaimCard(claim, false))
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {renderDetailModal()}
      
      {selectedClaim && (
        <IyzicoPayment
          visible={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedClaim(null);
          }}
          rewardAmount={selectedClaim.amount}
          sellerId={selectedClaim.claimer_id}
          claimId={selectedClaim.id}
          petName={selectedClaim.pet?.name || 'Pet'}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}

      {selectedClaim && showManualPayment && (
        <Modal visible={showManualPayment} animationType="slide" presentationStyle="pageSheet">
          <ManualPaymentInfo
            ownerContact={selectedClaim.owner?.email}
            amount={selectedClaim.amount}
            onMarkPaid={async () => {
              await handleStatusUpdate(selectedClaim.id, 'paid');
              setShowManualPayment(false);
              setSelectedClaim(null);
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  claimCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  petType: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  claimDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  ownerInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  claimerInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  evidenceNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  petSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalPetImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  modalPetName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  modalPetType: {
    fontSize: 16,
    color: '#6b7280',
  },
  claimSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  evidenceSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  evidenceText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  actionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  paidButton: {
    backgroundColor: '#6366f1',
  },
  iyzicoButton: {
    backgroundColor: '#3b82f6',
  },
  paymentButtons: {
    gap: 12,
  },
  paymentInfoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentId: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
