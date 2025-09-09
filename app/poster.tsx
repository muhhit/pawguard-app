import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function PosterScreen() {
  const params = useLocalSearchParams<{ petName?: string; reward?: string; link?: string }>();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const api = process.env.EXPO_PUBLIC_API_BASE_URL;
        const body = {
          petName: params.petName || 'PawGuard Pet',
          reward: Number(params.reward || '0'),
          link: params.link || 'https://pawguard.app'
        };
        if (!api) {
          // construct data URI from local SVG template
          const svg = `<?xml version=\"1.0\"?><svg width=\"1024\" height=\"1448\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"1024\" height=\"1448\" fill=\"#0B1220\"/><text x=\"512\" y=\"220\" font-family=\"Arial\" font-size=\"44\" fill=\"#FFFFFF\" text-anchor=\"middle\">${body.petName}</text></svg>`;
          setUri('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
        } else {
          const res = await fetch(`${api}/poster/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (!res.ok) throw new Error('Poster üretimi başarısız');
          const svgText = await res.text();
          setUri('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText));
        }
      } catch (e: any) {
        Alert.alert('Hata', e?.message || 'Poster oluşturulamadı');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Poster Önizleme' }} />
      {loading && (
        <View style={styles.loading}><ActivityIndicator size="large"/></View>
      )}
      {!loading && uri && (
        <WebView source={{ uri }} style={{ flex: 1 }} originWhitelist={["*"]} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

