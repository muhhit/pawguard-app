import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Heart, Settings, Bell, Search } from 'lucide-react-native';
import {
  LiquidGlassCard,
  AuroraButton,
  FloatingAction,
  LiquidNavBar,
  LiquidBottomSheet,
} from './GlassComponents';

export default function GlassComponentsDemo() {
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#667EEA', '#764BA2', '#F093FB']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Liquid Navigation Bar */}
      <LiquidNavBar
        title="iOS 26 Glass UI"
        leftAction={<Settings size={24} color="#000" />}
        rightAction={<Bell size={24} color="#000" />}
      />

      <SafeAreaView style={styles.content}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Card */}
          <LiquidGlassCard
            variant="floating"
            style={styles.welcomeCard}
          >
            <Text style={styles.welcomeTitle}>Welcome to iOS 26</Text>
            <Text style={styles.welcomeSubtitle}>
              Experience the future of mobile design with liquid glass components
            </Text>
          </LiquidGlassCard>

          {/* Interactive Cards */}
          <View style={styles.cardGrid}>
            <LiquidGlassCard
              variant="interactive"
              style={styles.gridCard}
              onPress={() => console.log('Card 1 pressed')}
            >
              <Heart size={32} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Favorites</Text>
              <Text style={styles.cardSubtitle}>24 items</Text>
            </LiquidGlassCard>

            <LiquidGlassCard
              variant="interactive"
              style={styles.gridCard}
              onPress={() => console.log('Card 2 pressed')}
            >
              <Search size={32} color="#4ECDC4" />
              <Text style={styles.cardTitle}>Search</Text>
              <Text style={styles.cardSubtitle}>Explore</Text>
            </LiquidGlassCard>
          </View>

          {/* Elevated Card */}
          <LiquidGlassCard
            variant="elevated"
            style={styles.elevatedCard}
          >
            <Text style={styles.cardTitle}>Premium Features</Text>
            <Text style={styles.cardDescription}>
              Unlock advanced functionality with our premium subscription
            </Text>
            
            <View style={styles.buttonContainer}>
              <AuroraButton
                title="Get Premium"
                onPress={handleButtonPress}
                variant="primary"
                size="large"
                loading={loading}
                fullWidth
                icon={<Plus size={20} color="#FFFFFF" />}
              />
            </View>
          </LiquidGlassCard>

          {/* Button Variants */}
          <LiquidGlassCard style={styles.buttonShowcase}>
            <Text style={styles.sectionTitle}>Button Variants</Text>
            
            <AuroraButton
              title="Primary Button"
              onPress={() => console.log('Primary pressed')}
              variant="primary"
              size="medium"
              fullWidth
            />
            
            <AuroraButton
              title="Secondary Button"
              onPress={() => console.log('Secondary pressed')}
              variant="secondary"
              size="medium"
              fullWidth
            />
            
            <AuroraButton
              title="Success Button"
              onPress={() => console.log('Success pressed')}
              variant="success"
              size="medium"
              fullWidth
            />
            
            <AuroraButton
              title="Show Bottom Sheet"
              onPress={() => setShowBottomSheet(true)}
              variant="warning"
              size="medium"
              fullWidth
            />
          </LiquidGlassCard>

          {/* Size Variants */}
          <LiquidGlassCard style={styles.sizeShowcase}>
            <Text style={styles.sectionTitle}>Size Variants</Text>
            
            <AuroraButton
              title="Small"
              onPress={() => console.log('Small pressed')}
              variant="primary"
              size="small"
            />
            
            <AuroraButton
              title="Medium"
              onPress={() => console.log('Medium pressed')}
              variant="primary"
              size="medium"
            />
            
            <AuroraButton
              title="Large"
              onPress={() => console.log('Large pressed')}
              variant="primary"
              size="large"
            />
            
            <AuroraButton
              title="Extra Large"
              onPress={() => console.log('XL pressed')}
              variant="primary"
              size="xl"
            />
          </LiquidGlassCard>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Buttons */}
      <FloatingAction
        icon={<Plus size={24} color="#FFFFFF" />}
        onPress={() => console.log('FAB pressed')}
        position="bottomRight"
        variant="primary"
        size="large"
      />

      <FloatingAction
        icon={<Heart size={20} color="#FFFFFF" />}
        onPress={() => console.log('Heart FAB pressed')}
        position="bottomLeft"
        variant="danger"
        size="medium"
      />

      {/* Bottom Sheet */}
      <LiquidBottomSheet
        isVisible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
      >
        <Text style={styles.bottomSheetTitle}>Bottom Sheet</Text>
        <Text style={styles.bottomSheetText}>
          This is a beautiful liquid glass bottom sheet with gesture support.
          You can drag it down to close or tap outside.
        </Text>
        
        <AuroraButton
          title="Close Sheet"
          onPress={() => setShowBottomSheet(false)}
          variant="secondary"
          size="large"
          fullWidth
          style={styles.bottomSheetButton}
        />
      </LiquidBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 100, // Account for nav bar
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  elevatedCard: {
    marginBottom: 24,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonShowcase: {
    marginBottom: 24,
  },
  sizeShowcase: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  spacer: {
    height: 100,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomSheetText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  bottomSheetButton: {
    marginTop: 16,
  },
});