import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon && (
        <View className="mb-4 opacity-40">
          {icon}
        </View>
      )}
      
      <Text className="text-xl font-semibold text-neutral-800 text-center mb-2">
        {title}
      </Text>
      
      <Text className="text-base text-neutral-500 text-center mb-6">
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-blue-500 px-6 py-3 rounded-xl active:bg-blue-600"
        >
          <Text className="text-white font-semibold text-base">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
