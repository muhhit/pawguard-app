import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRescue } from '@/hooks/rescue-store';
import { useAuth } from '@/hooks/auth-store';

export default function RescueChannelScreen() {
  const params = useLocalSearchParams<{ petId?: string, ownerId?: string, channelId?: string }>();
  const { user } = useAuth();
  const { createChannel, listTasks, addTask } = useRescue();
  const [channelId, setChannelId] = useState<string | null>(params.channelId || null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let cid = channelId;
        if (!cid && params.petId && (params.ownerId || user?.id)) {
          const ch = await createChannel(params.petId, (params.ownerId || user?.id!) as string);
          cid = ch.id;
          setChannelId(cid);
        }
        if (cid) {
          const t = await listTasks(cid);
          setTasks(t);
        }
      } catch (e: any) {
        Alert.alert('Hata', e?.message || 'Kanal yüklenemedi');
      }
    })();
  }, [params.petId]);

  const onAddTask = async () => {
    try {
      if (!channelId || !title.trim()) return;
      const t = await addTask(channelId, title.trim());
      setTasks([t, ...tasks]);
      setTitle('');
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Görev eklenemedi');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Kurtarma Kanalı' }} />
      <View style={styles.box}>
        <Text style={styles.title}>Görevler</Text>
        <View style={styles.row}>
          <TextInput placeholder="Yeni görev" style={styles.input} value={title} onChangeText={setTitle} />
          <TouchableOpacity onPress={onAddTask} style={styles.btn}><Text style={styles.btnTxt}>Ekle</Text></TouchableOpacity>
        </View>
        <FlatList
          data={tasks}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <View style={styles.task}>
              <Text style={styles.taskTxt}>{item.title}</Text>
              <Text style={styles.taskStatus}>{item.status}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  box: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12 },
  btn: { backgroundColor: '#10B981', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  btnTxt: { color: 'white', fontWeight: '700' },
  task: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  taskTxt: { color: '#111827', fontWeight: '600' },
  taskStatus: { color: '#6B7280' },
});

