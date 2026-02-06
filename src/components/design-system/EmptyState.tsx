import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radius } from '../../theme';
import { PrimaryButton } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  compact?: boolean;
}

/**
 * EmptyState - Premium empty state component
 * Never shows generic "No data" - always intentional messaging
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
  compact = false,
}) => {
  if (compact) {
    return (
      <View className="items-center py-8 px-4">
        <View
          className="w-14 h-14 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text
          style={[typography.h4, { color: colors.textPrimary }]}
          className="text-center"
        >
          {title}
        </Text>
        <Text
          style={[typography.bodySmall, { color: colors.textSecondary }]}
          className="text-center mt-1"
        >
          {subtitle}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            className="mt-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[typography.label, { color: colors.primary }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{
          backgroundColor: colors.primaryLight,
          ...shadows.sm,
        }}
      >
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text
        style={[typography.h2, { color: colors.textPrimary }]}
        className="text-center"
      >
        {title}
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textSecondary, maxWidth: 280 },
        ]}
        className="text-center mt-2"
      >
        {subtitle}
      </Text>
      {action && (
        <View className="mt-8 w-full max-w-xs">
          <PrimaryButton
            title={action.label}
            onPress={action.onPress}
            icon="add-circle-outline"
          />
        </View>
      )}
    </View>
  );
};
