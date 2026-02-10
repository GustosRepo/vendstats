import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface QuickSaleButtonProps {
  itemName: string;
  price: number;
  onPress: () => void;
  imageUri?: string;
  stockCount?: number;
}

export const QuickSaleButton: React.FC<QuickSaleButtonProps> = ({
  itemName,
  price,
  onPress,
  imageUri,
  stockCount,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: 100,
        height: 130,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        overflow: 'hidden',
      }}
    >
      {/* Image or Placeholder */}
      <View style={{ flex: 1, backgroundColor: imageUri ? undefined : colors.copper + '15' }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={28} color={colors.copper} />
          </View>
        )}
        
        {/* Stock badge */}
        {stockCount !== undefined && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: stockCount > 0 ? colors.primary : colors.error,
              paddingHorizontal: 5,
              paddingVertical: 1,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '600' }}>
              {stockCount}
            </Text>
          </View>
        )}
      </View>
      
      {/* Label */}
      <View style={{ 
        padding: 6, 
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
      }}>
        <Text 
          style={{ 
            color: colors.success, 
            fontWeight: '700', 
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          ${price.toFixed(0)}
        </Text>
        <Text 
          style={{ 
            color: colors.textSecondary, 
            fontSize: 10,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {itemName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
