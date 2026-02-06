import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * ListRow - Consistent list item component
 * Use for all list-based content (events, sales, settings, etc.)
 */
export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  value,
  valueColor = colors.textPrimary,
  leftIcon,
  leftIconColor = colors.primary,
  showChevron = true,
  onPress,
  disabled = false,
  compact = false,
}) => {
  const content = (
    <View
      className={`flex-row items-center ${compact ? 'py-3' : 'py-4'}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {/* Left Icon */}
      {leftIcon && (
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${leftIconColor}15` }}
        >
          <Ionicons name={leftIcon} size={20} color={leftIconColor} />
        </View>
      )}

      {/* Title & Subtitle */}
      <View className="flex-1">
        <Text
          style={[typography.body, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[typography.bodySmall, { color: colors.textSecondary }]}
            numberOfLines={1}
            className="mt-0.5"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Value */}
      {value && (
        <Text
          style={[typography.h4, { color: valueColor }]}
          className="ml-3"
        >
          {value}
        </Text>
      )}

      {/* Chevron */}
      {showChevron && onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textTertiary}
          style={{ marginLeft: 8 }}
        />
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

/**
 * ListDivider - Consistent list divider
 */
export const ListDivider: React.FC<{ inset?: boolean }> = ({ inset = false }) => {
  return (
    <View
      className="h-px"
      style={{
        backgroundColor: colors.divider,
        marginLeft: inset ? 52 : 0,
      }}
    />
  );
};

/**
 * ListSection - Section header for grouped lists
 */
export const ListSection: React.FC<{
  title: string;
  action?: { label: string; onPress: () => void };
}> = ({ title, action }) => {
  return (
    <View className="flex-row items-center justify-between py-2 mt-4 mb-1">
      <Text
        style={[typography.labelSmall, { color: colors.textSecondary }]}
        className="uppercase tracking-wide"
      >
        {title}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[typography.labelSmall, { color: colors.primary }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
