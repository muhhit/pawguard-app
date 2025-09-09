import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { 
  Users, 
  Heart, 
  Share2, 
  MapPin, 
  MessageCircle,
  Trophy,
  Vote,
  Plus,

  X,
  CheckCircle,
  Clock,
  Search,
  Phone,
  Mail,
  Star,
  Award,
  Shield,
  AlertTriangle,
  Flag,
  BookOpen,
  UserCheck
} from 'lucide-react-native';
import { useCommunity } from '@/hooks/community-store';
import { LinearGradient } from 'expo-linear-gradient';
import CommunityChat from './CommunityChat';
import { PremiumBadge } from './PremiumBadge';

interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  petsHelped: number;
  location: string;
  specialties: string[];
  isOnline: boolean;
  responseTime: string;
  bio: string;
  phone?: string;
  email?: string;
  joinedDate: string;
  isPremium?: boolean;
}

const SearchVolunteers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [volunteers] = useState<Volunteer[]>([
    {
      id: 'vol-1',
      name: 'Mehmet Özkan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      rating: 4.9,
      petsHelped: 47,
      location: 'Kadıköy',
      specialties: ['Köpek Arama', 'Acil Durum', 'Veteriner Yardımı'],
      isOnline: true,
      responseTime: '5 dk',
      bio: 'Veteriner hekim. 8 yıldır kayıp hayvan aramalarında gönüllü olarak çalışıyorum.',
      phone: '+90 555 123 4567',
      email: 'mehmet@example.com',
      joinedDate: '2022-03-15',
      isPremium: true
    },
    {
      id: 'vol-2',
      name: 'Ayşe Demir',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      rating: 4.8,
      petsHelped: 32,
      location: 'Beşiktaş',
      specialties: ['Kedi Arama', 'Sosyal Medya', 'Fotoğraf'],
      isOnline: false,
      responseTime: '15 dk',
      bio: 'Profesyonel fotoğrafçı. Kayıp ilanları için kaliteli fotoğraf çekimi yapıyorum.',
      phone: '+90 555 987 6543',
      email: 'ayse@example.com',
      joinedDate: '2021-11-20',
      isPremium: false
    },
    {
      id: 'vol-3',
      name: 'Can Yılmaz',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      rating: 4.7,
      petsHelped: 28,
      location: 'Üsküdar',
      specialties: ['Köpek Eğitimi', 'Davranış Analizi', 'Rehabilitasyon'],
      isOnline: true,
      responseTime: '8 dk',
      bio: 'Köpek eğitmeni. Bulunan hayvanların sahiplerine adaptasyonunda yardımcı oluyorum.',
      phone: '+90 555 456 7890',
      email: 'can@example.com',
      joinedDate: '2023-01-10',
      isPremium: true
    },
    {
      id: 'vol-4',
      name: 'Zeynep Kaya',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      rating: 4.9,
      petsHelped: 51,
      location: 'Şişli',
      specialties: ['Acil Durum', 'İlk Yardım', 'Taşıma'],
      isOnline: true,
      responseTime: '3 dk',
      bio: 'Veteriner teknisyeni. Yaralı hayvanlar için acil müdahale ve taşıma hizmeti veriyorum.',
      phone: '+90 555 321 0987',
      email: 'zeynep@example.com',
      joinedDate: '2020-08-05',
      isPremium: true
    },
    {
      id: 'vol-5',
      name: 'Emre Şahin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      rating: 4.6,
      petsHelped: 19,
      location: 'Bakırköy',
      specialties: ['Teknoloji', 'GPS Takip', 'Drone'],
      isOnline: false,
      responseTime: '20 dk',
      bio: 'Teknoloji uzmanı. Drone ve GPS teknolojileri ile kayıp hayvan arama operasyonları.',
      phone: '+90 555 654 3210',
      email: 'emre@example.com',
      joinedDate: '2023-06-12',
      isPremium: false
    }
  ]);

  const specialties = ['Köpek Arama', 'Kedi Arama', 'Acil Durum', 'Veteriner Yardımı', 'İlk Yardım', 'Teknoloji', 'Fotoğraf'];

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialty = !selectedSpecialty || volunteer.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const handleContact = async (volunteer: Volunteer, method: 'phone' | 'email') => {
    try {
      if (method === 'phone' && volunteer.phone) {
        const url = `tel:${volunteer.phone}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Hata', 'Telefon uygulaması açılamadı');
        }
      } else if (method === 'email' && volunteer.email) {
        const url = `mailto:${volunteer.email}?subject=Kayıp Hayvan Yardımı`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Hata', 'E-posta uygulaması açılamadı');
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'İletişim kurulamadı');
    }
  };

  return (
    <View style={styles.tabContent}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.searchTitle}>Gönüllü Ara</Text>
        <Text style={styles.searchSubtitle}>
          {volunteers.length} aktif gönüllü • {volunteers.filter(v => v.isOnline).length} çevrimiçi
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="İsim, konum veya uzmanlık ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Specialty Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedSpecialty && styles.filterChipActive]}
          onPress={() => setSelectedSpecialty(null)}
        >
          <Text style={[styles.filterChipText, !selectedSpecialty && styles.filterChipTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
        {specialties.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[styles.filterChip, selectedSpecialty === specialty && styles.filterChipActive]}
            onPress={() => setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty)}
          >
            <Text style={[styles.filterChipText, selectedSpecialty === specialty && styles.filterChipTextActive]}>
              {specialty}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Volunteers List */}
      <View style={styles.volunteersList}>
        {filteredVolunteers.map((volunteer) => (
          <View key={volunteer.id} style={styles.volunteerCard}>
            {/* Header */}
            <View style={styles.volunteerHeader}>
              <View style={styles.volunteerAvatarContainer}>
                <View style={styles.volunteerAvatar}>
                  <Text style={styles.volunteerAvatarText}>
                    {volunteer.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                {volunteer.isOnline && <View style={styles.onlineIndicator} />}
              </View>
              
              <View style={styles.volunteerInfo}>
                <View style={styles.volunteerNameRow}>
                  <View style={styles.volunteerNameContainer}>
                    <Text style={styles.volunteerName}>{volunteer.name}</Text>
                    {volunteer.isPremium && (
                      <PremiumBadge size="small" style={styles.volunteerPremiumBadge} />
                    )}
                  </View>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.rating}>{volunteer.rating}</Text>
                  </View>
                </View>
                
                <View style={styles.volunteerMeta}>
                  <MapPin size={12} color="#6B7280" />
                  <Text style={styles.volunteerLocation}>{volunteer.location}</Text>
                  <Text style={styles.volunteerSeparator}>•</Text>
                  <Text style={styles.volunteerStats}>{volunteer.petsHelped} yardım</Text>
                  <Text style={styles.volunteerSeparator}>•</Text>
                  <Text style={styles.responseTime}>~{volunteer.responseTime}</Text>
                </View>
              </View>
            </View>

            {/* Bio */}
            <Text style={styles.volunteerBio}>{volunteer.bio}</Text>

            {/* Specialties */}
            <View style={styles.specialtiesContainer}>
              {volunteer.specialties.map((specialty) => (
                <View key={specialty} style={styles.specialtyTag}>
                  <Text style={styles.specialtyTagText}>{specialty}</Text>
                </View>
              ))}
            </View>

            {/* Contact Buttons */}
            <View style={styles.contactButtons}>
              {volunteer.phone && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact(volunteer, 'phone')}
                >
                  <Phone size={16} color="#10B981" />
                  <Text style={styles.contactButtonText}>Ara</Text>
                </TouchableOpacity>
              )}
              
              {volunteer.email && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContact(volunteer, 'email')}
                >
                  <Mail size={16} color="#3B82F6" />
                  <Text style={styles.contactButtonText}>E-posta</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.messageButton}>
                <MessageCircle size={16} color="#FFF" />
                <Text style={styles.messageButtonText}>Mesaj</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {filteredVolunteers.length === 0 && (
        <View style={styles.emptyState}>
          <Search size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Gönüllü bulunamadı</Text>
          <Text style={styles.emptyStateText}>
            Arama kriterlerinizi değiştirerek tekrar deneyin
          </Text>
        </View>
      )}
    </View>
  );
};

const CommunityGuidelines: React.FC = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const guidelines = [
    {
      id: '1',
      icon: Heart,
      title: 'Saygılı Olun',
      description: 'Tüm topluluk üyelerine karşı nazik ve saygılı davranın. Kaba dil kullanmayın.',
      color: '#EF4444'
    },
    {
      id: '2',
      icon: Shield,
      title: 'Güvenlik Önceliği',
      description: 'Kişisel bilgilerinizi paylaşmayın. Buluşmalarda güvenli yerleri tercih edin.',
      color: '#10B981'
    },
    {
      id: '3',
      icon: BookOpen,
      title: 'Doğru Bilgi Paylaşın',
      description: 'Sadece doğru ve güncel bilgileri paylaşın. Yanlış bilgi vermekten kaçının.',
      color: '#3B82F6'
    },
    {
      id: '4',
      icon: UserCheck,
      title: 'Yardımsever Olun',
      description: 'Kayıp hayvan sahiplerine yardım etmeye odaklanın. Yapıcı öneriler sunun.',
      color: '#8B5CF6'
    },
    {
      id: '5',
      icon: AlertTriangle,
      title: 'Spam Yapmayın',
      description: 'Aynı mesajı tekrar tekrar göndermeyin. İlgisiz içerik paylaşmayın.',
      color: '#F59E0B'
    },
    {
      id: '6',
      icon: Flag,
      title: 'Uygunsuz İçerik Bildirin',
      description: 'Kurallara aykırı davranışları hemen bildirin. Topluluk güvenliği hepimizin sorumluluğu.',
      color: '#EF4444'
    }
  ];

  const reportReasons = [
    'Spam veya İstenmeyen İçerik',
    'Hakaret veya Küfür',
    'Yanlış Bilgi',
    'Dolandırıcılık',
    'Uygunsuz İçerik',
    'Diğer'
  ];

  const handleReport = () => {
    if (!reportReason.trim()) {
      Alert.alert('Hata', 'Lütfen bir sebep seçin');
      return;
    }

    Alert.alert(
      'Rapor Gönderildi',
      'Raporunuz incelenmek üzere alındı. Teşekkür ederiz.',
      [{
        text: 'Tamam',
        onPress: () => {
          setShowReportModal(false);
          setReportReason('');
          setReportDescription('');
        }
      }]
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Header */}
      <View style={styles.guidelinesHeader}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.guidelinesHeaderGradient}
        >
          <Shield size={32} color="#FFF" />
          <Text style={styles.guidelinesHeaderTitle}>Topluluk Kuralları</Text>
          <Text style={styles.guidelinesHeaderSubtitle}>
            Güvenli ve dostane bir topluluk için kurallara uyalım
          </Text>
        </LinearGradient>
      </View>

      {/* Guidelines List */}
      <View style={styles.guidelinesList}>
        {guidelines.map((guideline) => {
          const IconComponent = guideline.icon;
          return (
            <View key={guideline.id} style={styles.guidelineCard}>
              <View style={styles.guidelineHeader}>
                <View style={[styles.guidelineIcon, { backgroundColor: `${guideline.color}15` }]}>
                  <IconComponent size={24} color={guideline.color} />
                </View>
                <Text style={styles.guidelineTitle}>{guideline.title}</Text>
              </View>
              <Text style={styles.guidelineDescription}>{guideline.description}</Text>
            </View>
          );
        })}
      </View>

      {/* Report Section */}
      <View style={styles.reportSection}>
        <Text style={styles.reportSectionTitle}>Kural İhlali Bildirin</Text>
        <Text style={styles.reportSectionDescription}>
          Kurallara aykırı davranış gördüğünüzde bize bildirin. 
          Topluluk güvenliği hepimizin sorumluluğu.
        </Text>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => setShowReportModal(true)}
        >
          <Flag size={20} color="#FFF" />
          <Text style={styles.reportButtonText}>Rapor Et</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>İletişim</Text>
        <Text style={styles.contactDescription}>
          Sorularınız için: support@petfinder.com
        </Text>
        <Text style={styles.contactDescription}>
          Acil durumlar için: +90 555 123 4567
        </Text>
      </View>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rapor Et</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.reportModalDescription}>
              Lütfen rapor sebebinizi seçin:
            </Text>

            <View style={styles.reportReasonsList}>
              {reportReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reportReasonItem,
                    reportReason === reason && styles.reportReasonItemSelected
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text style={[
                    styles.reportReasonText,
                    reportReason === reason && styles.reportReasonTextSelected
                  ]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ek açıklama (opsiyonel)"
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleReport}>
                <Text style={styles.submitButtonText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Hata', 'Lütfen grup adı ve açıklama girin');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      whatsappLink: whatsappLink.trim() || undefined,
      location: { lat: 41.0082, lng: 28.9784, radius: 5000 } // Default Istanbul
    });

    setName('');
    setDescription('');
    setWhatsappLink('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Grup Oluştur</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Grup adı"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Grup açıklaması"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          <TextInput
            style={styles.input}
            placeholder="WhatsApp grup linki (opsiyonel)"
            value={whatsappLink}
            onChangeText={setWhatsappLink}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Oluştur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const CommunityFeatures: React.FC = () => {
  const { 
    groups, 
    successStories, 
    petOfTheWeek, 
    stats,
    joinGroup,
    leaveGroup,
    createGroup,
    likeSuccessStory,
    shareSuccessStory,
    voteForPetOfTheWeek,
    addSuccessStory
  } = useCommunity();
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'stories' | 'petweek' | 'chat' | 'volunteers' | 'guidelines'>('groups');

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      Alert.alert('Başarılı!', 'Gruba katıldınız');
    } catch (error) {
      Alert.alert('Hata', 'Gruba katılırken bir hata oluştu');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    Alert.alert(
      'Gruptan Ayrıl',
      'Bu gruptan ayrılmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ayrıl', 
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupId);
              Alert.alert('Başarılı!', 'Gruptan ayrıldınız');
            } catch (error) {
              Alert.alert('Hata', 'Gruptan ayrılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      await createGroup(groupData);
      Alert.alert('Başarılı!', 'Grup oluşturuldu');
    } catch (error) {
      Alert.alert('Hata', 'Grup oluşturulurken bir hata oluştu');
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      await likeSuccessStory(storyId);
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleShareStory = async (storyId: string) => {
    try {
      await shareSuccessStory(storyId);
      Alert.alert('Paylaşıldı!', 'Başarı hikayesi paylaşıldı');
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
  };

  const handleVotePetOfWeek = async () => {
    try {
      const success = await voteForPetOfTheWeek();
      if (success) {
        Alert.alert('Oy Verildi!', 'Oyunuz kaydedildi');
      } else {
        Alert.alert('Bilgi', 'Bu hafta zaten oy verdiniz');
      }
    } catch (error) {
      Alert.alert('Hata', 'Oy verirken bir hata oluştu');
    }
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Link açılamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Link açılırken bir hata oluştu');
    }
  };

  const renderGroups = () => (
    <View style={styles.tabContent}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>{stats.totalGroups}</Text>
          <Text style={styles.statLabel}>Toplam Grup</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Toplam Üye</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.averageResponseTime}dk</Text>
          <Text style={styles.statLabel}>Ort. Yanıt</Text>
        </View>
      </View>

      {/* Create Group Button */}
      <TouchableOpacity 
        style={styles.createButton} 
        onPress={() => setShowCreateGroup(true)}
      >
        <Plus size={20} color="#FFF" />
        <Text style={styles.createButtonText}>Yeni Grup Oluştur</Text>
      </TouchableOpacity>

      {/* Groups List */}
      <View style={styles.groupsList}>
        {groups.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <View style={styles.groupMeta}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.groupLocation}>
                    {(group.location.radius / 1000).toFixed(1)}km yarıçap
                  </Text>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.groupMembers}>{group.memberCount} üye</Text>
                </View>
              </View>
            </View>

            <View style={styles.groupActions}>
              {group.whatsappLink && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => openExternalLink(group.whatsappLink!)}
                >
                  <MessageCircle size={16} color="#25D366" />
                  <Text style={styles.linkButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              )}

              {group.isJoined ? (
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={() => handleLeaveGroup(group.id)}
                >
                  <Text style={styles.leaveButtonText}>Ayrıl</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => handleJoinGroup(group.id)}
                >
                  <Text style={styles.joinButtonText}>Katıl</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSuccessStories = () => (
    <View style={styles.tabContent}>
      <View style={styles.storiesHeader}>
        <Text style={styles.storiesTitle}>Bu Hafta {stats.successStoriesThisWeek} Mutlu Son! 🎉</Text>
      </View>

      <View style={styles.storiesList}>
        {successStories.map((story) => (
          <View key={story.id} style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={styles.storyPetInfo}>
                <Text style={styles.storyPetName}>{story.petName}</Text>
                <Text style={styles.storyPetType}>{story.petType}</Text>
              </View>
              <Text style={styles.storyDate}>
                {new Date(story.foundDate).toLocaleDateString('tr-TR')}
              </Text>
            </View>

            <Text style={styles.storyText}>{story.story}</Text>

            <View style={styles.storyMeta}>
              <Text style={styles.storyLocation}>📍 {story.location}</Text>
              <Text style={styles.storyPeople}>
                {story.ownerName} → {story.finderName}
              </Text>
            </View>

            <View style={styles.storyActions}>
              <TouchableOpacity 
                style={[styles.storyAction, story.isLiked && styles.storyActionLiked]}
                onPress={() => handleLikeStory(story.id)}
              >
                <Heart 
                  size={16} 
                  color={story.isLiked ? "#EF4444" : "#6B7280"} 
                  fill={story.isLiked ? "#EF4444" : "none"}
                />
                <Text style={[
                  styles.storyActionText,
                  story.isLiked && styles.storyActionTextLiked
                ]}>
                  {story.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.storyAction}
                onPress={() => handleShareStory(story.id)}
              >
                <Share2 size={16} color="#6B7280" />
                <Text style={styles.storyActionText}>{story.shares}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPetOfTheWeek = () => (
    <View style={styles.tabContent}>
      {petOfTheWeek && (
        <View style={styles.petOfWeekCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.petOfWeekHeader}
          >
            <Trophy size={32} color="#FFF" />
            <Text style={styles.petOfWeekTitle}>Haftanın Evcil Hayvanı</Text>
          </LinearGradient>

          <View style={styles.petOfWeekContent}>
            <Text style={styles.petOfWeekName}>{petOfTheWeek.petName}</Text>
            <Text style={styles.petOfWeekType}>{petOfTheWeek.petType}</Text>
            <Text style={styles.petOfWeekOwner}>Sahibi: {petOfTheWeek.ownerName}</Text>
            
            <Text style={styles.petOfWeekDescription}>
              {petOfTheWeek.description}
            </Text>

            <View style={styles.petOfWeekVotes}>
              <Vote size={20} color="#8B5CF6" />
              <Text style={styles.petOfWeekVoteCount}>{petOfTheWeek.votes} oy</Text>
            </View>

            {!petOfTheWeek.hasVoted ? (
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={handleVotePetOfWeek}
              >
                <Text style={styles.voteButtonText}>Oy Ver</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.votedIndicator}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.votedText}>Oy verildi</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderCommunityChat = () => (
    <CommunityChat />
  );

  const renderVolunteers = () => (
    <SearchVolunteers />
  );

  const renderGuidelines = () => (
    <CommunityGuidelines />
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Users size={20} color={activeTab === 'groups' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[
            styles.tabText, 
            activeTab === 'groups' && styles.activeTabText
          ]}>
            Gruplar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stories' && styles.activeTab]}
          onPress={() => setActiveTab('stories')}
        >
          <Heart size={20} color={activeTab === 'stories' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[
            styles.tabText, 
            activeTab === 'stories' && styles.activeTabText
          ]}>
            Başarı Hikayeleri
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'petweek' && styles.activeTab]}
          onPress={() => setActiveTab('petweek')}
        >
          <Trophy size={20} color={activeTab === 'petweek' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[
            styles.tabText, 
            activeTab === 'petweek' && styles.activeTabText
          ]}>
            Haftanın Evcili
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageCircle size={20} color={activeTab === 'chat' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[
            styles.tabText, 
            activeTab === 'chat' && styles.activeTabText
          ]}>
            Sohbet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'volunteers' && styles.activeTab]}
          onPress={() => setActiveTab('volunteers')}
        >
          <Search size={20} color={activeTab === 'volunteers' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[
            styles.tabText, 
            activeTab === 'volunteers' && styles.activeTabText
          ]}>
            Gönüllüler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'guidelines' && styles.activeTab]}
          onPress={() => setActiveTab('guidelines')}
        >
          <Award size={20} color={activeTab === 'guidelines' ? '#8B5CF6' : '#6B7280'} />
          <Text style={[
            styles.tabText, 
            activeTab === 'guidelines' && styles.activeTabText
          ]}>
            Kurallar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'groups' && renderGroups()}
        {activeTab === 'stories' && renderSuccessStories()}
        {activeTab === 'petweek' && renderPetOfTheWeek()}
        {activeTab === 'chat' && renderCommunityChat()}
        {activeTab === 'volunteers' && renderVolunteers()}
        {activeTab === 'guidelines' && renderGuidelines()}
      </ScrollView>

      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSubmit={handleCreateGroup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#F3F4F6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  groupsList: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 12,
  },
  groupMembers: {
    fontSize: 12,
    color: '#6B7280',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25D366',
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  leaveButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  storiesHeader: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  storiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  storiesList: {
    gap: 16,
  },
  storyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyPetInfo: {
    flex: 1,
  },
  storyPetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  storyPetType: {
    fontSize: 14,
    color: '#6B7280',
  },
  storyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  storyText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  storyMeta: {
    marginBottom: 12,
  },
  storyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  storyPeople: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  storyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  storyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storyActionLiked: {
    // Additional styling for liked state
  },
  storyActionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  storyActionTextLiked: {
    color: '#EF4444',
  },
  petOfWeekCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  petOfWeekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  petOfWeekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  petOfWeekContent: {
    padding: 20,
    alignItems: 'center',
  },
  petOfWeekName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petOfWeekType: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  petOfWeekOwner: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 16,
  },
  petOfWeekDescription: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  petOfWeekVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  petOfWeekVoteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  voteButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  votedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  votedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Search Volunteers Styles
  searchHeader: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  volunteersList: {
    gap: 16,
  },
  volunteerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  volunteerAvatarContainer: {
    position: 'relative',
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volunteerAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  volunteerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  volunteerPremiumBadge: {
    marginTop: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  volunteerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volunteerLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  volunteerSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  volunteerStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  responseTime: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  volunteerBio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specialtyTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
  },
  messageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Community Guidelines Styles
  guidelinesHeader: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  guidelinesHeaderGradient: {
    padding: 24,
    alignItems: 'center',
  },
  guidelinesHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  guidelinesHeaderSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  guidelinesList: {
    gap: 16,
    marginBottom: 32,
  },
  guidelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  guidelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  guidelineDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  reportSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  reportSectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  contactSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  reportModalDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  reportReasonsList: {
    marginBottom: 20,
    gap: 8,
  },
  reportReasonItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reportReasonItemSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#8B5CF6',
  },
  reportReasonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  reportReasonTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});