import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
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
    ? colors.danger
    : isFocused
    ? colors.primary
    : colors.divider;

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 8 }}>
          {label}
        </Text>
      )}
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: 12 }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            { flex: 1, fontSize: 16, color: colors.textPrimary },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={{ marginLeft: 12 }}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={{ fontSize: 14, color: colors.danger, marginTop: 4 }}>
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
          {helperText}
        </Text>
      )}
    </View>
  );
};
