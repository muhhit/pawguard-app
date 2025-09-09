import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/hooks/auth-store";
import { PetProvider } from "@/hooks/pet-store";
import { LocationProvider } from "@/hooks/location-store";
import { NotificationProvider } from "@/hooks/notification-store";
import { RewardProvider } from "@/hooks/reward-store";
import { ReferralProvider } from "@/hooks/referral-store";
import { GamificationProvider } from "@/hooks/gamification-store";
import { CommunityProvider } from "@/hooks/community-store";
import { EventsProvider } from "@/hooks/events-store";
import { MessagingProvider } from "@/hooks/messaging-store";
import { LanguageProvider } from "@/hooks/language-store";
import { PremiumProvider } from "@/hooks/premium-store";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineMode } from "@/components/OfflineMode";
import { RescueProvider } from "@/hooks/rescue-store";
import { ReportProvider } from "@/hooks/report-store";
import { MatchProvider } from "@/hooks/match-store";
import { initMonitoring } from "@/utils/monitoring";

// React 19 compatibility fix
if (Platform.OS !== 'web') {
  // Suppress encoding warnings in development
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('utf-16le') || args[0]?.includes?.('ErrorUtils')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}



SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: 1000,
    },
  },
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Deep link handler: pawguard://pet/<id>
  useEffect(() => {
    const handleUrl = (url?: string | null) => {
      if (!url) return;
      try {
        const m = url.match(/pawguard:\/\/pet\/(.+)/);
        if (m && m[1]) {
          router.push(`/pet-details?id=${encodeURIComponent(m[1])}`);
        }
      } catch {}
    };
    Linking.getInitialURL().then(handleUrl).catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [router]);

  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        animation: 'fade_from_bottom',
        animationDuration: 350,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animationTypeForReplace: 'push',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
        headerShadowVisible: false,
        headerTintColor: '#1a1a1a',
      }}
    >
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-pet" options={{ 
        presentation: "modal", 
        title: "Add Pet",
        animation: 'slide_from_bottom',
        animationDuration: 400,
        headerStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
        }
      }} />
      <Stack.Screen name="pet-details" options={{ 
        title: "Pet Details",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="safe-zones" options={{ 
        title: "Safe Zones",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="reward-claims" options={{ 
        title: "Reward Claims",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="ai-features" options={{ 
        title: "AI Features",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="notification-demo" options={{ headerShown: false }} />
      <Stack.Screen name="messaging" options={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="conversations" options={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="premium-subscription" options={{ 
        headerShown: false,
        presentation: "modal",
        animation: 'slide_from_bottom',
        animationDuration: 400
      }} />
      <Stack.Screen name="error-handling-demo" options={{ title: "Error Handling Demo" }} />
      <Stack.Screen name="offline-mode-demo" options={{ title: "Offline Mode Demo" }} />
      <Stack.Screen name="gamified-profile" options={{ 
        title: "Gamified Profile",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="ai-pet-scanner" options={{ 
        title: "AI Pet Scanner",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="real-time-map-demo" options={{ 
        title: "Real-time Map",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="success-stories" options={{ 
        title: "Success Stories",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="brandify" options={{ 
        title: "Brand Card",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="rescue-channel" options={{ 
        title: "Rescue Channel",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="tos" options={{ title: 'Kullanım Şartları' }} />
      <Stack.Screen name="privacy" options={{ title: 'Gizlilik Politikası' }} />
      <Stack.Screen name="poster" options={{ title: 'Poster' }} />
      <Stack.Screen name="collage" options={{ title: 'UGC Kolaj' }} />
      <Stack.Screen name="matchmaking" options={{ title: 'Paw Match' }} />
      <Stack.Screen name="conversation" options={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
      <Stack.Screen name="navigation-test" options={{ 
        title: "Navigation Test",
        animation: 'slide_from_right',
        animationDuration: 300
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initMonitoring();
    // Add a small delay to ensure all modules are loaded
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(error => {
        console.log('Error hiding splash screen:', error);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Add global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: any) => {
      console.log('Unhandled promise rejection, continuing');
      // Prevent the default behavior (which would crash the app)
      if (event?.preventDefault) {
        event.preventDefault();
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <PremiumProvider>
            <AuthProvider>
            <ReferralProvider>
              <GamificationProvider>
                <CommunityProvider>
                  <PetProvider>
                    <EventsProvider>
                      <RewardProvider>
                        <LocationProvider>
                          <NotificationProvider>
                            <MessagingProvider>
                              <ReportProvider>
                                <RescueProvider>
                                  <MatchProvider>
                                    <GestureHandlerRootView style={{ flex: 1 }}>
                                      <RootLayoutNav />
                                      <OfflineMode />
                                    </GestureHandlerRootView>
                                  </MatchProvider>
                                </RescueProvider>
                              </ReportProvider>
                            </MessagingProvider>
                          </NotificationProvider>
                        </LocationProvider>
                      </RewardProvider>
                    </EventsProvider>
                  </PetProvider>
                </CommunityProvider>
              </GamificationProvider>
            </ReferralProvider>
            </AuthProvider>
          </PremiumProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
