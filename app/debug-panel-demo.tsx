import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bug, Zap, AlertTriangle, Info } from 'lucide-react-native';
import { DebugPanel } from '@/components/DebugPanel';
import GlassContainer from '@/components/GlassContainer';

export default function DebugDemoScreen() {
  const [debugVisible, setDebugVisible] = useState(false);

  const triggerError = () => {
    console.error('Test error message from debug demo');
    Alert.alert('Error Triggered', 'Check the debug panel errors tab');
  };

  const triggerWarning = () => {
    console.warn('Test warning message from debug demo');
    Alert.alert('Warning Triggered', 'Check the debug panel errors tab');
  };

  const triggerInfo = () => {
    console.log('Test info message from debug demo');
    Alert.alert('Info Triggered', 'Check the debug panel errors tab');
  };

  const simulatePerformanceIssue = () => {
    // Simulate heavy computation
    const start = Date.now();
    for (let i = 0; i < 1000000; i++) {
      Math.random();
    }
    const end = Date.now();
    console.log(`Performance test completed in ${end - start}ms`);
    Alert.alert('Performance Test', `Completed in ${end - start}ms`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Debug Panel Demo',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFF',
        }} 
      />
      
      <ScrollView style={styles.content}>
        <GlassContainer style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bug size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Debug Panel Demo</Text>
          </View>
          <Text style={styles.description}>
            Test the debug panel functionality by triggering various events and monitoring app performance.
          </Text>
        </GlassContainer>

        <GlassContainer style={styles.section}>
          <Text style={styles.sectionTitle}>Error Logging Tests</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={[styles.testButton, styles.errorButton]} onPress={triggerError}>
              <AlertTriangle size={20} color="#FFF" />
              <Text style={styles.buttonText}>Trigger Error</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.testButton, styles.warningButton]} onPress={triggerWarning}>
              <AlertTriangle size={20} color="#FFF" />
              <Text style={styles.buttonText}>Trigger Warning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.testButton, styles.infoButton]} onPress={triggerInfo}>
              <Info size={20} color="#FFF" />
              <Text style={styles.buttonText}>Trigger Info</Text>
            </TouchableOpacity>
          </View>
        </GlassContainer>

        <GlassContainer style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Tests</Text>
          <TouchableOpacity style={[styles.testButton, styles.performanceButton]} onPress={simulatePerformanceIssue}>
            <Zap size={20} color="#FFF" />
            <Text style={styles.buttonText}>Simulate Heavy Task</Text>
          </TouchableOpacity>
          <Text style={styles.testDescription}>
            This will simulate a heavy computation task to test performance monitoring.
          </Text>
        </GlassContainer>

        <GlassContainer style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Panel Features</Text>
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>📊 Performance Metrics</Text>
              <Text style={styles.featureDescription}>
                Real-time FPS, render time, memory usage, and component count monitoring
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>📱 Screen Information</Text>
              <Text style={styles.featureDescription}>
                Screen dimensions, scale, font scale, and safe area insets
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>🏗️ Component Tree</Text>
              <Text style={styles.featureDescription}>
                Visual representation of component hierarchy and render counts
              </Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>🐛 Error Logs</Text>
              <Text style={styles.featureDescription}>
                Captured console errors, warnings, and info messages with timestamps
              </Text>
            </View>
          </View>
        </GlassContainer>

        <TouchableOpacity 
          style={styles.openDebugButton} 
          onPress={() => setDebugVisible(true)}
        >
          <Bug size={24} color="#FFF" />
          <Text style={styles.openDebugText}>Open Debug Panel</Text>
        </TouchableOpacity>
      </ScrollView>

      <DebugPanel 
        visible={debugVisible} 
        onClose={() => setDebugVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    minWidth: '45%',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  infoButton: {
    backgroundColor: '#007AFF',
  },
  performanceButton: {
    backgroundColor: '#34C759',
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  featureList: {
    marginTop: 16,
  },
  feature: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  openDebugButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 20,
    gap: 12,
  },
  openDebugText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});