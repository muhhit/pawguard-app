import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InteractiveMapView } from '@/components/InteractiveMapView';
import { useLanguage } from '@/hooks/language-store';
import { FadeTransition } from '@/components/PageTransition';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const handlePetSelect = (pet: any) => {
    console.log('Pet selected:', pet);
    router.push(`/pet-details?id=${pet.id}`);
  };

  return (
    <FadeTransition>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen 
          options={{ 
            title: t('map.title'),
            headerShown: false,
          }} 
        />
        
        <InteractiveMapView
          onPetSelect={handlePetSelect}
          showFilters={true}
          initialFilters={{
            petType: 'all',
            searchRadius: 10,
            showFound: true,
            urgency: 'all',
            timeRange: 'all',
          }}
        />
      </View>
    </FadeTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});