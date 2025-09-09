import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Camera,
  MapPin,
  Phone,
  Video,
  Info,
  MoreHorizontal,
} from 'lucide-react-native';
import { useMessaging, type Message } from '@/hooks/messaging-store';
import { useAuth } from '@/hooks/auth-store';
import { usePremium } from '@/hooks/premium-store';
import { PremiumBadge } from './PremiumBadge';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (message.type === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
      {!isOwn && showAvatar && (
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }}
          style={styles.avatar}
        />
      )}
      <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      {isOwn && showAvatar && <View style={styles.avatarPlaceholder} />}
    </View>
  );
}

export default function MessagingScreen() {
  const params = useLocalSearchParams<{
    conversationId?: string;
    petId?: string;
    petName?: string;
    petPhoto?: string;
    ownerId?: string;
  }>();
  
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const {
    createConversation,
    sendMessage,
    markAsRead,
    getConversationMessages,
    conversations,
  } = useMessaging();
  
  const [conversationId, setConversationId] = useState<string | null>(params.conversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const conversation = conversations.find(conv => conv.id === conversationId);
  const petName = conversation?.petName || params.petName || 'Pet Owner';
  const petPhoto = conversation?.petPhoto || params.petPhoto;

  useEffect(() => {
    initializeConversation();
  }, [params]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      markAsRead(conversationId);
    }
  }, [conversationId]);

  const initializeConversation = async () => {
    if (params.conversationId) {
      setConversationId(params.conversationId);
      return;
    }

    if (params.petId && params.ownerId && user) {
      try {
        setIsLoading(true);
        const newConversationId = await createConversation(
          params.petId,
          params.petName || 'Pet',
          params.petPhoto,
          params.ownerId
        );
        setConversationId(newConversationId);
      } catch (error) {
        console.error('Error creating conversation:', error);
        Alert.alert('Error', 'Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadMessages = () => {
    if (conversationId) {
      const conversationMessages = getConversationMessages(conversationId);
      setMessages(conversationMessages);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationId || isLoading) return;

    const messageContent = inputText.trim();
    setInputText('');

    try {
      await sendMessage(conversationId, messageContent);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageContent); // Restore text on error
    }
  };

  const handleCall = () => {
    Alert.alert(
      'Call Owner',
      'This would initiate a call to the pet owner.',
      [{ text: 'OK' }]
    );
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Video Call',
      'This would start a video call with the pet owner.',
      [{ text: 'OK' }]
    );
  };

  const handleInfo = () => {
    Alert.alert(
      'Conversation Info',
      'This would show conversation details and settings.',
      [{ text: 'OK' }]
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === user?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#000000" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerInfo} onPress={handleInfo}>
          {petPhoto && (
            <Image source={{ uri: petPhoto }} style={styles.headerAvatar} />
          )}
          <View style={styles.headerTextContainer}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{petName}</Text>
              {isPremium && (
                <PremiumBadge size="small" style={styles.headerPremiumBadge} />
              )}
            </View>
            <Text style={styles.headerSubtitle}>Pet Owner</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleVideoCall}>
            <Video color="#007AFF" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleCall}>
            <Phone color="#007AFF" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Camera color="#8E8E93" size={24} />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message"
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={1000}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send color={inputText.trim() ? "#FFFFFF" : "#8E8E93"} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(84, 84, 88, 0.6)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerPremiumBadge: {
    marginTop: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerActionButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 28,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 1,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  ownMessageTime: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#FFFFFF',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(84, 84, 88, 0.6)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
  },
});