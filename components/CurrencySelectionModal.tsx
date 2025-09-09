import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useLanguage } from '@/hooks/language-store';

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

const currencies = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺', flag: '🇹🇷' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
] as const;

export default function CurrencySelectionModal({ visible, onClose }: CurrencySelectionModalProps) {
  const { currency, setCurrency, t } = useLanguage();

  const handleCurrencySelect = async (currencyCode: 'TRY' | 'USD' | 'EUR') => {
    await setCurrency(currencyCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('currency.currencySelection')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {t('currency.selectCurrencyDescription')}
        </Text>

        <ScrollView style={styles.content}>
          {currencies.map((curr) => (
            <TouchableOpacity
              key={curr.code}
              style={[
                styles.currencyOption,
                currency === curr.code && styles.selectedOption,
              ]}
              onPress={() => handleCurrencySelect(curr.code)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.flag}>{curr.flag}</Text>
                <View style={styles.currencyDetails}>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                  <Text style={styles.currencyCode}>
                    {curr.code} ({curr.symbol})
                  </Text>
                </View>
              </View>
              {currency === curr.code && (
                <Check size={20} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Para birimi değişikliği tüm ödül miktarlarını etkiler
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});