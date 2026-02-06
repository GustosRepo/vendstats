import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuickSaleButtonProps {
  itemName: string;
  price: number;
  onPress: () => void;
}

export const QuickSaleButton: React.FC<QuickSaleButtonProps> = ({
  itemName,
  price,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-50 rounded-xl p-4 items-center justify-center min-w-[100px] active:bg-blue-100"
    >
      <Text className="text-blue-600 font-bold text-lg mb-1">
        ${price.toFixed(0)}
      </Text>
      <Text className="text-blue-800 text-sm font-medium text-center" numberOfLines={1}>
        {itemName}
      </Text>
    </TouchableOpacity>
  );
};
