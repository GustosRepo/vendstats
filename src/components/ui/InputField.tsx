import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? 'border-red-500'
    : isFocused
    ? 'border-blue-500'
    : 'border-neutral-200';

  return (
    <View className={`${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}
      
      <View
        className={`
          flex-row items-center
          bg-white rounded-xl border
          ${borderColor}
          px-4 py-3
        `}
      >
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          className={`
            flex-1 text-base text-neutral-900
            ${className}
          `}
          placeholderTextColor="#a3a3a3"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            className="ml-3"
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-sm text-red-500 mt-1">
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text className="text-sm text-neutral-400 mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
};
