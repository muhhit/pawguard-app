import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CreditCard, Upload, MessageSquare } from 'lucide-react-native';

interface ManualPaymentInfoProps {
  ownerContact?: string;
  amount: number;
  onMarkPaid: () => void;
}

export default function ManualPaymentInfo({ ownerContact, amount, onMarkPaid }: ManualPaymentInfoProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Manuel Ödeme (MVP)', headerStyle: { backgroundColor: '#f8fafc' } }} />
      <View style={styles.card}>
        <Text style={styles.title}>Platform Dışı Ödeme Akışı</Text>
        <Text style={styles.paragraph}>
          Şirketleşme tamamlanana kadar ödül ödemeleri uygulama dışında (banka/EFT/ödeme linki) yapılır. Bu ekran, süreci
          adım adım yönlendirir ve kanıt yüklenene kadar talebi takip eder.
        </Text>

        <View style={styles.step}>
          <CreditCard size={18} color="#10b981" />
          <Text style={styles.stepText}>1) Ödül tutarı: ₺{amount.toFixed(2)} — anlaşmaya göre banka/EFT ile gönderin.</Text>
        </View>
        <View style={styles.step}>
          <MessageSquare size={18} color="#3b82f6" />
          <Text style={styles.stepText}>
            2) İletişim ve teyit: {ownerContact || 'Sahip iletişim bilgisi'} üzerinden dekontu paylaşın; sahte talep riskini
            azaltmak için teslim kanıtını isteyin.
          </Text>
        </View>
        <View style={styles.step}>
          <Upload size={18} color="#8b5cf6" />
          <Text style={styles.stepText}>
            3) Kanıt yükleme ve kapatma: Ödeme yapıldıktan sonra talebe dekont/kanıt eklenir ve talep ödemesi işaretlenir.
          </Text>
        </View>

        <Text style={styles.note}>
          Not: Bu akış bir “emanet (escrow)” değildir; şirket lisansı/PSP (Iyzico/Stripe) kurulana kadar geçici çözümdür.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={onMarkPaid}>
            <Text style={styles.primaryText}>Ödemeyi Tamamladım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => Linking.openURL('mailto:support@pawguard.app')}>
            <Text style={styles.secondaryText}>Destekle İletişime Geç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#4b5563', marginBottom: 12, lineHeight: 20 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepText: { marginLeft: 8, fontSize: 14, color: '#374151', flex: 1 },
  note: { fontSize: 12, color: '#6b7280', marginTop: 8, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  primary: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  primaryText: { color: 'white', fontWeight: '600' },
  secondary: { backgroundColor: '#eef2ff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  secondaryText: { color: '#4338ca', fontWeight: '600' },
});

