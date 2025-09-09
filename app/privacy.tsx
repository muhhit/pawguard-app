import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Gizlilik Politikası' }} />
      <ScrollView>
        <Text style={styles.title}>Gizlilik Politikası (MVP)</Text>
        <Text style={styles.p}>Konum verileri gizlilik seviyesine göre bulanıklaştırılabilir veya gizlenebilir; doğru konum, yalnızca uygun güven seviyesindeki kullanıcılara ve onaylı taleplere gösterilir.</Text>
        <Text style={styles.p}>Kullanıcı verileri KVKK/GDPR kapsamında saklanır. Ödeme bilgileri uygulama tarafından tutulmaz.</Text>
        <Text style={styles.p}>İhlal veya kötüye kullanım şüphesi tespit edildiğinde hesap ve erişim kısıtlanabilir.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  p: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
});

