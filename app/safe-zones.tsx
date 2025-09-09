import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Shield,
  Home,
  Building,
  Trees,
  Edit3,
  Trash2,
  Bell,
} from 'lucide-react-native';


interface SafeZone {
  id: string;
  name: string;
  type: 'home' | 'park' | 'daycare' | 'custom';
  address: string;
  radius: number;
  isActive: boolean;
  notifications: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const ZONE_TYPES = [
  { id: 'home', label: 'Home', icon: Home, color: '#10B981' },
  { id: 'park', label: 'Park', icon: Trees, color: '#059669' },
  { id: 'daycare', label: 'Daycare', icon: Building, color: '#3B82F6' },
  { id: 'custom', label: 'Custom', icon: MapPin, color: '#8B5CF6' },
] as const;

export default function SafeZonesScreen() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([
    {
      id: '1',
      name: 'Home',
      type: 'home',
      address: '123 Main St, City, State',
      radius: 100,
      isActive: true,
      notifications: true,
      coordinates: { lat: 40.7128, lng: -74.0060 },
    },
    {
      id: '2',
      name: 'Central Park',
      type: 'park',
      address: 'Central Park, New York, NY',
      radius: 200,
      isActive: true,
      notifications: false,
      coordinates: { lat: 40.7829, lng: -73.9654 },
    },
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState<SafeZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'home' as SafeZone['type'],
    address: '',
    radius: 100,
    notifications: true,
  });

  const handleAddZone = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      type: 'home',
      address: '',
      radius: 100,
      notifications: true,
    });
    setModalVisible(true);
  };

  const handleEditZone = (zone: SafeZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      type: zone.type,
      address: zone.address,
      radius: zone.radius,
      notifications: zone.notifications,
    });
    setModalVisible(true);
  };

  const handleSaveZone = () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newZone: SafeZone = {
      id: editingZone?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      address: formData.address,
      radius: formData.radius,
      isActive: true,
      notifications: formData.notifications,
      coordinates: editingZone?.coordinates || { lat: 40.7128, lng: -74.0060 },
    };

    if (editingZone) {
      setSafeZones(zones => zones.map(zone => 
        zone.id === editingZone.id ? newZone : zone
      ));
    } else {
      setSafeZones(zones => [...zones, newZone]);
    }

    setModalVisible(false);
  };

  const handleDeleteZone = (zoneId: string) => {
    Alert.alert(
      'Delete Safe Zone',
      'Are you sure you want to delete this safe zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSafeZones(zones => zones.filter(zone => zone.id !== zoneId));
          },
        },
      ]
    );
  };

  const toggleZoneActive = (zoneId: string) => {
    setSafeZones(zones => zones.map(zone => 
      zone.id === zoneId ? { ...zone, isActive: !zone.isActive } : zone
    ));
  };

  const getZoneTypeInfo = (type: SafeZone['type']) => {
    return ZONE_TYPES.find(t => t.id === type) || ZONE_TYPES[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safe Zones</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddZone}>
          <Plus color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Shield color="#10B981" size={24} />
          <Text style={styles.infoTitle}>Geofencing Protection</Text>
          <Text style={styles.infoText}>
            Set up safe zones for your pets. Get notified when they enter or leave these areas.
          </Text>
        </View>

        {/* Safe Zones List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Safe Zones</Text>
          
          {safeZones.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin color="#94A3B8" size={48} />
              <Text style={styles.emptyTitle}>No safe zones yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first safe zone to start protecting your pets
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={handleAddZone}>
                <Text style={styles.createButtonText}>Create Safe Zone</Text>
              </TouchableOpacity>
            </View>
          ) : (
            safeZones.map((zone) => {
              const typeInfo = getZoneTypeInfo(zone.type);
              const IconComponent = typeInfo.icon;
              
              return (
                <View key={zone.id} style={styles.zoneCard}>
                  <View style={styles.zoneHeader}>
                    <View style={styles.zoneInfo}>
                      <View style={[styles.zoneIcon, { backgroundColor: `${typeInfo.color}20` }]}>
                        <IconComponent color={typeInfo.color} size={20} />
                      </View>
                      <View style={styles.zoneDetails}>
                        <Text style={styles.zoneName}>{zone.name}</Text>
                        <Text style={styles.zoneAddress}>{zone.address}</Text>
                        <Text style={styles.zoneRadius}>Radius: {zone.radius}m</Text>
                      </View>
                    </View>
                    <View style={styles.zoneActions}>
                      <Switch
                        value={zone.isActive}
                        onValueChange={() => toggleZoneActive(zone.id)}
                        trackColor={{ false: '#E2E8F0', true: '#FF6B6B' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.zoneFooter}>
                    <View style={styles.zoneStatus}>
                      <Bell color={zone.notifications ? '#10B981' : '#94A3B8'} size={16} />
                      <Text style={[styles.statusText, { color: zone.notifications ? '#10B981' : '#94A3B8' }]}>
                        {zone.notifications ? 'Notifications On' : 'Notifications Off'}
                      </Text>
                    </View>
                    <View style={styles.zoneButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditZone(zone)}
                      >
                        <Edit3 color="#64748B" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 color="#EF4444" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipsText}>
            • Set smaller radius for indoor areas (50-100m){"\n"}
            • Use larger radius for parks and open areas (200-500m){"\n"}
            • Enable notifications for important zones like home{"\n"}
            • Test your zones by walking around the perimeter
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Zone Modal */}
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
            <Text style={styles.modalTitle}>
              {editingZone ? 'Edit Safe Zone' : 'New Safe Zone'}
            </Text>
            <TouchableOpacity onPress={handleSaveZone}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Zone Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Zone Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter zone name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Zone Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Zone Type</Text>
              <View style={styles.typeGrid}>
                {ZONE_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = formData.type === type.id;
                  
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        isSelected && styles.typeOptionSelected,
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    >
                      <IconComponent 
                        color={isSelected ? '#FFFFFF' : type.color} 
                        size={20} 
                      />
                      <Text style={[
                        styles.typeLabel,
                        isSelected && styles.typeLabelSelected,
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Enter address or location"
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>

            {/* Radius */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Radius (meters)</Text>
              <View style={styles.radiusContainer}>
                <TextInput
                  style={styles.radiusInput}
                  value={formData.radius.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setFormData(prev => ({ ...prev, radius: Math.max(10, Math.min(1000, num)) }));
                  }}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.radiusUnit}>m</Text>
              </View>
              <Text style={styles.helperText}>Range: 10-1000 meters</Text>
            </View>

            {/* Notifications */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.label}>Enable Notifications</Text>
                  <Text style={styles.helperText}>Get alerts when pets enter/leave this zone</Text>
                </View>
                <Switch
                  value={formData.notifications}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, notifications: value }))}
                  trackColor={{ false: '#E2E8F0', true: '#FF6B6B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
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
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  zoneInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  zoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  zoneDetails: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  zoneAddress: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  zoneRadius: {
    fontSize: 12,
    color: '#94A3B8',
  },
  zoneActions: {
    marginLeft: 12,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  zoneButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
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
    gap: 8,
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
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  radiusInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  radiusUnit: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});