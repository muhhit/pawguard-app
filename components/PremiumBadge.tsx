import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  size = 'small', 
  showText = false,
  style 
}) => {
  const sizeConfig = {
    small: {
      containerSize: 16,
      iconSize: 10,
      fontSize: 8,
      borderRadius: 8,
    },
    medium: {
      containerSize: 20,
      iconSize: 12,
      fontSize: 10,
      borderRadius: 10,
    },
    large: {
      containerSize: 24,
      iconSize: 14,
      fontSize: 12,
      borderRadius: 12,
    },
  };

  const config = sizeConfig[size];

  if (showText) {
    return (
      <View style={[styles.textBadge, style]}>
        <Crown size={config.iconSize} color="#FFD700" fill="#FFD700" />
        <Text style={[styles.textBadgeText, { fontSize: config.fontSize }]}>Premium</Text>
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.iconBadge, 
        {
          width: config.containerSize,
          height: config.containerSize,
          borderRadius: config.borderRadius,
        },
        style
      ]}
    >
      <Crown size={config.iconSize} color="#FFD700" fill="#FFD700" />
    </View>
  );
};

const styles = StyleSheet.create({
  iconBadge: {
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  textBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    gap: 4,
  },
  textBadgeText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default PremiumBadge;