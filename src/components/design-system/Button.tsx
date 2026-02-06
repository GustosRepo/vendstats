import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
}

/**
 * PrimaryButton - Main CTA button with accent color
 */
export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const iconSizes = { sm: 16, md: 18, lg: 20 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-full ${
        fullWidth ? 'w-full' : ''
      }`}
      style={[
        sizeStyles[size],
        {
          backgroundColor: isDisabled ? '#9CA3AF' : colors.primary,
          ...shadows.md,
        },
        style,
      ]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              typography.h4,
              { color: '#FFFFFF', fontWeight: '600' },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * SecondaryButton - Subtle surface button with border
 */
export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const iconSizes = { sm: 16, md: 18, lg: 20 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-full border ${
        fullWidth ? 'w-full' : ''
      }`}
      style={[
        sizeStyles[size],
        {
          backgroundColor: colors.surface,
          borderColor: isDisabled ? '#E5E7EB' : colors.border,
          borderWidth: 1.5,
        },
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color={isDisabled ? '#9CA3AF' : colors.textPrimary}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              typography.h4,
              {
                color: isDisabled ? '#9CA3AF' : colors.textPrimary,
                fontWeight: '600',
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color={isDisabled ? '#9CA3AF' : colors.textPrimary}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * TextButton - Minimal text-only button
 */
export const TextButton: React.FC<{
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}> = ({ title, onPress, color = colors.primary, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text
        style={[
          typography.label,
          { color: disabled ? colors.textTertiary : color },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
