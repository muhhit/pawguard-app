import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorMessage, InlineError, NetworkStatus } from '@/components/ErrorComponents';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react-native';

export default function ErrorHandlingDemo() {
  const insets = useSafeAreaInsets();
  const [networkOnline, setNetworkOnline] = useState(true);

  const triggerError = () => {
    // This will cause an error in the component
    throw new Error('Demo error for testing error boundary');
  };

  const handleRetry = () => {
    console.log('Retry button pressed');
    // Simulate retry logic
    setTimeout(() => {
      console.log('Retry completed');
    }, 1000);
  };

  return (
    <ErrorBoundary>
      <Stack.Screen options={{ title: 'Error Handling Demo' }} />
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.title}>Error Handling Components</Text>
        
        {/* Network Status Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, networkOnline ? styles.buttonActive : styles.buttonInactive]}
              onPress={() => setNetworkOnline(!networkOnline)}
            >
              {networkOnline ? <Wifi size={16} color="#ffffff" /> : <WifiOff size={16} color="#ffffff" />}
              <Text style={styles.buttonText}>
                {networkOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>
          <NetworkStatus 
            isOnline={networkOnline} 
            onRetry={handleRetry}
          />
        </View>

        {/* Error Message Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Screen Error Messages</Text>
          
          <View style={styles.errorDemo}>
            <Text style={styles.demoLabel}>Network Error:</Text>
            <ErrorMessage
              type="network"
              title="Bağlantı Hatası"
              message="İnternet bağlantınızı kontrol edin ve tekrar deneyin."
              onRetry={handleRetry}
              retryText="Tekrar Dene"
            />
          </View>

          <View style={styles.errorDemo}>
            <Text style={styles.demoLabel}>Timeout Error:</Text>
            <ErrorMessage
              type="timeout"
              title="Zaman Aşımı"
              message="İşlem çok uzun sürdü. Lütfen tekrar deneyin."
              onRetry={handleRetry}
              retryText="Yeniden Dene"
            />
          </View>

          <View style={styles.errorDemo}>
            <Text style={styles.demoLabel}>Not Found Error:</Text>
            <ErrorMessage
              type="not-found"
              title="İçerik Bulunamadı"
              message="Aradığınız sayfa veya içerik mevcut değil."
              showRetry={false}
            />
          </View>

          <View style={styles.errorDemo}>
            <Text style={styles.demoLabel}>Generic Error:</Text>
            <ErrorMessage
              type="error"
              title="Bir Hata Oluştu"
              message="Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
              onRetry={handleRetry}
              retryText="Tekrar Dene"
            />
          </View>
        </View>

        {/* Inline Error Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inline Errors</Text>
          
          <InlineError 
            message="Veriler yüklenirken bir hata oluştu"
            onRetry={handleRetry}
          />
          
          <InlineError 
            message="Kısa hata mesajı"
            onRetry={handleRetry}
            compact={true}
          />
          
          <InlineError 
            message="Retry butonu olmayan hata mesajı"
          />
        </View>

        {/* Loading States Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loading States</Text>
          
          <View style={styles.loadingDemo}>
            <Text style={styles.demoLabel}>Large Spinner:</Text>
            <LoadingSpinner size="large" color="#8B5CF6" />
          </View>
          
          <View style={styles.loadingDemo}>
            <Text style={styles.demoLabel}>Small Spinner:</Text>
            <LoadingSpinner size="small" color="#10B981" />
          </View>
          
          <View style={styles.loadingDemo}>
            <Text style={styles.demoLabel}>With Text:</Text>
            <View style={styles.loadingWithText}>
              <LoadingSpinner size="small" color="#F59E0B" />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          </View>
        </View>

        {/* Error Boundary Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Boundary</Text>
          <Text style={styles.description}>
            Bu buton bir hata fırlatacak ve Error Boundary tarafından yakalanacak:
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={triggerError}
          >
            <AlertTriangle size={16} color="#ffffff" />
            <Text style={styles.buttonText}>Hata Fırlat</Text>
          </TouchableOpacity>
        </View>

        {/* Usage Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanım Örnekleri</Text>
          <Text style={styles.description}>
            Bu bileşenler şu durumlarda kullanılabilir:
          </Text>
          
          <View style={styles.usageList}>
            <Text style={styles.usageItem}>• API çağrıları başarısız olduğunda</Text>
            <Text style={styles.usageItem}>• Ağ bağlantısı kesildiğinde</Text>
            <Text style={styles.usageItem}>• Veri yükleme sırasında hata oluştuğunda</Text>
            <Text style={styles.usageItem}>• Zaman aşımı durumlarında</Text>
            <Text style={styles.usageItem}>• Beklenmeyen hatalar için</Text>
          </View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#10b981',
  },
  buttonInactive: {
    backgroundColor: '#ef4444',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorDemo: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  demoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  loadingDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  loadingWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  usageList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  usageItem: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 24,
  },
});