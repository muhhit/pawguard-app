import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Wifi, WifiOff, RefreshCw, Globe } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineIndicator, OfflineWrapper } from '@/components/OfflineIndicator';

export default function OfflineModeDemo() {
  const networkState = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(false);

  const simulateNetworkRequest = async () => {
    setIsLoading(true);
    try {
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Network request completed successfully!');
    } catch {
      Alert.alert('Error', 'Network request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    Alert.alert('Retry', 'Attempting to reconnect...');
    simulateNetworkRequest();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Offline Mode Demo' }} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              {networkState.isConnected ? (
                <Wifi size={24} color="#4ECDC4" />
              ) : (
                <WifiOff size={24} color="#FF6B6B" />
              )}
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {networkState.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  Type: {networkState.type}
                </Text>
                <Text style={styles.statusSubtitle}>
                  Internet: {networkState.isInternetReachable ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Wrapper Demo</Text>
          <OfflineWrapper onRetry={handleRetry}>
            <View style={styles.contentCard}>
              <Globe size={32} color="#007AFF" />
              <Text style={styles.contentTitle}>Online Content</Text>
              <Text style={styles.contentText}>
                This content is only visible when you have an internet connection.
                It will be replaced with an offline indicator when disconnected.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={simulateNetworkRequest}
                disabled={isLoading}
              >
                <RefreshCw size={16} color="white" />
                <Text style={styles.buttonText}>
                  {isLoading ? 'Loading...' : 'Make Network Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </OfflineWrapper>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standalone Offline Indicator</Text>
          <OfflineIndicator
            onRetry={handleRetry}
            message="This is a custom offline message. You can customize the text and retry behavior."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>
              To test offline mode:
            </Text>
            <Text style={styles.instructionStep}>
              • On web: Open DevTools → Network tab → Set to &quot;Offline&quot;
            </Text>
            <Text style={styles.instructionStep}>
              • On mobile: Turn off WiFi and cellular data
            </Text>
            <Text style={styles.instructionStep}>
              • Watch the red banner appear at the top
            </Text>
            <Text style={styles.instructionStep}>
              • See how content changes when offline
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
  },
});