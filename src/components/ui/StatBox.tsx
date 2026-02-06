import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../../utils/currency';

interface StatBoxProps {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  variant?: 'default' | 'profit' | 'loss' | 'revenue' | 'expense';
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

const variantStyles = {
  default: {
    container: 'bg-neutral-50',
    value: 'text-neutral-900',
  },
  profit: {
    container: 'bg-green-50',
    value: 'text-green-600',
  },
  loss: {
    container: 'bg-red-50',
    value: 'text-red-600',
  },
  revenue: {
    container: 'bg-blue-50',
    value: 'text-blue-600',
  },
  expense: {
    container: 'bg-amber-50',
    value: 'text-amber-600',
  },
};

const sizeStyles = {
  sm: {
    container: 'p-3',
    value: 'text-xl',
    label: 'text-xs',
  },
  md: {
    container: 'p-4',
    value: 'text-2xl',
    label: 'text-sm',
  },
  lg: {
    container: 'p-5',
    value: 'text-4xl',
    label: 'text-base',
  },
};

export const StatBox: React.FC<StatBoxProps> = ({
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

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <View className={`${styles.container} ${sizes.container} rounded-xl`}>
      <Text className={`${sizes.label} text-neutral-500 font-medium mb-1`}>
        {label}
      </Text>
      <Text className={`${sizes.value} ${styles.value} font-bold`}>
        {displayValue}
      </Text>
      {subtitle && (
        <Text className="text-xs text-neutral-400 mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
};
