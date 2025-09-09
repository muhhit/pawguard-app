import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { Search, Edit3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { NoMessagesEmpty, NoSearchResultsEmpty } from '@/components/EmptyStates';

export default function MessagingTab() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Active users for top section
  const activeUsers = [
    {
      id: 'user1',
      name: 'Suat',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      online: true,
      petType: '🐕'
    },
    {
      id: 'user2', 
      name: 'Pınar',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      online: true,
      hasHeart: true,
      petType: '🐱'
    },
    {
      id: 'user3',
      name: 'Ahmet',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      online: true,
      petType: '🐕'
    },
    {
      id: 'user4',
      name: 'Zeynep',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      online: false,
      petType: '🐱'
    },
    {
      id: 'user5',
      name: 'Mehmet',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      online: true,
      petType: '🐕'
    }
  ];

  const conversations = [
    {
      id: '1',
      name: 'Suat Kaya',
      subtitle: 'Max\'ı gördün mü? Parkta kayboldu 😢',
      lastMessage: '',
      time: '8:43 PM',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      type: 'pet-owner',
      petType: '🐕',
      hasBlueIndicator: true
    },
    {
      id: '2',
      name: 'Pınar Demir',
      subtitle: 'Teşekkürler! Luna\'yı bulduğunuz için çok mutluyum ❤️',
      lastMessage: '',
      time: '7:58 PM',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      type: 'pet-owner',
      petType: '🐱'
    },
    {
      id: '3',
      name: 'Ahmet Yılmaz',
      subtitle: 'Charlie\'nin fotoğrafını paylaştım, umarım buluruz',
      lastMessage: '',
      time: '6:39 PM',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      type: 'pet-owner',
      petType: '🐕',
      hasBlueIndicator: true
    },
    {
      id: '4',
      name: 'Zeynep Özkan',
      subtitle: 'Mimi\'yi arıyorum, son görülme yeri Kadıköy',
      lastMessage: '',
      time: '1:59 PM',
      unread: 1,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      type: 'pet-owner',
      petType: '🐱'
    },
    {
      id: '5',
      name: 'Kayıp Hayvan Grubu',
      subtitle: 'Yeni bir kayıp ilanı paylaşıldı - Beşiktaş bölgesi',
      lastMessage: '',
      time: '4:08 PM',
      unread: 0,
      avatar: null,
      type: 'group',
      petType: '🐾'
    },
    {
      id: '6',
      name: 'Mehmet Arslan',
      subtitle: 'Buddy\'yi buldum! Sahipleri arıyorum',
      lastMessage: '',
      time: '3:47 PM',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      type: 'pet-owner',
      petType: '🐕',
      hasBlueIndicator: true
    },
    {
      id: '7',
      name: 'Ayşe Kılıç',
      subtitle: 'Pamuk\'un veteriner randevusu var, hatırlatma',
      lastMessage: '',
      time: '4:49 PM',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
      type: 'pet-owner',
      petType: '🐱'
    }
  ];

  const filteredConversations = conversations.filter(conv => {
    if (!searchText) return true;
    return conv.name.toLowerCase().includes(searchText.toLowerCase()) ||
           conv.subtitle.toLowerCase().includes(searchText.toLowerCase());
  });

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            setShowSearch(!showSearch);
            Haptics.selectionAsync();
          }}
        >
          <Edit3 color="#007AFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color="#8E8E93" size={16} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>
        </View>
      )}

      {/* Active Users */}
      <View style={styles.activeUsersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeUsersScroll}>
          {activeUsers.map((user) => (
            <TouchableOpacity key={user.id} style={styles.activeUserItem}>
              <View style={styles.activeUserAvatar}>
                <Image source={{ uri: user.avatar }} style={styles.activeUserImage} />
                <View style={styles.petTypeBadge}>
                  <Text style={styles.petTypeEmoji}>{user.petType}</Text>
                </View>
                {user.hasHeart && (
                  <View style={styles.heartBadge}>
                    <Text style={styles.heartEmoji}>❤️</Text>
                  </View>
                )}
                {user.online && <View style={styles.onlineIndicator} />}
              </View>
              <Text style={styles.activeUserName}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {filteredConversations.length === 0 ? (
          searchText ? (
            <NoSearchResultsEmpty 
              searchQuery={searchText} 
              onClear={() => setSearchText('')}
            />
          ) : (
            <NoMessagesEmpty onStartChat={() => {
              console.log('Starting new chat...');
              // Navigate to new chat or show contact picker
            }} />
          )
        ) : (
          filteredConversations.map((conversation) => (
          <TouchableOpacity 
            key={conversation.id}
            style={styles.conversationItem}
            onPress={() => {
              console.log('Opening conversation:', conversation.name);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({
                pathname: '/conversation',
                params: {
                  conversationId: conversation.id,
                  name: conversation.name,
                  type: conversation.type || 'contact'
                }
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              {conversation.avatar ? (
                <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {conversation.petType || conversation.name.charAt(0)}
                  </Text>
                </View>
              )}
              {conversation.petType && conversation.avatar && (
                <View style={styles.conversationPetBadge}>
                  <Text style={styles.conversationPetEmoji}>{conversation.petType}</Text>
                </View>
              )}
              {conversation.hasBlueIndicator && (
                <View style={styles.blueIndicator} />
              )}
            </View>
            
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {conversation.name}
                </Text>
                <View style={styles.timeAndUnread}>
                  <Text style={styles.conversationTime}>{conversation.time}</Text>
                  {conversation.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{conversation.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Text 
                style={styles.conversationSubtitle}
                numberOfLines={2}
              >
                {conversation.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
          ))
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF8F0',
  },
  editButton: {
    paddingVertical: 8,
  },
  editText: {
    fontSize: 17,
    color: '#FF6B9D',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D1B69',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF8F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#2D1B69',
  },
  activeUsersContainer: {
    backgroundColor: '#FFF8F0',
    paddingVertical: 16,
  },
  activeUsersScroll: {
    paddingHorizontal: 20,
  },
  activeUserItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  activeUserAvatar: {
    position: 'relative',
    marginBottom: 8,
  },
  activeUserImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  petTypeBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petTypeEmoji: {
    fontSize: 12,
  },
  heartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartEmoji: {
    fontSize: 14,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: '#30D158',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  activeUserName: {
    fontSize: 12,
    color: '#2D1B69',
    textAlign: 'center',
  },
  conversationsList: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 0.5,
    borderBottomColor: '#FFE4E1',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  conversationPetBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  conversationPetEmoji: {
    fontSize: 10,
  },
  blueIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F2F2F7',
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
  timeAndUnread: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '400',
    color: '#2D1B69',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 15,
    color: '#8E8E93',
  },
  conversationSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});