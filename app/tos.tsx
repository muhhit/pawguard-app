import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function ToSScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Kullanım Şartları' }} />
      <ScrollView>
        <Text style={styles.title}>Kullanım Şartları (MVP)</Text>
        <Text style={styles.p}>PawGuard, şirketleşme öncesi aşamada bir ödeme aracısı değildir. Ödül ödemeleri platform dışında gerçekleşir; uygulama sadece ilan, koordinasyon ve kanıt takibini sağlar.</Text>
        <Text style={styles.p}>Sokak hayvanlarının gizliliği için konumlar bulanıklaştırılabilir veya gizlenebilir. Kötüye kullanım tespiti halinde erişim kısıtlanır.</Text>
        <Text style={styles.p}>Hizmet şartları zaman içinde güncellenebilir. Uygulamayı kullanmaya devam ederek güncellenen şartları kabul etmiş sayılırsınız.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  p: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
});

