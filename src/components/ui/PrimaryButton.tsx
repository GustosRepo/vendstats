import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: {
    container: 'bg-blue-500 active:bg-blue-600',
    text: 'text-white',
    disabled: 'bg-blue-300',
  },
  secondary: {
    container: 'bg-neutral-100 active:bg-neutral-200',
    text: 'text-neutral-900',
    disabled: 'bg-neutral-100',
  },
  danger: {
    container: 'bg-red-500 active:bg-red-600',
    text: 'text-white',
    disabled: 'bg-red-300',
  },
  ghost: {
    container: 'bg-transparent active:bg-neutral-100',
    text: 'text-blue-500',
    disabled: 'bg-transparent',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-4 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-6 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-8 py-4 rounded-xl',
    text: 'text-lg',
  },
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        ${isDisabled ? styles.disabled : styles.container}
        ${sizes.container}
        flex-row items-center justify-center
        ${className}
      `}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#525252'}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`
              ${styles.text}
              ${sizes.text}
              font-semibold
              ${icon ? 'ml-2' : ''}
              ${isDisabled ? 'opacity-60' : ''}
            `}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
