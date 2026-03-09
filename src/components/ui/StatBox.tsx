import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../../utils/currency';
import { colors, radius } from '../../theme';

interface StatBoxProps {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  variant?: 'default' | 'profit' | 'loss' | 'revenue' | 'expense';
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

const variantStyles = {
  default: { bg: colors.background, text: colors.textPrimary },
  profit: { bg: '#f0fdf4', text: colors.growth },
  loss: { bg: '#fef2f2', text: colors.danger },
  revenue: { bg: '#eff6ff', text: '#2563eb' },
  expense: { bg: '#fffbeb', text: '#d97706' },
};

const sizeStyles = {
  sm: { padding: 12, valueSize: 20, labelSize: 12 },
  md: { padding: 16, valueSize: 24, labelSize: 14 },
  lg: { padding: 20, valueSize: 36, labelSize: 16 },
};

export const StatBox: React.FC<StatBoxProps> = React.memo(({
  label,
  value,
  isCurrency = false,
  variant = 'default',
  size = 'md',
  subtitle,
}) => {
  const displayValue = isCurrency && typeof value === 'number' 
    ? formatCurrency(value) 
    : value.toString();

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <View
      style={{ backgroundColor: vs.bg, padding: ss.padding, borderRadius: radius.xl }}
      accessible={true}
      accessibilityLabel={`${label}: ${displayValue}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <Text style={{ fontSize: ss.labelSize, fontWeight: '500', color: colors.textTertiary, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: ss.valueSize, fontWeight: '700', color: vs.text }}>
        {displayValue}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
});

StatBox.displayName = 'StatBox';
