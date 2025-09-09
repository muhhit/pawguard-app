import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
  Platform
} from 'react-native';
import OptimizedImage from '@/components/OptimizedImage';
import { Heart, Share2, Trophy, Clock, MapPin, Star, Sparkles, Award } from 'lucide-react-native';
import { useCommunity, SuccessStory } from '@/hooks/community-store';
import { useLanguage } from '@/hooks/language-store';
import GlassContainer from '@/components/GlassContainer';

interface SuccessStoriesProps {
  showFeatured?: boolean;
  limit?: number;
}

export function SuccessStories({ showFeatured = false, limit = 10 }: SuccessStoriesProps) {
  const { 
    heroOfTheMonth, 
    stats, 
    likeSuccessStory, 
    shareSuccessStory,
    getFeaturedStories,
    getRecentStories,
    getFastestReunions
  } = useCommunity();
  const { currency } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'recent' | 'featured' | 'fastest'>('recent');
  const [celebrationVisible, setCelebrationVisible] = useState<string | null>(null);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  const displayStories = showFeatured 
    ? getFeaturedStories().slice(0, limit)
    : selectedTab === 'featured' 
      ? getFeaturedStories()
      : selectedTab === 'fastest'
        ? getFastestReunions()
        : getRecentStories(limit);

  const handleLike = async (storyId: string) => {
    await likeSuccessStory(storyId);
    triggerCelebration(storyId);
  };

  const handleShare = async (story: SuccessStory) => {
    try {
      const message = `🎉 ${story.petName} bulundu!\n\n${story.story}\n\n📍 ${story.location}\n⏰ ${formatReunionTime(story.reunionDuration)}\n\n#KayıpHayvanBulundu #MutluSon`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `${story.petName} Bulundu!`,
            text: message,
            url: window.location.href
          });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert('Başarılı', 'Hikaye panoya kopyalandı!');
        }
      } else {
        await Share.share({
          message,
          title: `${story.petName} Bulundu!`
        });
      }
      
      await shareSuccessStory(story.id);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const triggerCelebration = (storyId: string) => {
    setCelebrationVisible(storyId);
    
    // Main celebration animation
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 200,
        delay: 1000,
        useNativeDriver: true
      })
    ]).start(() => {
      setCelebrationVisible(null);
    });

    // Sparkle animations
    sparkleAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
    });
  };

  const formatReunionTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} dakika`;
    } else if (hours < 24) {
      return `${Math.round(hours)} saat`;
    } else {
      return `${Math.round(hours / 24)} gün`;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('tr-TR')} ${currency}`;
  };

  const renderStoryCard = (story: SuccessStory) => (
    <GlassContainer key={story.id} style={styles.storyCard}>
      {story.isFeatured && (
        <View style={styles.featuredBadge}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.featuredText}>Öne Çıkan</Text>
        </View>
      )}
      
      <View style={styles.storyHeader}>
        <View style={styles.petInfo}>
          <OptimizedImage 
            source={story.petPhoto} 
            optimization="avatar"
            style={styles.petImage}
            placeholder={true}
          />
          <View style={styles.petDetails}>
            <Text style={styles.petName}>{story.petName}</Text>
            <Text style={styles.petType}>{story.petType}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#666" />
              <Text style={styles.location}>{story.location}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.reunionTime}>
          <Clock size={14} color="#10B981" />
          <Text style={styles.reunionTimeText}>
            {formatReunionTime(story.reunionDuration)}
          </Text>
        </View>
      </View>

      {story.beforePhoto && story.afterPhoto && (
        <View style={styles.beforeAfterContainer}>
          <View style={styles.photoComparison}>
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Kayıp</Text>
              <OptimizedImage 
                source={story.beforePhoto} 
                optimization="thumbnail"
                style={styles.comparisonPhoto}
                placeholder={true}
              />
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Bulundu</Text>
              <OptimizedImage 
                source={story.afterPhoto} 
                optimization="thumbnail"
                style={styles.comparisonPhoto}
                placeholder={true}
              />
            </View>
          </View>
        </View>
      )}

      <Text style={styles.storyText}>{story.story}</Text>
      
      {story.testimonial && (
        <View style={styles.testimonialContainer}>
          <Text style={styles.testimonialText}>&ldquo;{story.testimonial}&rdquo;</Text>
          <Text style={styles.testimonialAuthor}>- {story.ownerName}</Text>
        </View>
      )}

      <View style={styles.storyMeta}>
        <View style={styles.participants}>
          <Text style={styles.participantText}>
            <Text style={styles.bold}>Sahip:</Text> {story.ownerName}
          </Text>
          <Text style={styles.participantText}>
            <Text style={styles.bold}>Bulan:</Text> {story.finderName}
          </Text>
        </View>
        
        {story.rewardAmount && (
          <View style={styles.rewardContainer}>
            <Award size={14} color="#F59E0B" />
            <Text style={styles.rewardText}>
              {formatCurrency(story.rewardAmount)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.storyActions}>
        <TouchableOpacity 
          style={[styles.actionButton, story.isLiked && styles.likedButton]}
          onPress={() => handleLike(story.id)}
        >
          <Heart 
            size={16} 
            color={story.isLiked ? "#EF4444" : "#666"} 
            fill={story.isLiked ? "#EF4444" : "none"}
          />
          <Text style={[styles.actionText, story.isLiked && styles.likedText]}>
            {story.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(story)}
        >
          <Share2 size={16} color="#666" />
          <Text style={styles.actionText}>{story.shares}</Text>
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {new Date(story.foundDate).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      {celebrationVisible === story.id && (
        <Animated.View 
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnim,
              transform: [{
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2]
                })
              }]
            }
          ]}
        >
          <Text style={styles.celebrationText}>❤️</Text>
          {sparkleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.sparkle,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (index % 2 === 0 ? 1 : -1) * (20 + index * 10)]
                      })
                    },
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30 - index * 5]
                      })
                    }
                  ]
                }
              ]}
            >
              <Sparkles size={12} color="#FFD700" />
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </GlassContainer>
  );

  const renderHeroOfTheMonth = () => {
    if (!heroOfTheMonth) return null;

    return (
      <GlassContainer style={styles.heroContainer}>
        <View style={styles.heroHeader}>
          <Trophy size={24} color="#FFD700" />
          <Text style={styles.heroTitle}>Ayın Kahramanı</Text>
          <Text style={styles.heroMonth}>{heroOfTheMonth.month} {heroOfTheMonth.year}</Text>
        </View>
        
        <View style={styles.heroProfile}>
          <OptimizedImage 
            source={heroOfTheMonth.userPhoto} 
            optimization="avatar"
            style={styles.heroImage}
            placeholder={true}
          />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{heroOfTheMonth.userName}</Text>
            <View style={styles.heroStats}>
              <Text style={styles.heroStat}>{heroOfTheMonth.petsHelped} pet yardım</Text>
              <Text style={styles.heroStat}>{formatCurrency(heroOfTheMonth.totalReward)} ödül</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.heroAchievements}>
          {heroOfTheMonth.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementBadge}>
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>
        
        {heroOfTheMonth.testimonials.length > 0 && (
          <View style={styles.heroTestimonials}>
            <Text style={styles.testimonialsTitle}>Teşekkürler</Text>
            {heroOfTheMonth.testimonials.slice(0, 2).map((testimonial, index) => (
              <View key={index} style={styles.testimonialItem}>
                <Text style={styles.testimonialQuote}>&ldquo;{testimonial.message}&rdquo;</Text>
                <Text style={styles.testimonialFrom}>- {testimonial.from} ({testimonial.petName})</Text>
              </View>
            ))}
          </View>
        )}
      </GlassContainer>
    );
  };

  const renderStats = () => (
    <GlassContainer style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Bu Ay İstatistikleri</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.successStoriesThisMonth}</Text>
          <Text style={styles.statLabel}>Mutlu Son</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.averageReunionTime.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Ort. Süre</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.fastestReunion}dk</Text>
          <Text style={styles.statLabel}>En Hızlı</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatCurrency(stats.totalRewardsDistributed)}</Text>
          <Text style={styles.statLabel}>Toplam Ödül</Text>
        </View>
      </View>
    </GlassContainer>
  );

  if (showFeatured) {
    return (
      <View style={styles.container}>
        {displayStories.map(renderStoryCard)}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeroOfTheMonth()}
      {renderStats()}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recent' && styles.activeTab]}
          onPress={() => setSelectedTab('recent')}
        >
          <Text style={[styles.tabText, selectedTab === 'recent' && styles.activeTabText]}>
            Son Hikayeler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'featured' && styles.activeTab]}
          onPress={() => setSelectedTab('featured')}
        >
          <Star size={16} color={selectedTab === 'featured' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, selectedTab === 'featured' && styles.activeTabText]}>
            Öne Çıkanlar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'fastest' && styles.activeTab]}
          onPress={() => setSelectedTab('fastest')}
        >
          <Clock size={16} color={selectedTab === 'fastest' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, selectedTab === 'fastest' && styles.activeTabText]}>
            En Hızlı
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.storiesContainer}>
        {displayStories.map(renderStoryCard)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  heroContainer: {
    margin: 16,
    padding: 20
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 16
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8
  },
  heroMonth: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  heroProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  heroImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16
  },
  heroInfo: {
    flex: 1
  },
  heroName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  heroStats: {
    flexDirection: 'row',
    gap: 16
  },
  heroStat: {
    fontSize: 14,
    color: '#6b7280'
  },
  heroAchievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  achievementBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  achievementText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600'
  },
  heroTestimonials: {
    marginTop: 8
  },
  testimonialsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12
  },
  testimonialItem: {
    marginBottom: 12
  },
  testimonialQuote: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 4
  },
  testimonialFrom: {
    fontSize: 12,
    color: '#6b7280'
  },
  statsContainer: {
    margin: 16,
    padding: 20
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6
  },
  activeTab: {
    backgroundColor: '#3b82f6'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  activeTabText: {
    color: '#fff'
  },
  storiesContainer: {
    paddingBottom: 20
  },
  storyCard: {
    margin: 16,
    padding: 16,
    position: 'relative'
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1
  },
  featuredText: {
    fontSize: 10,
    color: '#d97706',
    fontWeight: '600'
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  petInfo: {
    flexDirection: 'row',
    flex: 1
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  petDetails: {
    flex: 1
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2
  },
  petType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  location: {
    fontSize: 12,
    color: '#6b7280'
  },
  reunionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  reunionTimeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600'
  },
  beforeAfterContainer: {
    marginBottom: 16
  },
  photoComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  photoSection: {
    alignItems: 'center'
  },
  photoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '600'
  },
  comparisonPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrow: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: 'bold'
  },
  storyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12
  },
  testimonialContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6'
  },
  testimonialText: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 6
  },
  testimonialAuthor: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600'
  },
  storyMeta: {
    marginBottom: 12
  },
  participants: {
    marginBottom: 8
  },
  participantText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2
  },
  bold: {
    fontWeight: '600',
    color: '#374151'
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  rewardText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600'
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6'
  },
  likedButton: {
    backgroundColor: '#fef2f2'
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600'
  },
  likedText: {
    color: '#ef4444'
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  celebrationText: {
    fontSize: 32
  },
  sparkle: {
    position: 'absolute'
  }
});

export default SuccessStories;