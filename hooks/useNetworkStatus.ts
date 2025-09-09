import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, use navigator.onLine
      const updateOnlineStatus = () => {
        setNetworkState({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
          type: 'wifi',
        });
      };

      updateOnlineStatus();
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    } else {
      // For mobile, simulate network detection with periodic checks
      // In a real app, you would install @react-native-community/netinfo
      const checkNetworkStatus = async () => {
        try {
          // Try to fetch a small resource to test connectivity
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch('https://httpbin.org/status/200', {
            method: 'HEAD',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          setNetworkState({
            isConnected: response.ok,
            isInternetReachable: response.ok,
            type: 'cellular',
          });
        } catch (error) {
          console.log('Network check failed:', error);
          setNetworkState({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
          });
        }
      };

      // Initial check
      checkNetworkStatus();
      
      // Check every 30 seconds
      const interval = setInterval(checkNetworkStatus, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  return networkState;
};