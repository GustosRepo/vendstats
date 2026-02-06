import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  rightActions?: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }>;
  large?: boolean;
}

/**
 * AppHeader - Consistent header component
 * Supports title, subtitle, and action buttons
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions,
  large = false,
}) => {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      {/* Left Section */}
      <View className="flex-row items-center flex-1">
        {leftAction && (
          <TouchableOpacity
            onPress={leftAction.onPress}
            className="w-10 h-10 items-center justify-center -ml-2 mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={leftAction.icon}
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text
            style={large ? typography.h1 : typography.h3}
            className="text-[#0B0D10]"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={typography.bodySmall}
              className="text-[#6B7280] mt-0.5"
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right Actions */}
      {rightActions && rightActions.length > 0 && (
        <View className="flex-row items-center gap-1">
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              className="w-10 h-10 items-center justify-center rounded-full bg-white"
              style={{
                shadowColor: colors.textPrimary,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Ionicons
                name={action.icon}
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
