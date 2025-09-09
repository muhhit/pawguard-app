import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Heart, Sparkles, Trophy, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  petName: string;
  onClose: () => void;
  type?: 'reunion' | 'hero' | 'achievement';
}

export function CelebrationModal({ 
  visible, 
  petName, 
  onClose, 
  type = 'reunion' 
}: CelebrationModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;
  const heartAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (visible) {
      // Main animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      // Sparkle animations with staggered timing
      sparkleAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            delay: 2000,
            useNativeDriver: true
          })
        ]).start();
      });

      // Heart animations
      heartAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 200 + 500),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true
          })
        ]).start();
      });

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      sparkleAnims.forEach(anim => anim.setValue(0));
      heartAnims.forEach(anim => anim.setValue(0));
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      onClose();
    });
  };

  const getContent = () => {
    switch (type) {
      case 'hero':
        return {
          icon: Trophy,
          title: 'Kahraman Oldunuz!',
          subtitle: `${petName} sayesinde yeni bir rozet kazandınız`,
          emoji: '🏆',
          colors: ['#FFD700', '#FFA500'] as const
        };
      case 'achievement':
        return {
          icon: Star,
          title: 'Başarım Kazanıldı!',
          subtitle: 'Yeni bir seviyeye ulaştınız',
          emoji: '⭐',
          colors: ['#8B5CF6', '#EC4899'] as const
        };
      default:
        return {
          icon: Heart,
          title: 'Mutlu Son!',
          subtitle: `${petName} evine kavuştu! 🎉`,
          emoji: '❤️',
          colors: ['#10B981', '#059669'] as const
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={handleClose}
          activeOpacity={1}
        />
        
        {/* Background sparkles */}
        {sparkleAnims.map((anim, index) => (
          <Animated.View
            key={`sparkle-${index}`}
            style={[
              styles.sparkle,
              {
                left: Math.random() * screenWidth,
                top: Math.random() * screenHeight,
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.5]
                    })
                  },
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <Sparkles size={20} color="#FFD700" />
          </Animated.View>
        ))}

        {/* Floating hearts */}
        {heartAnims.map((anim, index) => (
          <Animated.View
            key={`heart-${index}`}
            style={[
              styles.floatingHeart,
              {
                left: screenWidth * 0.2 + Math.random() * screenWidth * 0.6,
                bottom: -50,
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -screenHeight * 0.8]
                    })
                  },
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.2, 0.8]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.heartEmoji}>❤️</Text>
          </Animated.View>
        ))}

        {/* Main celebration card */}
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={content.colors}
            style={styles.cardGradient}
          >
            <View style={styles.iconContainer}>
              <IconComponent size={48} color="#FFFFFF" />
            </View>
            
            <Text style={styles.celebrationEmoji}>{content.emoji}</Text>
            <Text style={styles.celebrationTitle}>{content.title}</Text>
            <Text style={styles.celebrationSubtitle}>{content.subtitle}</Text>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Harika!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sparkle: {
    position: 'absolute'
  },
  floatingHeart: {
    position: 'absolute'
  },
  heartEmoji: {
    fontSize: 24
  },
  celebrationCard: {
    width: screenWidth * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20
  },
  cardGradient: {
    padding: 32,
    alignItems: 'center'
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default CelebrationModal;