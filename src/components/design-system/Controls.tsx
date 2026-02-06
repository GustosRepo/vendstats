import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, shadows } from '../../theme';

interface SegmentedControlProps {
  options: Array<{ label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * SegmentedControl - Toggle between options
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <View
      className="flex-row rounded-2xl p-1"
      style={{
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radius.lg,
      }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
          style={{
            backgroundColor:
              value === option.value ? colors.surface : 'transparent',
            ...(value === option.value ? shadows.sm : {}),
            borderRadius: radius.md,
          }}
        >
          {option.icon && (
            <Ionicons
              name={option.icon}
              size={16}
              color={value === option.value ? colors.primary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              typography.label,
              {
                color:
                  value === option.value
                    ? colors.textPrimary
                    : colors.textSecondary,
              },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Badge - Small status indicator
 */
interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variants = {
    default: {
      bg: colors.surfaceSecondary,
      text: colors.textSecondary,
    },
    primary: {
      bg: colors.primaryLight,
      text: colors.primary,
    },
    success: {
      bg: colors.successLight,
      text: colors.success,
    },
    danger: {
      bg: colors.dangerLight,
      text: colors.danger,
    },
    warning: {
      bg: colors.warningLight,
      text: colors.warning,
    },
  };

  const style = variants[variant];

  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: style.bg }}
    >
      <Text style={[typography.labelSmall, { color: style.text }]}>
        {label}
      </Text>
    </View>
  );
};

/**
 * IconButton - Circular icon button
 */
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
}) => {
  const variants = {
    default: {
      bg: colors.surface,
      icon: colors.textPrimary,
    },
    primary: {
      bg: colors.primary,
      icon: '#FFFFFF',
    },
    danger: {
      bg: colors.dangerLight,
      icon: colors.danger,
    },
  };

  const sizes = {
    sm: { container: 32, icon: 16 },
    md: { container: 40, icon: 20 },
    lg: { container: 48, icon: 24 },
  };

  const style = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center rounded-full"
      style={{
        width: sizeStyle.container,
        height: sizeStyle.container,
        backgroundColor: style.bg,
        ...shadows.sm,
      }}
    >
      <Ionicons name={icon} size={sizeStyle.icon} color={style.icon} />
    </TouchableOpacity>
  );
};

/**
 * Chip - Selectable tag/filter
 */
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  leftIcon,
}) => {
  const content = (
    <View
      className="flex-row items-center px-4 py-2 rounded-full border"
      style={{
        backgroundColor: selected ? colors.primaryLight : colors.surface,
        borderColor: selected ? colors.primary : colors.border,
        borderWidth: 1,
      }}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={14}
          color={selected ? colors.primary : colors.textSecondary}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        style={[
          typography.label,
          { color: selected ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};
