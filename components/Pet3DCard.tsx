import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import OptimizedImage from './OptimizedImage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Pet3DCardProps {
  pet: {
    id: string;
    name: string;
    breed: string;
    age: string;
    photos: string[];
    aiPersonality: string[];
    rarityScore: number;
    location: string;
    isOnline: boolean;
  };
  onPress: () => void;
  index: number;
}

export const Pet3DCard: React.FC<Pet3DCardProps> = ({ pet, onPress, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Animation values
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  // Entry animation
  useEffect(() => {
    const delay = index * 100;
    
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    opacity.value = withDelay(delay, withSpring(1, { duration: 800 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
  }, []);

  // Flip animation
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    rotateY.value = withSpring(isFlipped ? 0 : 180, { damping: 15, stiffness: 100 });
  };

  // Front side animation
  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  // Back side animation
  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value + 180}deg` },
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const getRarityColor = (score: number) => {
    if (score >= 95) return '#9932CC'; // Legendary Purple
    if (score >= 80) return '#FFD700'; // Epic Gold
    if (score >= 60) return '#C0C0C0'; // Rare Silver
    return '#CD7F32'; // Common Bronze
  };

  const getRarityLabel = (score: number) => {
    if (score >= 95) return 'LEGENDARY';
    if (score >= 80) return 'EPIC';
    if (score >= 60) return 'RARE';
    return 'COMMON';
  };

  return (
    <View style={styles.container}>
      {/* Front Side */}
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
          style={styles.cardGradient}
        >
          {/* Rarity Badge */}
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(pet.rarityScore) }]}>
            <Text style={styles.rarityText}>{getRarityLabel(pet.rarityScore)}</Text>
          </View>

          {/* Online Status */}
          {pet.isOnline && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>LIVE</Text>
            </View>
          )}

          {/* Pet Image */}
          <View style={styles.imageContainer}>
            <OptimizedImage
              source={{ uri: pet.photos[0] }}
              style={styles.petImage}
              placeholder={true}
            />
            
            {/* 3D Effect Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          {/* Pet Info */}
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
            <Text style={styles.petLocation}>📍 {pet.location}</Text>
          </View>

          {/* AI Personality Traits */}
          <View style={styles.traitsContainer}>
            {pet.aiPersonality.slice(0, 3).map((trait, idx) => (
              <View key={idx} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.heartButton]}
              onPress={() => console.log('Liked pet:', pet.name)}
            >
              <Text style={styles.heartEmoji}>💝</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.connectButton]}
              onPress={onPress}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.connectGradient}
              >
                <Text style={styles.connectText}>Connect</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.moreButton]}
              onPress={handleFlip}
            >
              <Text style={styles.moreEmoji}>🔄</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Back Side - AI Analysis */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <BlurView intensity={30} style={styles.backCardBlur}>
          <LinearGradient
            colors={['rgba(46, 62, 80, 0.9)', 'rgba(46, 62, 80, 0.7)']}
            style={styles.backGradient}
          >
            <Text style={styles.backTitle}>🧬 AI Analysis</Text>
            
            <View style={styles.aiStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Intelligence</Text>
                <View style={styles.statBar}>
                  <View style={[styles.statFill, { width: '87%', backgroundColor: '#4ECDC4' }]} />
                </View>
                <Text style={styles.statValue}>87/100</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Friendliness</Text>
                <View style={styles.statBar}>
                  <View style={[styles.statFill, { width: '94%', backgroundColor: '#45B7D1' }]} />
                </View>
                <Text style={styles.statValue}>94/100</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Energy Level</Text>
                <View style={styles.statBar}>
                  <View style={[styles.statFill, { width: '76%', backgroundColor: '#F7DC6F' }]} />
                </View>
                <Text style={styles.statValue}>76/100</Text>
              </View>
            </View>

            <View style={styles.compatibility}>
              <Text style={styles.compatibilityTitle}>Perfect Match Score</Text>
              <Text style={styles.compatibilityScore}>92%</Text>
              <Text style={styles.compatibilityReason}>
                "Based on your lifestyle and preferences"
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.fullAnalysisButton}
              onPress={handleFlip}
            >
              <Text style={styles.fullAnalysisText}>← Back to Profile</Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 40,
    height: 520,
    alignSelf: 'center',
    marginVertical: 10,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardGradient: {
    flex: 1,
    padding: 20,
  },
  backCard: {
    backfaceVisibility: 'hidden',
  },
  backCardBlur: {
    flex: 1,
  },
  backGradient: {
    flex: 1,
    padding: 20,
  },
  rarityBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  petInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  petLocation: {
    fontSize: 14,
    color: '#95A5A6',
  },
  traitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  traitBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  traitText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  heartEmoji: {
    fontSize: 20,
  },
  connectButton: {
    flex: 2,
  },
  connectGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  moreButton: {
    backgroundColor: 'rgba(52, 73, 94, 0.2)',
  },
  moreEmoji: {
    fontSize: 20,
  },
  // Back side styles
  backTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  aiStats: {
    marginBottom: 24,
  },
  statItem: {
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#BDC3C7',
    marginBottom: 6,
  },
  statBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  compatibility: {
    alignItems: 'center',
    marginBottom: 24,
  },
  compatibilityTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  compatibilityScore: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2ECC71',
    marginBottom: 4,
  },
  compatibilityReason: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fullAnalysisButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  fullAnalysisText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Pet3DCard;
