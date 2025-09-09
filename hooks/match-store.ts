import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { usePets, Pet } from '@/hooks/pet-store';

type Persona = {
  ownerTraits: string[]; // 'active','calm','night-owl','social'
  petPrefs: string[];    // 'small-dogs','big-dogs','cats','friendly','calm'
  city?: string;
};

const PERSONA_KEY = 'paw_persona_v1';

export const [MatchProvider, useMatch] = createContextHook(() => {
  const { pets, nearbyPets } = usePets();

  const savePersona = useCallback(async (persona: Persona) => {
    await AsyncStorage.setItem(PERSONA_KEY, JSON.stringify(persona));
  }, []);

  const loadPersona = useCallback(async (): Promise<Persona | null> => {
    const raw = await AsyncStorage.getItem(PERSONA_KEY);
    return raw ? JSON.parse(raw) : null;
  }, []);

  const computeMatches = useCallback(async () => {
    const persona = await loadPersona();
    const list = [...nearbyPets, ...pets];
    // Simple heuristic score
    const scored = list.map(p => ({ pet: p, score: scorePet(p, persona) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 20)
      .map(s => s.pet);
    return scored;
  }, [pets, nearbyPets, loadPersona]);

  return { savePersona, loadPersona, computeMatches };
});

function scorePet(pet: Pet, persona: Persona | null): number {
  let s = 0;
  if (!persona) return Math.random();
  // Example signal blending
  if (persona.petPrefs.includes('small-dogs') && pet.type === 'dog' && /pomeranian|chihuahua|toy|mini/i.test(pet.breed || '')) s += 2;
  if (persona.petPrefs.includes('cats') && pet.type === 'cat') s += 1.5;
  if (persona.ownerTraits.includes('active') && /border collie|retriever|husky/i.test(pet.breed || '')) s += 1.2;
  // Recency boost
  const days = Math.max(1, Math.floor((Date.now() - new Date(pet.created_at).getTime())/86400000));
  s += 2 / days;
  // Reward boost
  s += Math.min(2, (pet.reward_amount || 0) / 500);
  return s + Math.random() * 0.2;
}

