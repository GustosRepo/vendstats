import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../../theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

/**
 * InputField - Consistent text input component
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const hasError = !!error;

  return (
    <View className="mb-4">
      {label && (
        <Text
          style={[
            typography.label,
            { color: colors.textSecondary, marginBottom: 8 },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center bg-white rounded-2xl border px-4"
        style={{
          borderColor: hasError ? colors.danger : colors.border,
          borderWidth: 1.5,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
        }}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.textTertiary}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={[
            typography.body,
            {
              flex: 1,
              paddingVertical: 14,
              color: colors.textPrimary,
            },
            style,
          ]}
          {...props}
        />
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.textTertiary}
            onPress={onRightIconPress}
            style={{ marginLeft: 12 }}
          />
        )}
      </View>
      {hasError && (
        <Text
          style={[
            typography.bodySmall,
            { color: colors.danger, marginTop: 6 },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

/**
 * CurrencyInput - Specialized input for currency values
 */
export const CurrencyInput: React.FC<InputFieldProps & { currency?: string }> = ({
  currency = '$',
  ...props
}) => {
  return (
    <View className="mb-4">
      {props.label && (
        <Text
          style={[
            typography.label,
            { color: colors.textSecondary, marginBottom: 8 },
          ]}
        >
          {props.label}
        </Text>
      )}
      <View
        className="flex-row items-center bg-white rounded-2xl border px-4"
        style={{
          borderColor: colors.border,
          borderWidth: 1.5,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={[typography.h3, { color: colors.textTertiary, marginRight: 4 }]}
        >
          {currency}
        </Text>
        <TextInput
          placeholderTextColor={colors.textTertiary}
          keyboardType="decimal-pad"
          style={[
            typography.h3,
            {
              flex: 1,
              paddingVertical: 14,
              color: colors.textPrimary,
            },
          ]}
          {...props}
        />
      </View>
    </View>
  );
};
