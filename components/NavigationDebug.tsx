import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  NavigationTester, 
  type NavigationTestResult,
  testAllNavigation,
  testNavigationPatterns 
} from '@/utils/navigationTest';
import { CheckCircle, XCircle, Play, RotateCcw } from 'lucide-react-native';

interface NavigationDebugProps {
  onClose?: () => void;
}

export function NavigationDebug({ onClose }: NavigationDebugProps) {
  const [testResults, setTestResults] = useState<NavigationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    NavigationTester.clearResults();
    
    try {
      const results = await testAllNavigation();
      await testNavigationPatterns();
      
      setTestResults(NavigationTester.getResults());
    } catch (error) {
      console.error('Navigation test error:', error);
      Alert.alert('Test Error', 'Failed to run navigation tests');
    } finally {
      setIsRunning(false);
    }
  };

  const testSingleRoute = async (route: string) => {
    try {
      const result = await NavigationTester.testRoute(route);
      setTestResults(prev => [...prev, result]);
      
      if (result.success) {
        Alert.alert('Success', `Navigation to ${route} successful`);
      } else {
        Alert.alert('Failed', `Navigation to ${route} failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Single route test error:', error);
    }
  };

  const clearResults = () => {
    NavigationTester.clearResults();
    setTestResults([]);
  };

  const commonRoutes = [
    { name: 'Home', route: '/(tabs)' },
    { name: 'Profile', route: '/(tabs)/profile' },
    { name: 'Map', route: '/(tabs)/map' },
    { name: 'Hero Board', route: '/(tabs)/hero-board' },
    { name: 'Report Pet', route: '/(tabs)/report-pet' },
    { name: 'Add Pet', route: '/add-pet' },
    { name: 'Pet Details', route: '/pet-details' },
    { name: 'Success Stories', route: '/success-stories' },
    { name: 'Premium', route: '/premium-subscription' },
    { name: 'AI Scanner', route: '/ai-pet-scanner' },
  ];

  const successCount = testResults.filter(r => r.success).length;
  const failureCount = testResults.filter(r => !r.success).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Navigation Debug Panel</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Play color="#FFFFFF" size={16} />
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <RotateCcw color="#64748B" size={16} />
          <Text style={styles.secondaryButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Results: {successCount} passed, {failureCount} failed
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick Test Routes</Text>
      <View style={styles.routeGrid}>
        {commonRoutes.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.routeButton}
            onPress={() => testSingleRoute(item.route)}
          >
            <Text style={styles.routeButtonText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Test Results</Text>
      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No test results yet. Run tests to see results.</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                {result.success ? (
                  <CheckCircle color="#10B981" size={16} />
                ) : (
                  <XCircle color="#EF4444" size={16} />
                )}
                <Text style={[
                  styles.resultRoute,
                  result.success ? styles.successText : styles.errorText
                ]}>
                  {result.route}
                </Text>
              </View>
              {result.error && (
                <Text style={styles.errorMessage}>{result.error}</Text>
              )}
              <Text style={styles.timestamp}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  summary: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 8,
  },
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  routeButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  routeButtonText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  results: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  noResults: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 20,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultRoute: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  successText: {
    color: '#059669',
  },
  errorText: {
    color: '#DC2626',
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});