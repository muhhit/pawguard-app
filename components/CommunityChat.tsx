import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import {
  Send,
  Users,
  Smile,
  Camera,

} from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { usePremium } from '@/hooks/premium-store';
import { LinearGradient } from 'expo-linear-gradient';
import { PremiumBadge } from './PremiumBadge';

const { width } = Dimensions.get('window');

interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'location' | 'system';
  isOnline?: boolean;
  isPremium?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isPremium?: boolean;
}

const CommunityChat: React.FC = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockMessages: CommunityMessage[] = [
      {
        id: 'msg-1',
        userId: 'user-1',
        userName: 'Ayşe K.',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        content: 'Merhaba herkese! Bugün Kadıköy\'de kayıp bir kedi gördüm, sahiplerini arıyor olabilir.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: 'text',
        isOnline: true,
        isPremium: true,
      },
      {
        id: 'msg-2',
        userId: 'user-2',
        userName: 'Mehmet S.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        content: 'Hangi bölgede gördünüz? Ben de Kadıköy\'deyim, yardımcı olabilirim.',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        type: 'text',
        isOnline: true,
        isPremium: false,
      },
      {
        id: 'msg-3',
        userId: 'user-3',
        userName: 'Zeynep A.',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        content: 'Fotoğrafını paylaşabilir misiniz? Belki tanırım.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        type: 'text',
        isOnline: false,
        isPremium: true,
      },
      {
        id: 'msg-4',
        userId: 'system',
        userName: 'Sistem',
        content: 'Can Y. gruba katıldı 👋',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        type: 'system',
      },
    ];

    const mockOnlineUsers: OnlineUser[] = [
      {
        id: 'user-1',
        name: 'Ayşe K.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        isOnline: true,
        isPremium: true,
      },
      {
        id: 'user-2',
        name: 'Mehmet S.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        isOnline: true,
        isPremium: false,
      },
      {
        id: 'user-4',
        name: 'Can Y.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isOnline: true,
        isPremium: true,
      },
      {
        id: 'user-3',
        name: 'Zeynep A.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        isOnline: false,
        isPremium: false,
      },
    ];

    setMessages(mockMessages);
    setOnlineUsers(mockOnlineUsers);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !user) return;

    const newMessage: CommunityMessage = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      userName: user.name || 'Kullanıcı',
      userAvatar: undefined, // MockUser doesn't have avatar property
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      isOnline: true,
      isPremium: isPremium,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}sa önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const renderMessage = ({ item }: { item: CommunityMessage }) => {
    const isOwnMessage = item.userId === user?.id;
    const isSystemMessage = item.type === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
        {!isOwnMessage && (
          <Image
            source={{ uri: item.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          {!isOwnMessage && (
            <View style={styles.messageUserNameContainer}>
              <Text style={styles.messageUserName}>{item.userName}</Text>
              {item.isPremium && (
                <PremiumBadge size="small" style={styles.messagePremiumBadge} />
              )}
            </View>
          )}
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderOnlineUser = ({ item }: { item: OnlineUser }) => (
    <View style={styles.onlineUserItem}>
      <View style={styles.onlineUserAvatarContainer}>
        <Image
          source={{ uri: item.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }}
          style={styles.onlineUserAvatar}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.isPremium && (
          <PremiumBadge size="small" style={styles.onlineUserPremiumBadge} />
        )}
      </View>
      <Text style={styles.onlineUserName} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with online users */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Users size={24} color="#FFF" />
              <Text style={styles.headerTitle}>Topluluk Sohbeti</Text>
            </View>
            <Text style={styles.onlineCount}>
              {onlineUsers.filter(u => u.isOnline).length} çevrimiçi
            </Text>
          </View>
          
          <FlatList
            data={onlineUsers}
            renderItem={renderOnlineUser}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.onlineUsersList}
            contentContainerStyle={styles.onlineUsersContent}
          />
        </LinearGradient>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Camera size={24} color="#8B5CF6" />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
          </View>
          
          <TouchableOpacity style={styles.emojiButton}>
            <Smile size={24} color="#8B5CF6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  onlineCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  onlineUsersList: {
    flexGrow: 0,
  },
  onlineUsersContent: {
    paddingRight: 16,
  },
  onlineUserItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  onlineUserAvatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  onlineUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  onlineUserPremiumBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
  },
  onlineUserName: {
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageUserNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  messageUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  messagePremiumBadge: {
    marginTop: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  sendButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
});

export default CommunityChat;