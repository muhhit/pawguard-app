import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function CollageScreen() {
  const params = useLocalSearchParams<{ images?: string }>();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const images = (params.images ? params.images.split(',') : []).filter(Boolean);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const api = process.env.EXPO_PUBLIC_API_BASE_URL;
        if (!api) {
          const svg = `<?xml version=\"1.0\"?><svg width=\"720\" height=\"820\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"720\" height=\"820\" fill=\"#0B1220\"/><text x=\"360\" y=\"410\" font-family=\"Arial\" font-size=\"24\" fill=\"#6EE7B7\" text-anchor=\"middle\">UGC Collage Preview</text></svg>`;
          setUri('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
        } else {
          const res = await fetch(`${api}/ugc/collage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images }) });
          if (!res.ok) throw new Error('Kolaj üretimi başarısız');
          const svgText = await res.text();
          setUri('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText));
        }
      } catch (e: any) {
        Alert.alert('Hata', e?.message || 'Kolaj oluşturulamadı');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'UGC Kolaj Önizleme' }} />
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

