import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🐾 PawGuard</Text>
          <Text style={styles.subtitle}>Hayvan Takip Sistemi</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>847</Text>
            <Text style={styles.statLabel}>Bulunan Pet</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Aktif Arama</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyText}>🚨 Acil Durum</Text>
        </TouchableOpacity>
        
        <View style={styles.petList}>
          <Text style={styles.sectionTitle}>Kayıp Hayvanlar</Text>
          
          <View style={styles.petCard}>
            <Text style={styles.petName}>Miminko</Text>
            <Text style={styles.petInfo}>Scottish Fold • Kadıköy</Text>
            <Text style={styles.rewardText}>Ödül: 500₺</Text>
          </View>
          
          <View style={styles.petCard}>
            <Text style={styles.petName}>Max</Text>
            <Text style={styles.petInfo}>Golden Retriever • Beşiktaş</Text>
            <Text style={styles.rewardText}>Ödül: 1000₺</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    flex: 0.48,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
  },
  emergencyButton: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  petList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  petCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  petInfo: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffeaa7',
    marginTop: 8,
  },
});