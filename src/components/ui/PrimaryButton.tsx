import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { colors, radius } from '../../theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, { container: ViewStyle; disabledContainer: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    disabledContainer: { backgroundColor: colors.primary + '80' },
    text: { color: '#FFFFFF' },
  },
  secondary: {
    container: { backgroundColor: colors.background },
    disabledContainer: { backgroundColor: colors.background },
    text: { color: colors.textPrimary },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    disabledContainer: { backgroundColor: colors.danger + '80' },
    text: { color: '#FFFFFF' },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    disabledContainer: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
};

const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.md },
    text: { fontSize: 14 },
  },
  md: {
    container: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl },
    text: { fontSize: 16 },
  },
  lg: {
    container: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: radius.xl },
    text: { fontSize: 18 },
  },
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  ...props
}) => {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        isDisabled ? vs.disabledContainer : vs.container,
        ss.container,
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.textTertiary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              vs.text,
              ss.text,
              { fontWeight: '600' },
              icon ? { marginLeft: 8 } : undefined,
              isDisabled ? { opacity: 0.6 } : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
