import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/currency';

interface SaleItemProps {
  itemName: string;
  quantity: number;
  salePrice: number;
  costPerItem: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const SaleItem: React.FC<SaleItemProps> = ({
  itemName,
  quantity,
  salePrice,
  costPerItem,
  onPress,
  onLongPress,
}) => {
  const revenue = quantity * salePrice;
  const profit = revenue - (quantity * costPerItem);
  const isProfitable = profit >= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="bg-white rounded-lg p-3 mb-2 border border-neutral-100 active:bg-neutral-50"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-3">
          <Text className="text-base font-medium text-neutral-900" numberOfLines={1}>
            {itemName}
          </Text>
          <Text className="text-sm text-neutral-500">
            {quantity}x @ {formatCurrency(salePrice)} each
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-base font-semibold text-neutral-900">
            {formatCurrency(revenue)}
          </Text>
          <Text className={`text-xs ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
            {isProfitable ? '+' : ''}{formatCurrency(profit)} profit
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
