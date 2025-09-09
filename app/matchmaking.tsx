import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useMatch } from '@/hooks/match-store';
import { useLanguage } from '@/hooks/language-store';
import PetCard from '@/components/PetCard';

const TRAITS = ['active','calm','night-owl','social'] as const;
const PREFS  = ['small-dogs','big-dogs','cats','friendly','calm'] as const;

export default function MatchmakingScreen() {
  const { savePersona, loadPersona, computeMatches } = useMatch();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ownerTraits, setOwnerTraits] = useState<string[]>(['social']);
  const [petPrefs, setPetPrefs] = useState<string[]>(['friendly']);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const persona = await loadPersona();
      if (persona) {
        setOwnerTraits(persona.ownerTraits);
        setPetPrefs(persona.petPrefs);
      }
      setLoading(false);
    })();
  }, []);

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    const has = arr.includes(item);
    setter(has ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const onCompute = async () => {
    try {
      await savePersona({ ownerTraits, petPrefs });
      const res = await computeMatches();
      setMatches(res);
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Eşleşme oluşturulamadı');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Paw Match' }} />
      <ScrollView>
        <Text style={styles.section}>Seni Tanıyalım</Text>
        <View style={styles.rowWrap}>
          {TRAITS.map(tr => (
            <TouchableOpacity key={tr} style={[styles.chip, ownerTraits.includes(tr) && styles.chipActive]} onPress={() => toggle(ownerTraits, tr, setOwnerTraits)}>
              <Text style={[styles.chipTxt, ownerTraits.includes(tr) && styles.chipTxtActive]}>{tr}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.section}>Evcil Tercihlerin</Text>
        <View style={styles.rowWrap}>
          {PREFS.map(pf => (
            <TouchableOpacity key={pf} style={[styles.chip, petPrefs.includes(pf) && styles.chipActive]} onPress={() => toggle(petPrefs, pf, setPetPrefs)}>
              <Text style={[styles.chipTxt, petPrefs.includes(pf) && styles.chipTxtActive]}>{pf}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.primary} onPress={onCompute}><Text style={styles.primaryTxt}>Eşleşmeleri Göster</Text></TouchableOpacity>
        <View style={{ height: 12 }} />
        {matches.map((pet) => (
          <View key={pet.id} style={{ marginHorizontal: 16, marginBottom: 12 }}>
            <PetCard pet={pet} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: { marginTop: 16, marginHorizontal: 16, fontSize: 16, fontWeight: '700' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#0EA5E9' },
  chipTxt: { color: '#111827', fontWeight: '600' },
  chipTxtActive: { color: 'white' },
  primary: { backgroundColor: '#0EA5E9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 16, marginTop: 12 },
  primaryTxt: { color: 'white', fontWeight: '700' },
});

