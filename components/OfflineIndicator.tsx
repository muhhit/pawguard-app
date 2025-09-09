import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  message?: string;
  showRetryButton?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  message = 'No internet connection. Please check your network settings.',
  showRetryButton = true,
}) => {
  const networkState = useNetworkStatus();

  if (networkState.isConnected && networkState.isInternetReachable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <WifiOff size={48} color="#FF6B6B" />
        <Text style={styles.title}>You&apos;re offline</Text>
        <Text style={styles.message}>{message}</Text>
        {showRetryButton && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <RefreshCw size={16} color="white" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface OfflineWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

export const OfflineWrapper: React.FC<OfflineWrapperProps> = ({
  children,
  fallback,
  onRetry,
}) => {
  const networkState = useNetworkStatus();

  if (!networkState.isConnected || !networkState.isInternetReachable) {
    return (
      <>
        {fallback || <OfflineIndicator onRetry={onRetry} />}
      </>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});