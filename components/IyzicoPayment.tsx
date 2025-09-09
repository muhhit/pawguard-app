import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { X, CreditCard, Shield, TrendingUp } from 'lucide-react-native';

interface IyzicoPaymentProps {
  visible: boolean;
  onClose: () => void;
  rewardAmount: number;
  sellerId: string;
  claimId: string;
  petName: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentInitResponse {
  success: boolean;
  paymentPageUrl?: string;
  token?: string;
  error?: string;
}

export default function IyzicoPayment({
  visible,
  onClose,
  rewardAmount,
  sellerId,
  claimId,
  petName,
  onPaymentSuccess,
  onPaymentError,
}: IyzicoPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (apiBase) {
        const response = await fetch(`${apiBase}/payments/iyzico/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: rewardAmount, sellerId, claimId, petName })
        });
        if (!response.ok) throw new Error(`Init failed: ${response.status}`);
        const data: PaymentInitResponse = await response.json();
        if (data.success && data.paymentPageUrl) {
          setPaymentUrl(data.paymentPageUrl);
        } else if (data.token) {
          setPaymentUrl(`https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/auth/1/token/${data.token}`);
        } else {
          throw new Error(data.error || 'Invalid init response');
        }
      } else {
        // Fallback simulation when backend is not configured
        const mockPaymentUrl = `https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/auth/1/token/${Date.now()}`;
        setPaymentUrl(mockPaymentUrl);
      }
      setShowWebView(true);
    } catch (error) {
      console.error('Payment initialization error:', error);
      onPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Check for success/failure URLs
    if (url.includes('payment-success') || url.includes('success')) {
      setShowWebView(false);
      onPaymentSuccess({
        paymentId: `iyzico_${Date.now()}`,
        amount: rewardAmount,
        currency: 'TRY',
        status: 'success',
        claimId,
      });
      onClose();
    } else if (url.includes('payment-error') || url.includes('error') || url.includes('cancel')) {
      setShowWebView(false);
      onPaymentError('Payment was cancelled or failed.');
    }
  };

  const handleWebViewError = () => {
    setShowWebView(false);
    onPaymentError('Payment page failed to load. Please check your internet connection.');
  };

  const handleClose = () => {
    setShowWebView(false);
    setPaymentUrl(null);
    onClose();
  };

  if (showWebView && paymentUrl) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Secure Payment</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            style={styles.webView}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            onError={handleWebViewError}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading secure payment...</Text>
              </View>
            )}
            // Security settings
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Secure Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.paymentInfo}>
            <View style={styles.iconContainer}>
              <CreditCard size={32} color="#3b82f6" />
            </View>
            <Text style={styles.paymentTitle}>Reward Payment</Text>
            <Text style={styles.petName}>for finding {petName}</Text>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amount}>₺{rewardAmount.toFixed(2)}</Text>
              <Text style={styles.currency}>Turkish Lira</Text>
            </View>
          </View>

          <View style={styles.securityInfo}>
            <View style={styles.securityItem}>
              <Shield size={20} color="#10b981" />
              <Text style={styles.securityText}>Secured by Iyzico</Text>
            </View>
            <View style={styles.securityItem}>
              <TrendingUp size={20} color="#10b981" />
              <Text style={styles.securityText}>15% platform fee included</Text>
            </View>
          </View>

          <View style={styles.paymentDetails}>
            <Text style={styles.detailsTitle}>Payment Breakdown</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reward Amount</Text>
              <Text style={styles.detailValue}>₺{(rewardAmount * 0.85).toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Platform Fee (15%)</Text>
              <Text style={styles.detailValue}>₺{(rewardAmount * 0.15).toFixed(2)}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₺{rewardAmount.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            By proceeding, you agree to pay the reward amount to the pet finder. 
            Payment will be processed securely through Iyzico.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, isLoading && styles.disabledButton]}
            onPress={initializePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <CreditCard size={20} color="white" />
                <Text style={styles.payButtonText}>Pay with Iyzico</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  paymentInfo: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 4,
  },
  currency: {
    fontSize: 14,
    color: '#6b7280',
  },
  securityInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  paymentDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // WebView styles
  webViewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
