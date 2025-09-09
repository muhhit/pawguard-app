import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessStories } from '@/components/SuccessStories';
import { CommunityProvider } from '@/hooks/community-store';
import { LanguageProvider } from '@/hooks/language-store';

export default function SuccessStoriesScreen() {
  return (
    <LanguageProvider>
      <CommunityProvider>
        <SafeAreaView style={styles.container}>
          <Stack.Screen 
            options={{
              title: 'Başarı Hikayeleri',
              headerStyle: {
                backgroundColor: '#3b82f6'
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold'
              }
            }} 
          />
          <SuccessStories />
        </SafeAreaView>
      </CommunityProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  }
});