import { Tabs, router } from "expo-router";
import { Home, Trophy, User, AlertTriangle, Map } from "lucide-react-native";
import React, { useEffect } from "react";

import { useAuth } from "@/hooks/auth-store";
import { glassColors } from "@/constants/colors";
import { t } from "@/constants/translations";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: glassColors.turkish.red,
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
          textShadowColor: 'rgba(0, 0, 0, 0.1)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          borderRadius: 16,
          marginHorizontal: 4,
        },
        tabBarActiveBackgroundColor: 'rgba(227, 10, 23, 0.1)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Home 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report-pet"
        options={{
          title: t('tabs.reportPet'),
          tabBarIcon: ({ color, focused }) => (
            <AlertTriangle 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="hero-board"
        options={{
          title: t('tabs.heroes'),
          tabBarIcon: ({ color, focused }) => (
            <Trophy 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color, focused }) => (
            <Map 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <User 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      
      {/* Hide unused tabs */}
      <Tabs.Screen name="health" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="messaging" options={{ href: null }} />
      <Tabs.Screen name="tracking" options={{ href: null }} />
    </Tabs>
  );
}