import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MapPin,
  Search,
  MessageCircle,
  Users,
  Trophy,
  Gift,
  Heart,
  PawPrint,
  Bell,
  Camera,
  Wifi,
  AlertCircle,
  Star,
  Calendar,
  Settings,
  Plus,
  Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassColors } from '@/constants/colors';

const { width } = Dimensions.get('window');

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<any>;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon: Icon = PawPrint,
  actionText,
  onAction,
  variant = 'default',
  size = 'medium'
}) => {
  const iconSize = size === 'small' ? 32 : size === 'medium' ? 48 : 64;
  const titleSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const subtitleSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  const padding = size === 'small' ? 20 : size === 'medium' ? 40 : 60;

  const renderContent = () => (
    <>
      <View style={[styles.iconContainer, { marginBottom: size === 'small' ? 12 : 16 }]}>
        <Icon color="#94A3B8" size={iconSize} />
      </View>
      <Text style={[styles.title, { fontSize: titleSize, marginBottom: size === 'small' ? 6 : 8 }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { fontSize: subtitleSize, marginBottom: actionText ? 24 : 0 }]}>
        {subtitle}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </>
  );

  if (variant === 'glass') {
    return (
      <View style={[styles.container, { padding }]}>
        <View style={styles.glassContainer}>
          {renderContent()}
        </View>
      </View>
    );
  }

  if (variant === 'gradient') {
    return (
      <View style={[styles.container, { padding }]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </View>
    );
  }

  if (variant === 'minimal') {
    return (
      <View style={[styles.container, styles.minimalContainer, { padding }]}>
        {renderContent()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { padding }]}>
      {renderContent()}
    </View>
  );
};

// Specific empty states for different screens
export const NoNearbyPetsEmpty: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon={MapPin}
    title="Yakında Kayıp Hayvan Yok"
    subtitle="Bölgenizde kayıp hayvan bildirimi bulunmuyor. Yeni bildirimler geldiğinde size haber vereceğiz."
    actionText={onRefresh ? "Yenile" : undefined}
    onAction={onRefresh}
    variant="glass"
  />
);

export const NoSearchResultsEmpty: React.FC<{ searchQuery: string; onClear?: () => void }> = ({ searchQuery, onClear }) => (
  <EmptyState
    icon={Search}
    title="Sonuç Bulunamadı"
    subtitle={`"${searchQuery}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.`}
    actionText={onClear ? "Aramayı Temizle" : undefined}
    onAction={onClear}
    variant="minimal"
    size="small"
  />
);

export const NoMessagesEmpty: React.FC<{ onStartChat?: () => void }> = ({ onStartChat }) => (
  <EmptyState
    icon={MessageCircle}
    title="Henüz Mesaj Yok"
    subtitle="Kayıp hayvan sahipleriyle iletişime geçin ve yardım edin. İlk mesajınızı gönderin!"
    actionText={onStartChat ? "Sohbet Başlat" : undefined}
    onAction={onStartChat}
    variant="gradient"
  />
);

export const NoCommunityEmpty: React.FC<{ onJoin?: () => void }> = ({ onJoin }) => (
  <EmptyState
    icon={Users}
    title="Topluluk Boş"
    subtitle="Henüz topluluk etkinliği yok. İlk katılımcı olun ve diğer hayvan severlerle tanışın!"
    actionText={onJoin ? "Topluluğa Katıl" : undefined}
    onAction={onJoin}
    variant="glass"
  />
);

export const NoAchievementsEmpty: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => (
  <EmptyState
    icon={Trophy}
    title="Henüz Rozet Yok"
    subtitle="Hayvan kurtarma etkinliklerine katılın ve rozetler kazanın. İlk rozetinizi kazanmak için harekete geçin!"
    actionText={onExplore ? "Keşfet" : undefined}
    onAction={onExplore}
    variant="gradient"
  />
);

export const NoRewardsEmpty: React.FC<{ onEarn?: () => void }> = ({ onEarn }) => (
  <EmptyState
    icon={Gift}
    title="Ödül Yok"
    subtitle="Hayvan kurtarma faaliyetlerine katılarak ödüller kazanabilirsiniz. Hemen başlayın!"
    actionText={onEarn ? "Ödül Kazan" : undefined}
    onAction={onEarn}
    variant="glass"
  />
);

export const NoFavoritesEmpty: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon={Heart}
    title="Favori Yok"
    subtitle="Beğendiğiniz hayvanları favorilerinize ekleyin. Favoriler burada görünecek."
    actionText={onBrowse ? "Hayvanları Keşfet" : undefined}
    onAction={onBrowse}
    variant="minimal"
  />
);

export const NoNotificationsEmpty: React.FC<{ onEnable?: () => void }> = ({ onEnable }) => (
  <EmptyState
    icon={Bell}
    title="Bildirim Yok"
    subtitle="Yakınınızdaki kayıp hayvan bildirimleri için bildirimler açın. Hiçbir önemli güncellemeyi kaçırmayın!"
    actionText={onEnable ? "Bildirimleri Aç" : undefined}
    onAction={onEnable}
    variant="glass"
  />
);

