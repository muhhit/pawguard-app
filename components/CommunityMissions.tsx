import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, ClipboardCheck, Flag } from 'lucide-react-native';

export default function CommunityMissions() {
  const missions = [
    { id: 'posters', icon: ClipboardCheck, title: 'Afiş Asma', desc: 'Mahallende 5 noktaya afiş as ve fotoğrafla kanıtla', reward: '+25 XP' },
    { id: 'scan', icon: MapPin, title: 'Bölge Taraması', desc: 'Son görülen yerden başlayarak 1km yarıçapı tara', reward: '+40 XP' },
    { id: 'report', icon: Flag, title: 'Gözlem Bildir', desc: 'Şüpheli bir görüntü gördüğünde fotoğrafla bildirim yap', reward: '+15 XP' },
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Kurtarma Görevleri</Text>
      {missions.map(m => (
        <View key={m.id} style={styles.row}>
          <m.icon size={18} color="#6b7280" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.missionTitle}>{m.title}</Text>
            <Text style={styles.desc}>{m.desc}</Text>
          </View>
          <Text style={styles.reward}>{m.reward}</Text>
          <TouchableOpacity style={styles.startBtn}><Text style={styles.startTxt}>Başla</Text></TouchableOpacity>
        </View>
      ))}
      <Text style={styles.note}>Not: Görevler topluluk lider panosuna katkı sağlar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginTop: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  missionTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  desc: { fontSize: 12, color: '#6b7280' },
  reward: { fontSize: 12, color: '#16a34a', fontWeight: '700', marginRight: 8 },
  startBtn: { backgroundColor: '#3b82f6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  startTxt: { color: 'white', fontWeight: '600' },
  note: { marginTop: 8, fontSize: 12, color: '#6b7280' },
});

