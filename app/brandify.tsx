import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import SkiaParallaxCard from '@/components/SkiaParallaxCard';
import SkiaParallaxVideo from '@/components/SkiaParallaxVideo';
import { Stack, useLocalSearchParams } from 'expo-router';
import { logEvent } from '@/utils/analytics';
import { tap, success as hSuccess } from '@/utils/haptics';
import { usePets } from '@/hooks/pet-store';
import { usePremium } from '@/hooks/premium-store';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BrandifyScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { getPetById } = usePets();
  const { isPremium, hasActiveTrial } = usePremium();
  const pet = params.id ? getPetById(params.id) : null;
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<{ front?: string; left15?: string; right15?: string; video?: string }>({});

  const petPhoto = pet?.photos?.[0];

  const simulateParallax = () => {
    tap();
    Alert.alert('Standart 2.5D', 'Bu cihazda basit parallax önizlemesi gösterilir. Premium sürüm bulutta yüksek kalite üretir.');
    logEvent('brandify_parallax_preview', { petId: pet?.id });
  };

  const callBrandify = async () => {
    if (!isPremium && !hasActiveTrial) {
      Alert.alert('Premium gerekli', 'Premium Brandify için premium gerekir. Ücretsiz denemeyi başlatmak ister misiniz?', [
        { text: 'Daha sonra' },
        { text: 'Premium', onPress: () => router.push('/premium-subscription') }
      ]);
      return;
    }
    try {
      if (!petPhoto) { Alert.alert('Fotoğraf yok', 'Önce pet fotoğrafı ekleyin.'); return; }
      const api = process.env.EXPO_PUBLIC_API_BASE_URL;
      setLoading(true);
      if (!api) {
        // Mock outputs
        setTimeout(() => {
          setOutputs({
            front: petPhoto,
            left15: petPhoto,
            right15: petPhoto,
          });
          setLoading(false);
          Alert.alert('Önizleme', 'Demo çıktıları yüklendi (mock).');
          hSuccess();
        }, 1200);
        return;
      }
      const res = await fetch(`${api}/render/brandify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petPhotoUrl: petPhoto, template: 'pawfora' })
      });
      if (!res.ok) throw new Error('Render başlatılamadı');
      const json = await res.json();
      setOutputs(json?.assets || {});
      logEvent('brandify_render_success', { petId: pet?.id });
      hSuccess();
      try { await AsyncStorage.setItem(`brandify_cache_${pet?.id}`, JSON.stringify(json?.assets || {})); } catch {}
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Render hatası');
      try { const raw = await AsyncStorage.getItem(`brandify_cache_${pet?.id}`); if (raw) setOutputs(JSON.parse(raw)); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Brand Card (Premium)' }} />
      <ScrollView>
        <Text style={styles.title}>Pet için “Brand-Ready” Görsel</Text>
        {petPhoto && (
          <View style={{ alignItems: 'center' }}>
            <SkiaParallaxCard uri={petPhoto} width={340} height={220} />
            <View style={{ height: 8 }} />
            <SkiaParallaxVideo uri={petPhoto} width={340} height={220} duration={4000} />
          </View>
        )}
        <Text style={styles.p}>Standart: Cihaz üzerinde hafif 2.5D parallax (ücretsiz)</Text>
        <Text style={styles.p}>Premium: Bulutta stil transfer + 3 açı + video</Text>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={simulateParallax}>
            <Text style={styles.btnTxtSec}>Standart 2.5D</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={callBrandify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnTxt}>Premium Brandify</Text>}
          </TouchableOpacity>
        </View>

        {(outputs.front || outputs.left15 || outputs.right15) && (
          <View style={styles.grid}>
            {outputs.front && <Image source={{ uri: outputs.front }} style={styles.outImg} />}
            {outputs.left15 && <Image source={{ uri: outputs.left15 }} style={styles.outImg} />}
            {outputs.right15 && <Image source={{ uri: outputs.right15 }} style={styles.outImg} />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', margin: 16 },
  preview: { height: 220, margin: 16, borderRadius: 12 },
  p: { marginHorizontal: 16, color: '#4b5563', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12, margin: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#0EA5E9' },
  secondary: { backgroundColor: '#E5E7EB' },
  btnTxt: { color: '#fff', fontWeight: '700' },
  btnTxtSec: { color: '#111827', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  outImg: { width: '48%', aspectRatio: 1, borderRadius: 12 }
});
