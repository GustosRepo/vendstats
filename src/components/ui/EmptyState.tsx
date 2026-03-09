import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../theme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}>
      {icon && (
        <View style={{ marginBottom: 16, opacity: 0.4 }}>
          {icon}
        </View>
      )}
      
      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
        {title}
      </Text>
      
      <Text style={{ fontSize: 16, color: colors.textTertiary, textAlign: 'center', marginBottom: 24 }}>
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
