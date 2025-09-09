import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { NavigationDebug } from '@/components/NavigationDebug';
import { Bug } from 'lucide-react-native';

export default function NavigationTestScreen() {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Navigation Test",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowDebugPanel(true)}
              style={styles.debugButton}
            >
              <Bug color="#3B82F6" size={20} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Test Center</Text>
          <Text style={styles.description}>
            This screen helps test and debug navigation issues in the app. 
            Use the debug panel to run comprehensive navigation tests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Issues Fixed</Text>
          <View style={styles.issueList}>
            <View style={styles.issueItem}>
              <Text style={styles.issueTitle}>✅ React Hooks Order</Text>
              <Text style={styles.issueDescription}>
                Fixed &quot;Rendered more hooks than during the previous render&quot; error
              </Text>
            </View>
            
            <View style={styles.issueItem}>
              <Text style={styles.issueTitle}>✅ Route Registration</Text>
              <Text style={styles.issueDescription}>
                Added missing routes to root layout stack navigator
              </Text>
            </View>
            
            <View style={styles.issueItem}>
              <Text style={styles.issueTitle}>✅ Tab Navigation Paths</Text>
              <Text style={styles.issueDescription}>
                Fixed navigation paths to use proper tab routes
              </Text>
            </View>
            
            <View style={styles.issueItem}>
              <Text style={styles.issueTitle}>✅ Parameter Passing</Text>
              <Text style={styles.issueDescription}>
                Ensured proper parameter passing between screens
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Improvements</Text>
          <View style={styles.improvementList}>
            <Text style={styles.improvement}>• Smooth page transitions with fade effects</Text>
            <Text style={styles.improvement}>• Proper error handling for navigation failures</Text>
            <Text style={styles.improvement}>• Comprehensive navigation testing utilities</Text>
            <Text style={styles.improvement}>• Debug panel for real-time navigation testing</Text>
            <Text style={styles.improvement}>• Fixed authentication-based navigation flow</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.openDebugButton}
          onPress={() => setShowDebugPanel(true)}
        >
          <Bug color="#FFFFFF" size={20} />
          <Text style={styles.openDebugButtonText}>Open Debug Panel</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showDebugPanel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDebugPanel(false)}
      >
        <NavigationDebug onClose={() => setShowDebugPanel(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  debugButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  issueList: {
    gap: 12,
  },
  issueItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    paddingLeft: 12,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  improvementList: {
    gap: 8,
  },
  improvement: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  openDebugButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  openDebugButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});