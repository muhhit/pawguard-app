import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react-native';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'network' | 'timeout' | 'not-found';
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
  retryText = 'Tekrar Dene',
  type = 'error',
  showRetry = true,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff size={32} color="#ef4444" />;
      case 'timeout':
        return <RefreshCw size={32} color="#f59e0b" />;
      case 'not-found':
        return <AlertCircle size={32} color="#6b7280" />;
      default:
        return <AlertCircle size={32} color="#ef4444" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'network':
        return 'Bağlantı Hatası';
      case 'timeout':
        return 'Zaman Aşımı';
      case 'not-found':
        return 'Bulunamadı';
      default:
        return 'Hata Oluştu';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'network':
        return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      case 'timeout':
        return 'İşlem çok uzun sürdü. Lütfen tekrar deneyin.';
      case 'not-found':
        return 'Aradığınız içerik bulunamadı.';
      default:
        return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.title}>{title || getDefaultTitle()}</Text>
        <Text style={styles.message}>{message || getDefaultMessage()}</Text>
        {showRetry && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <RefreshCw size={16} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.retryButtonText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  compact = false,
}) => {
  return (
    <View style={[styles.inlineContainer, compact && styles.inlineCompact]}>
      <AlertCircle size={16} color="#ef4444" style={styles.inlineIcon} />
      <Text style={[styles.inlineMessage, compact && styles.inlineMessageCompact]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.inlineRetryButton} onPress={onRetry}>
          <RefreshCw size={14} color="#3b82f6" />
        </TouchableOpacity>
      )}
    </View>
  );
};

interface NetworkStatusProps {
  isOnline: boolean;
  onRetry?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  onRetry,
}) => {
  if (isOnline) return null;

  return (
    <View style={styles.networkBanner}>
      <WifiOff size={16} color="#ffffff" style={styles.networkIcon} />
      <Text style={styles.networkText}>İnternet bağlantısı yok</Text>
      {onRetry && (
        <TouchableOpacity style={styles.networkRetryButton} onPress={onRetry}>
          <RefreshCw size={14} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  content: {
    alignItems: 'center',
    maxWidth: 280,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonIcon: {
    marginRight: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
  },
  inlineCompact: {
    padding: 8,
    marginVertical: 4,
  },
  inlineIcon: {
    marginRight: 8,
  },
  inlineMessage: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 18,
  },
  inlineMessageCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  inlineRetryButton: {
    marginLeft: 8,
    padding: 4,
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  networkIcon: {
    marginRight: 8,
  },
  networkText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  networkRetryButton: {
    padding: 4,
  },
});