export const NoPhotosEmpty: React.FC<{ onTakePhoto?: () => void }> = ({ onTakePhoto }) => (
  <EmptyState
    icon={Camera}
    title="Fotoğraf Yok"
    subtitle="Hayvanınızın fotoğraflarını ekleyin. Fotoğraflar kayıp durumunda çok önemlidir."
    actionText={onTakePhoto ? "Fotoğraf Çek" : undefined}
    onAction={onTakePhoto}
    variant="minimal"
    size="small"
  />
);

export const OfflineEmpty: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={Wifi}
    title="İnternet Bağlantısı Yok"
    subtitle="İnternet bağlantınızı kontrol edin ve tekrar deneyin. Bazı özellikler çevrimdışı kullanılabilir."
    actionText={onRetry ? "Tekrar Dene" : undefined}
    onAction={onRetry}
    variant="glass"
  />
);

export const ErrorEmpty: React.FC<{ onRetry?: () => void; message?: string }> = ({ onRetry, message }) => (
  <EmptyState
    icon={AlertCircle}
    title="Bir Hata Oluştu"
    subtitle={message || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}
    actionText={onRetry ? "Tekrar Dene" : undefined}
    onAction={onRetry}
    variant="minimal"
  />
);

export const NoReviewsEmpty: React.FC<{ onWrite?: () => void }> = ({ onWrite }) => (
  <EmptyState
    icon={Star}
    title="Değerlendirme Yok"
    subtitle="Bu veteriner hakkında henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!"
    actionText={onWrite ? "Değerlendirme Yaz" : undefined}
    onAction={onWrite}
    variant="minimal"
    size="small"
  />
);

export const NoEventsEmpty: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={Calendar}
    title="Etkinlik Yok"
    subtitle="Yakında hayvan dostu etkinlik bulunmuyor. Kendi etkinliğinizi oluşturun!"
    actionText={onCreate ? "Etkinlik Oluştur" : undefined}
    onAction={onCreate}
    variant="gradient"
  />
);

export const NoSettingsEmpty: React.FC<{ onConfigure?: () => void }> = ({ onConfigure }) => (
  <EmptyState
    icon={Settings}
    title="Ayar Yapılmamış"
    subtitle="Uygulamayı kişiselleştirmek için ayarlarınızı yapılandırın."
    actionText={onConfigure ? "Ayarları Yapılandır" : undefined}
    onAction={onConfigure}
    variant="minimal"
    size="small"
  />
);

export const NoDataEmpty: React.FC<{ onAdd?: () => void; title?: string; subtitle?: string }> = ({ 
  onAdd, 
  title = "Veri Yok", 
  subtitle = "Henüz veri eklenmemiş. İlk veriyi eklemek için butona tıklayın." 
}) => (
  <EmptyState
    icon={Plus}
    title={title}
    subtitle={subtitle}
    actionText={onAdd ? "Ekle" : undefined}
    onAction={onAdd}
    variant="glass"
  />
);

export const NoConnectionEmpty: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon={Zap}
    title="Bağlantı Sorunu"
    subtitle="Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin ve tekrar deneyin."
    actionText={onRetry ? "Tekrar Bağlan" : undefined}
    onAction={onRetry}
    variant="glass"
  />
);

export const NoHealthRecordsEmpty: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
  <EmptyState
    icon={Heart}
    title="Sağlık Kaydı Yok"
    subtitle="Hayvanınızın sağlık kayıtlarını buradan takip edin. Aşı, ilaç ve veteriner kontrollerini kaydedin."
    actionText={onAdd ? "Kayıt Ekle" : undefined}
    onAction={onAdd}
    variant="gradient"
  />
);

export const NoAppointmentsEmpty: React.FC<{ onSchedule?: () => void }> = ({ onSchedule }) => (
  <EmptyState
    icon={Calendar}
    title="Randevu Yok"
    subtitle="Hayvanınız için veteriner randevusu planlayın. Sağlık kontrollerini düzenli takip edin."
    actionText={onSchedule ? "Randevu Al" : undefined}
    onAction={onSchedule}
    variant="glass"
  />
);

export const NoLeaderboardEmpty: React.FC<{ onJoin?: () => void }> = ({ onJoin }) => (
  <EmptyState
    icon={Trophy}
    title="Liderlik Tablosu Boş"
    subtitle="Hayvan kurtarma faaliyetlerine katılarak liderlik tablosunda yerinizi alın!"
    actionText={onJoin ? "Katılım Göster" : undefined}
    onAction={onJoin}
    variant="gradient"
  />
);

export const NoActivityEmpty: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    icon={Zap}
    title="Henüz Aktivite Yok"
    subtitle="Topluluk etkinliklerine katılarak rozet kazanın ve profil aktivitenizi arttırın."
    actionText={onStart ? "Hemen Başla" : undefined}
    onAction={onStart}
    variant="minimal"
    size="small"
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  minimalContainer: {
    backgroundColor: 'transparent',
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: width - 40,
  },
  gradientContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: width - 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitle: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width - 80,
  },
  actionButton: {
    backgroundColor: glassColors.turkish.red,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: glassColors.turkish.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;