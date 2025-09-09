import React from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface OfflineModeProps {
  style?: any;
}

export const OfflineMode: React.FC<OfflineModeProps> = ({ style }) => {
  const networkState = useNetworkStatus();
  const [slideAnim] = React.useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      // Show offline banner
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Hide offline banner
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [networkState.isConnected, networkState.isInternetReachable, slideAnim]);

  if (!isVisible && networkState.isConnected && networkState.isInternetReachable) {
    return null;
  }

  const isOffline = !networkState.isConnected || !networkState.isInternetReachable;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: isOffline ? '#FF6B6B' : '#4ECDC4',
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {isOffline ? (
          <WifiOff size={16} color="white" />
        ) : (
          <Wifi size={16} color="white" />
        )}
        <Text style={styles.text}>
          {isOffline
            ? 'No internet connection'
            : 'Connection restored'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});