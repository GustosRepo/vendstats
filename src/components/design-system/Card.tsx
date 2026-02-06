import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, typography, shadows, radius } from '../../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

interface CardHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Card - Base card component with consistent styling
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  noPadding = false,
}) => {
  return (
    <View
      className="bg-white rounded-3xl"
      style={[
        {
          borderRadius: radius['2xl'],
          backgroundColor: colors.surface,
          ...shadows.md,
        },
        !noPadding && { padding: 20 },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/**
 * CardHeader - Optional header row for cards
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ title, action }) => {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text style={[typography.h4, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[typography.label, { color: colors.primary }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * CardDivider - Horizontal divider for card sections
 */
export const CardDivider: React.FC = () => {
  return (
    <View
      className="h-px my-4"
      style={{ backgroundColor: colors.divider }}
    />
  );
};
