import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { Apple, ArrowRight, Heart, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SlideUpTransition } from '@/components/PageTransition';



export default function AuthScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { isAuthenticated, isLoading: authLoading, signIn, signUp } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, authLoading]);

  const canUseApple = useMemo(() => Platform.OS === 'ios', []);

  if (isAuthenticated) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      
      // For demo purposes, create a test user with Google-like email
      const testEmail = `google.user.${Date.now()}@gmail.com`;
      const testPassword = 'googlepassword123';
      
      console.log('Creating demo Google user:', testEmail);
      
      // Always create a new account for Google sign-in demo
      const result = await signUp(testEmail, testPassword, 'Google Kullanıcısı');
      
      if (result.error) {
        Alert.alert('Hata', result.error);
        return;
      }
      
      console.log('Google sign in successful');
      
    } catch (e: any) {
      console.error('Google sign in error:', e);
      Alert.alert('Hata', 'Google ile giriş şu anda kullanılamıyor. Lütfen e-posta ile deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAppleSignIn = async () => {
    try {
      setIsSubmitting(true);
      
      // For demo purposes, create a test user with Apple-like email
      const testEmail = `apple.user.${Date.now()}@icloud.com`;
      const testPassword = 'applepassword123';
      
      console.log('Creating demo Apple user:', testEmail);
      
      // Always create a new account for Apple sign-in demo
      const result = await signUp(testEmail, testPassword, 'Apple Kullanıcısı');
      
      if (result.error) {
        Alert.alert('Hata', result.error);
        return;
      }
      
      console.log('Apple sign in successful');
      
    } catch (e: any) {
      console.error('Apple sign in error:', e);
      Alert.alert('Hata', 'Apple ile giriş şu anda kullanılamıyor. Lütfen e-posta ile deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEmailAuth = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta girin');
      return;
    }
    
    if (!password || password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    if (!isLogin && (!name || name.trim().length < 2)) {
      Alert.alert('Hata', 'Lütfen adınızı girin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name.trim());
      }
      
      if (result.error) {
        Alert.alert('Hata', result.error);
        return;
      }
      
      console.log('Email auth successful');
      
    } catch (e: any) {
      console.error('Email auth error:', e);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SlideUpTransition duration={400}>
      <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#C44569', '#F8B500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
              
              {/* Hero Section */}
              <View style={styles.hero}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoBackground}>
                    <Text style={styles.logoEmoji}>🐾</Text>
                  </View>
                  <Sparkles color="#FFE55C" size={24} style={styles.sparkle1} />
                  <Heart color="#FF8A95" size={20} style={styles.sparkle2} />
                </View>
                <Text style={styles.brand}>Patililer</Text>
                <Text style={styles.tagline}>Evcil dostlarının sosyal medyası</Text>
                <Text style={styles.subtitle}>Sevimli dostlarınla bağlantıda kal! 🐕🐱</Text>
              </View>

              {/* Auth Form */}
              <View style={styles.formContainer}>
                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, isLogin && styles.activeTab]}
                    onPress={() => setIsLogin(true)}
                  >
                    <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Giriş Yap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, !isLogin && styles.activeTab]}
                    onPress={() => setIsLogin(false)}
                  >
                    <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Kayıt Ol</Text>
                  </TouchableOpacity>
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity
                    testID="continue-google"
                    style={styles.socialButton}
                    onPress={handleGoogleSignIn}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.png' }}
                      style={styles.socialIcon}
                    />
                    <Text style={styles.socialButtonText}>Google ile devam et</Text>
                  </TouchableOpacity>

                  {canUseApple && (
                    <TouchableOpacity
                      testID="continue-apple"
                      style={[styles.socialButton, styles.appleButton]}
                      onPress={handleAppleSignIn}
                      disabled={isSubmitting}
                      activeOpacity={0.8}
                    >
                      <Apple color="#FFFFFF" size={20} style={styles.socialIcon} />
                      <Text style={[styles.socialButtonText, styles.appleButtonText]}>Apple ile devam et</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>veya</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Email Form */}
                <View style={styles.formFields}>
                  {!isLogin && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Ad Soyad</Text>
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Adınızı girin"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={styles.input}
                        autoCapitalize="words"
                      />
                    </View>
                  )}
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-posta</Text>
                    <TextInput
                      testID="email-input"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="E-posta adresinizi girin"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Şifre</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Şifrenizi girin"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>

                  <TouchableOpacity
                    testID="auth-submit"
                    style={styles.submitButton}
                    onPress={handleEmailAuth}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} style={styles.submitIcon} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.legal}>
                  Devam ederek{' '}
                  <Text style={styles.legalLink}>kullanım koşullarımızı</Text>
                  {' '}ve{' '}
                  <Text style={styles.legalLink}>gizlilik politikamızı</Text>
                  {' '}kabul etmiş olursunuz.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
      </View>
    </SlideUpTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: {
    fontSize: 36,
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -10,
  },
  brand: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  socialContainer: {
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  formFields: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  submitButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  submitButtonText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '700',
  },
  submitIcon: {
    marginLeft: 8,
  },
  legal: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});