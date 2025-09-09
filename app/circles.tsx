import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useCircles } from '@/hooks/circles-store';

export default function CirclesScreen() {
  const { listCircles, createCircle, joinCircle } = useCircles();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems(await listCircles()); } catch (e: any) { Alert.alert('Hata', e?.message || 'Çemberler yüklenemedi'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    try { await createCircle(name.trim(), desc.trim()); setName(''); setDesc(''); await load(); } catch (e: any) { Alert.alert('Hata', e?.message || 'Oluşturulamadı'); }
  };

  const onJoin = async (id: string) => {
    try { await joinCircle(id); Alert.alert('Katıldınız', 'Çembere başarıyla katıldınız'); } catch (e: any) { Alert.alert('Hata', e?.message || 'Katılım başarısız'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Paw Çemberleri' }} />
      <View style={styles.box}>
        <Text style={styles.title}>Yeni Çember Oluştur</Text>
        <TextInput style={styles.input} placeholder="İsim" value={name} onChangeText={setName} />
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Açıklama" value={desc} onChangeText={setDesc} multiline/>
        <TouchableOpacity onPress={onCreate} style={styles.btn}><Text style={styles.btnTxt}>Oluştur</Text></TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {!!item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
            </View>
            <TouchableOpacity onPress={() => onJoin(item.id)} style={styles.join}><Text style={styles.joinTxt}>Katıl</Text></TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  box: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  btn: { backgroundColor: '#0EA5E9', borderRadius: 10, alignItems: 'center', paddingVertical: 10 },
  btnTxt: { color: 'white', fontWeight: '700' },
  item: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemDesc: { color: '#6B7280' },
  join: { backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  joinTxt: { color: 'white', fontWeight: '700' },
});

