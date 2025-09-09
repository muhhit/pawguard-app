import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Send, Heart, MapPin, MoreHorizontal, Camera, Paperclip } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
}

export default function ConversationScreen() {
  const params = useLocalSearchParams<{
    conversationId?: string;
    name?: string;
    type?: string;
    petName?: string;
  }>();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Luna hakkında bilgi almak istiyorum.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isOwn: true,
      type: 'text'
    },
    {
      id: '2', 
      text: 'Tabii ki! Luna hakkında ne öğrenmek istiyorsunuz?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      isOwn: false,
      type: 'text'
    },
    {
      id: '3',
      text: 'Son görüldüğü yer neresi? Arama yapmak istiyorum.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      isOwn: true,
      type: 'text'
    },
    {
      id: '4',
      text: 'Kadıköy Moda sahilinde son görüldü. Çok teşekkür ederim yardımınız için! 🙏',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isOwn: false,
      type: 'text'
    }
  ]);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        timestamp: new Date(),
        isOwn: true,
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate response after 2 seconds
      setTimeout(() => {
        const responses = [
          'Teşekkürler! Bu bilgi çok yardımcı olacak.',
          'Hemen o bölgeyi kontrol edeceğim.',
          'Başka bir bilginiz var mı?',
          'Çok teşekkür ederim! 🐾'
        ];
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          isOwn: false,
          type: 'text'
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pet_owner': return '#8B5CF6';
      case 'volunteer': return '#10B981';
      case 'group': return '#F59E0B';
      case 'veterinary': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pet_owner': return 'Sahip';
      case 'volunteer': return 'Gönüllü';
      case 'group': return 'Grup';
      case 'veterinary': return 'Veteriner';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{params.name || 'Kullanıcı'}</Text>
            {params.type && (
              <View style={styles.headerBadgeContainer}>
                <View style={[styles.headerBadge, { backgroundColor: getTypeColor(params.type) }]}>
                  <Text style={styles.headerBadgeText}>{getTypeLabel(params.type)}</Text>
                </View>
                {params.petName && (
                  <Text style={styles.headerPetName}>🐾 {params.petName}</Text>
                )}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Heart color="#FF6B9D" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <MapPin color="#FF6B9D" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <MoreHorizontal color="#64748B" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.messageContainer,
            msg.isOwn ? styles.ownMessage : styles.otherMessage
          ]}>
            <View style={[
              styles.messageBubble,
              msg.isOwn ? styles.ownBubble : styles.otherBubble
            ]}>
              <Text style={[
                styles.messageText,
                msg.isOwn ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {msg.text}
              </Text>
            </View>
            <Text style={[
              styles.messageTime,
              msg.isOwn ? styles.ownMessageTime : styles.otherMessageTime
            ]}>
              {formatTime(msg.timestamp)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip color="#64748B" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cameraButton}>
            <Camera color="#64748B" size={20} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Mesaj yazın..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Send 
              color={message.trim() ? "#FFFFFF" : "#94A3B8"} 
              size={20} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1B69',
  },
  headerBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  headerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerPetName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  ownBubble: {
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1E293B',
  },
  messageTime: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  ownMessageTime: {
    color: '#FF6B9D',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#64748B',
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  cameraButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFE4E1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D1B69',
    backgroundColor: '#FFF8F0',
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
  },
  sendButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  sendButtonInactive: {
    backgroundColor: '#F1F5F9',
  },
});