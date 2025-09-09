import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { logEvent } from '@/utils/analytics';
import { tap, success as hSuccess } from '@/utils/haptics';
import { Share2, Send, Copy, Twitter } from 'lucide-react-native';

type SocialShareProps = {
  pet: { id: string; name: string; type?: string; breed?: string | null; last_location?: { lat: number; lng: number } | null; reward_amount?: number };
};

export default function SocialShare({ pet }: SocialShareProps) {
  const appLink = `pawguard://pet/${pet.id}`;
  const webLink = `https://pawguard.app/p/${pet.id}`; // ileride gerçek web deeplink
  const text = `Kayıp ${pet.type || 'evcil hayvan'}: ${pet.name}${pet.breed ? ' (' + pet.breed + ')' : ''}. Ödül: ${pet.reward_amount || 0}₺. Yardımcı olun! ${appLink}`;

  const onShare = async () => {
    try {
      tap();
      await Share.share({ message: text, url: webLink });
      logEvent('share_general', { petId: pet.id });
      hSuccess();
    } catch (e) {
      Alert.alert('Paylaşım başarısız', 'Metni kopyalayıp manuel paylaşabilirsiniz.');
    }
  };

  const openWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).then(() => { logEvent('share_whatsapp', { petId: pet.id }); hSuccess(); }).catch(() => onShare());
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(text).catch(() => {});
    Alert.alert('Kopyalandı', 'Paylaşım metni panoya kopyalandı.');
    logEvent('share_copy', { petId: pet.id });
    hSuccess();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paylaş ve Yay!</Text>
      <Text style={styles.subtitle}>Sosyal medyada paylaşarak daha hızlı bulalım</Text>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onShare}>
          <Share2 size={18} color="#fff" />
          <Text style={styles.btnText}>Genel Paylaş</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.whatsapp]} onPress={openWhatsApp}>
          <Send size={18} color="#fff" />
          <Text style={styles.btnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btn, styles.copy]} onPress={copyToClipboard}>
        <Copy size={18} color="#111827" />
        <Text style={[styles.btnText, styles.copyText]}>Metni Kopyala</Text>
      </TouchableOpacity>

      <Text style={styles.link}>{webLink}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginTop: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  primary: { backgroundColor: '#3b82f6' },
  whatsapp: { backgroundColor: '#22c55e' },
  copy: { backgroundColor: '#f3f4f6', marginTop: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  copyText: { color: '#111827' },
  link: { marginTop: 8, fontSize: 12, color: '#374151' },
});
