import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotifications } from '@/hooks/notification-store';
import NotificationCenter from './NotificationCenter';

interface NotificationBellProps {
  size?: number;
  color?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  size = 24, 
  color = '#FFFFFF' 
}) => {
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowNotificationCenter(true)}
        testID="notification-bell"
      >
        <Bell size={size} color={color} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationCenter
        visible={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NotificationBell;