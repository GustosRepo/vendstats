import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

interface EventCardProps {
  name: string;
  date: string;
  revenue: number;
  profit: number;
  salesCount: number;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  name,
  date,
  revenue,
  profit,
  salesCount,
  onPress,
}) => {
  const isProfitable = profit >= 0;
  const formattedDate = format(new Date(date), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-sm mb-3 active:bg-neutral-50"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <Text className="text-lg font-semibold text-neutral-900" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-sm text-neutral-500 mt-0.5">
            {formattedDate}
          </Text>
        </View>
        
        <View className="items-end">
          <Text className={`text-xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
            {formatCurrency(profit)}
          </Text>
          <Text className="text-xs text-neutral-400">profit</Text>
        </View>
      </View>

      <View className="flex-row">
        <View className="flex-1">
          <Text className="text-xs text-neutral-400">Revenue</Text>
          <Text className="text-sm font-medium text-neutral-700">
            {formatCurrency(revenue)}
          </Text>
        </View>
        
        <View className="flex-1">
          <Text className="text-xs text-neutral-400">Sales</Text>
          <Text className="text-sm font-medium text-neutral-700">
            {salesCount} items
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
