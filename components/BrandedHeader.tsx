import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { glassColors } from '@/constants/colors';
import { AppIcon } from './AppIcon';
import { ChevronLeft, Bell } from 'lucide-react-native';

interface BrandedHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  rightComponent?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'glass';
}

export default function BrandedHeader({
  title,
  showBackButton = false,
  showNotifications = true,
  onBackPress,
  onNotificationPress,
  rightComponent,
  variant = 'default',
}: BrandedHeaderProps) {
  const insets = useSafeAreaInsets();

  const renderContent = () => (
    <View style={[styles.content, { paddingTop: insets.top + 10 }]}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
            testID="back-button"
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <AppIcon size={40} />
        )}
      </View>

      <View style={styles.centerSection}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <Text style={styles.brandTitle}>PawGuard</Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightComponent || (
          showNotifications && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
              testID="notification-button"
            >
              <Bell size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  if (variant === 'glass') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(227, 10, 23, 0.9)', 'rgba(255, 71, 87, 0.8)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glassOverlay} />
        {renderContent()}
      </View>
    );
  }

  if (variant === 'transparent') {
    return (
      <View style={[styles.container, styles.transparent]}>
        {renderContent()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={glassColors.gradients.turkish as any}
        style={StyleSheet.absoluteFill}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: glassColors.turkish.red,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export { BrandedHeader };