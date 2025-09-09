import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Search,
  Edit3,
  Camera,
  Phone,
  Video,
} from 'lucide-react-native';
import { useMessaging, type Conversation } from '@/hooks/messaging-store';
import { useAuth } from '@/hooks/auth-store';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getPreviewText = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { content, type, senderId } = conversation.lastMessage;
    const prefix = senderId === 'system' ? '' : 'You: ';
    
    switch (type) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'location':
        return `${prefix}📍 Location`;
      case 'system':
        return content;
      default:
        return `${prefix}${content}`;
    }
  };

  return (
    <TouchableOpacity style={styles.conversationItem} onPress={onPress}>
      <Image
        source={{
          uri: conversation.petPhoto || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=60&h=60&fit=crop'
        }}
        style={styles.conversationAvatar}
      />
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {conversation.petName}
          </Text>
          <Text style={styles.conversationTime}>
            {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}
          </Text>
        </View>
        
        <View style={styles.conversationPreview}>
          <Text style={styles.conversationMessage} numberOfLines={2}>
            {getPreviewText()}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ConversationsList() {
  const { conversations, getTotalUnreadCount } = useMessaging();
  const [searchText, setSearchText] = useState('');
  
  const filteredConversations = conversations.filter(conv =>
    conv.petName.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedConversations = filteredConversations.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : new Date(a.createdAt).getTime();
    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: '/messaging',
      params: {
        conversationId: conversation.id,
        petName: conversation.petName,
        petPhoto: conversation.petPhoto,
      },
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  );

  // Mock recent contacts for iOS 26 style
  const recentContacts = [
    {
      id: '1',
      name: 'Sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
    },
    {
      id: '2', 
      name: 'Mike',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Emma',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeButton}>
          <Edit3 color="#007AFF" size={22} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#8E8E93" size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Recent Contacts */}
      <View style={styles.recentSection}>
        <FlatList
          data={recentContacts}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentContacts}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recentContact}>
              <Image source={{ uri: item.avatar }} style={styles.recentAvatar} />
              <Text style={styles.recentName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Conversations */}
      <FlatList
        data={sortedConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a conversation by contacting a pet owner
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  composeButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recentSection: {
    paddingBottom: 16,
  },
  recentContacts: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentContact: {
    alignItems: 'center',
    width: 60,
  },
  recentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 4,
  },
  recentName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  conversationTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  conversationPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});