import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './auth-store';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  replyTo?: string;
  attachments?: {
    type: 'image' | 'location';
    url?: string;
    location?: { lat: number; lng: number; address?: string };
  }[];
}

export interface Conversation {
  id: string;
  petId: string;
  petName: string;
  petPhoto?: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

const STORAGE_KEYS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  CONTACTS: 'contacts',
};

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [storedConversations, storedMessages, storedContacts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
      ]);

      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error('Error loading messaging data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversations = useCallback(async (newConversations: Conversation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(newConversations));
      setConversations(newConversations);
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }, []);

  const saveMessages = useCallback(async (conversationId: string, newMessages: Message[]) => {
    try {
      const updatedMessages = { ...messages, [conversationId]: newMessages };
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  const createConversation = useCallback(async (petId: string, petName: string, petPhoto?: string, ownerId?: string): Promise<string> => {
    if (!user || !ownerId) throw new Error('User not authenticated or owner not specified');
    
    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => conv.petId === petId && conv.participantIds.includes(user.id) && conv.participantIds.includes(ownerId)
    );
    
    if (existingConversation) {
      return existingConversation.id;
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id: conversationId,
      petId,
      petName,
      petPhoto,
      participantIds: [user.id, ownerId],
      unreadCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedConversations = [...conversations, newConversation];
    await saveConversations(updatedConversations);
    
    // Add system message
    const systemMessage: Message = {
      id: `msg_${Date.now()}_system`,
      conversationId,
      senderId: 'system',
      receiverId: ownerId,
      content: `Conversation started about ${petName}`,
      type: 'system',
      timestamp: new Date().toISOString(),
      isRead: false,
      isDelivered: true,
    };
    
    await saveMessages(conversationId, [systemMessage]);
    
    return conversationId;
  }, [user, conversations, saveConversations, saveMessages]);

  const sendMessage = useCallback(async (conversationId: string, content: string, type: Message['type'] = 'text', attachments?: Message['attachments']) => {
    if (!user) throw new Error('User not authenticated');

    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const receiverId = conversation.participantIds.find(id => id !== user.id);
    if (!receiverId) throw new Error('Receiver not found');

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: Message = {
      id: messageId,
      conversationId,
      senderId: user.id,
      receiverId,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
      isDelivered: true,
      attachments,
    };

    const conversationMessages = messages[conversationId] || [];
    const updatedMessages = [...conversationMessages, newMessage];
    await saveMessages(conversationId, updatedMessages);

    // Update conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: newMessage,
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    });
    await saveConversations(updatedConversations);

    return messageId;
  }, [user, conversations, messages, saveMessages, saveConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    const conversationMessages = messages[conversationId] || [];
    const updatedMessages = conversationMessages.map(msg => {
      if (msg.receiverId === user.id && !msg.isRead) {
        return { ...msg, isRead: true };
      }
      return msg;
    });

    await saveMessages(conversationId, updatedMessages);

    // Update unread count
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });
    await saveConversations(updatedConversations);
  }, [user, conversations, messages, saveMessages, saveConversations]);

  const getConversationMessages = useCallback((conversationId: string): Message[] => {
    return messages[conversationId] || [];
  }, [messages]);

  const getContact = useCallback((userId: string): Contact | undefined => {
    return contacts.find(contact => contact.id === userId);
  }, [contacts]);

  const getTotalUnreadCount = useCallback((): number => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }, [conversations]);

  return useMemo(() => ({
    conversations,
    messages,
    contacts,
    isLoading,
    createConversation,
    sendMessage,
    markAsRead,
    getConversationMessages,
    getContact,
    getTotalUnreadCount,
  }), [
    conversations,
    messages,
    contacts,
    isLoading,
    createConversation,
    sendMessage,
    markAsRead,
    getConversationMessages,
    getContact,
    getTotalUnreadCount,
  ]);
});