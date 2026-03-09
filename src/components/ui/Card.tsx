import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = { none: 0, sm: 12, md: 16, lg: 24 };

const variantMap: Record<string, ViewStyle> = {
  default: { backgroundColor: colors.surface, borderRadius: radius.xl },
  elevated: { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadows.sm },
  outlined: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.divider },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  ...props
}) => {
  return (
    <View
      style={[variantMap[variant], { padding: paddingMap[padding] }, style as ViewStyle]}
      {...props}
    >
      {children}
    </View>
  );
};
