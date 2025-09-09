import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Neighborhood } from '@/constants/neighborhoods';

// Mock types for authentication without Supabase
interface MockUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  email_confirmed_at?: string;
  neighborhood?: Neighborhood;
}

interface MockSession {
  user: MockUser;
  access_token: string;
  expires_at: number;
}

export interface LocationPrivacySettings {
  location_privacy_level: 'strict' | 'moderate' | 'open';
  show_exact_to_finders: boolean;
  custom_fuzzing_radius: number;
}

export interface AuthState {
  user: MockUser | null;
  session: MockSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  locationPrivacy: LocationPrivacySettings;
}

export interface AuthActions {
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (name?: string, phone?: string, neighborhood?: Neighborhood) => Promise<{ error: string | null }>;
  updateLocationPrivacy: (settings: Partial<LocationPrivacySettings>) => Promise<{ error: string | null }>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [locationPrivacy, setLocationPrivacy] = useState<LocationPrivacySettings>({
    location_privacy_level: 'moderate',
    show_exact_to_finders: true,
    custom_fuzzing_radius: 500, // 500 meters default
  });

  const initialize = useCallback(async () => {
    if (initialized) return;
    
    try {
      console.log('Initializing mock auth system...');
      
      // Try to load saved session from AsyncStorage
      const savedSession = await AsyncStorage.getItem('mock_session');
      if (savedSession) {
        const parsedSession: MockSession = JSON.parse(savedSession);
        
        // Check if session is still valid (not expired)
        if (parsedSession.expires_at > Date.now()) {
          console.log('Restored session for:', parsedSession.user.email);
          setSession(parsedSession);
          setUser(parsedSession.user);
        } else {
          console.log('Session expired, clearing...');
          await AsyncStorage.removeItem('mock_session');
        }
      }
      
      setInitialized(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setInitialized(true);
      setIsLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const createMockSession = async (user: MockUser): Promise<MockSession> => {
    const session: MockSession = {
      user,
      access_token: `mock_token_${Date.now()}`,
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };
    
    // Save session to AsyncStorage
    await AsyncStorage.setItem('mock_session', JSON.stringify(session));
    
    return session;
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem('mock_session');
    setSession(null);
    setUser(null);
  };

  const signUp = useCallback(async (email: string, password: string, name?: string, phone?: string) => {
    try {
      setIsLoading(true);
      console.log('Mock sign up for:', email);
      
      // Validate input
      if (!email || !password) {
        return { error: 'Lütfen e-posta ve şifre girin.' };
      }
      
      const trimmedEmail = email.toLowerCase().trim();
      
      // Basic email validation
      if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
        return { error: 'Lütfen geçerli bir e-posta adresi girin.' };
      }
      
      if (password.length < 6) {
        return { error: 'Şifre en az 6 karakter olmalıdır.' };
      }
      
      // Check if user already exists in AsyncStorage
      const existingUsers = await AsyncStorage.getItem('mock_users');
      const users: MockUser[] = existingUsers ? JSON.parse(existingUsers) : [];
      
      const existingUser = users.find(u => u.email === trimmedEmail);
      if (existingUser) {
        // For Google/Apple sign-in, if user exists, just sign them in
        if (email.includes('google.user.') || email.includes('apple.user.')) {
          console.log('Existing social user found, signing in:', trimmedEmail);
          const session = await createMockSession(existingUser);
          setUser(existingUser);
          setSession(session);
          return { error: null };
        }
        return { error: 'Bu e-posta adresi ile zaten bir hesap var. Lütfen giriş yapın.' };
      }
      
      // Create new user
      const newUser: MockUser = {
        id: `user_${Date.now()}`,
        email: trimmedEmail,
        name: name?.trim(),
        phone: phone?.trim(),
        email_confirmed_at: new Date().toISOString(),
      };
      
      // Save user to AsyncStorage
      users.push(newUser);
      await AsyncStorage.setItem('mock_users', JSON.stringify(users));
      
      // Create session
      const session = await createMockSession(newUser);
      
      setUser(newUser);
      setSession(session);
      
      console.log('Mock sign up successful for:', newUser.email);
      return { error: null };
    } catch (error) {
      console.error('Mock sign up error:', error);
      return { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Mock sign in for:', email);
      
      // Validate input
      if (!email || !password) {
        return { error: 'Lütfen e-posta ve şifre girin.' };
      }
      
      const trimmedEmail = email.toLowerCase().trim();
      
      // Basic email validation
      if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
        return { error: 'Lütfen geçerli bir e-posta adresi girin.' };
      }
      
      // Check if user exists in AsyncStorage
      const existingUsers = await AsyncStorage.getItem('mock_users');
      const users: MockUser[] = existingUsers ? JSON.parse(existingUsers) : [];
      
      let existingUser = users.find(u => u.email === trimmedEmail);
      
      // If user doesn't exist, create them automatically for demo purposes
      if (!existingUser) {
        console.log('User not found, creating new user for demo:', trimmedEmail);
        existingUser = {
          id: `user_${Date.now()}`,
          email: trimmedEmail,
          name: trimmedEmail.split('@')[0],
          email_confirmed_at: new Date().toISOString(),
        };
        
        // Save new user
        users.push(existingUser);
        await AsyncStorage.setItem('mock_users', JSON.stringify(users));
      }
      
      // For demo purposes, accept any password for existing users
      // In a real app, you would verify the password hash
      
      // Create session
      const session = await createMockSession(existingUser);
      
      setUser(existingUser);
      setSession(session);
      
      console.log('Mock sign in successful for:', existingUser.email);
      return { error: null };
    } catch (error) {
      console.error('Mock sign in error:', error);
      return { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Mock sign out');
      await clearSession();
    } catch (error) {
      console.error('Mock sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      console.log('Mock password reset for:', email);
      
      // Validate email
      const trimmedEmail = email.toLowerCase().trim();
      if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
        return { error: 'Lütfen geçerli bir e-posta adresi girin.' };
      }
      
      // Check if user exists
      const existingUsers = await AsyncStorage.getItem('mock_users');
      const users: MockUser[] = existingUsers ? JSON.parse(existingUsers) : [];
      
      const existingUser = users.find(u => u.email === trimmedEmail);
      if (!existingUser) {
        return { error: 'Bu e-posta adresi ile kayıtlı hesap bulunamadı.' };
      }
      
      console.log('Mock password reset email sent to:', email);
      return { error: null };
    } catch (error) {
      console.error('Mock password reset error:', error);
      return { error: 'Beklenmeyen bir hata oluştu.' };
    }
  }, []);

  const updateProfile = useCallback(async (name?: string, phone?: string, neighborhood?: Neighborhood) => {
    try {
      if (!user) return { error: 'No user logged in' };

      // Update user data locally
      const updatedUser: MockUser = {
        ...user,
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(neighborhood !== undefined && { neighborhood }),
      };

      // Update users in AsyncStorage
      const existingUsers = await AsyncStorage.getItem('mock_users');
      const users: MockUser[] = existingUsers ? JSON.parse(existingUsers) : [];
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem('mock_users', JSON.stringify(users));
      }

      // Update session
      if (session) {
        const updatedSession = {
          ...session,
          user: updatedUser,
        };
        await AsyncStorage.setItem('mock_session', JSON.stringify(updatedSession));
        setSession(updatedSession);
      }

      setUser(updatedUser);
      console.log('Profile updated successfully:', updatedUser);
      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error?.message || error);
      return { error: 'Profil güncellenirken bir hata oluştu' };
    }
  }, [user, session]);

  const updateLocationPrivacy = useCallback(async (settings: Partial<LocationPrivacySettings>) => {
    try {
      if (!user) return { error: 'No user logged in' };

      const updatedSettings = { ...locationPrivacy, ...settings };
      
      // Mock successful update since backend is not enabled
      console.log('Backend not enabled, simulating location privacy update');
      
      setLocationPrivacy(updatedSettings);
      console.log('Location privacy settings updated:', updatedSettings);
      return { error: null };
    } catch (error: any) {
      console.error('Update location privacy error:', error?.message || error);
      return { error: 'An unexpected error occurred' };
    }
  }, [user, locationPrivacy]);



  const authState = useMemo(() => {
    const state = {
      user,
      session,
      isLoading,
      isAuthenticated: !!user && !!session,
      initialized,
      initialize,
      locationPrivacy,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      updateLocationPrivacy,
    };
    
    console.log('Mock auth state updated:', {
      hasUser: !!user,
      hasSession: !!session,
      isAuthenticated: state.isAuthenticated,
      isLoading,
      initialized,
      userEmail: user?.email
    });
    
    return state;
  }, [user, session, isLoading, initialized, initialize, locationPrivacy, signUp, signIn, signOut, resetPassword, updateProfile, updateLocationPrivacy]);
  
  return authState;
});