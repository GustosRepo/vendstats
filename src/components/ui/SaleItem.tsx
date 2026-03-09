import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currency';
import { colors, radius } from '../../theme';

interface SaleItemProps {
  itemName: string;
  quantity: number;
  salePrice: number;
  costPerItem: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const SaleItem: React.FC<SaleItemProps> = React.memo(({
  itemName,
  quantity,
  salePrice,
  costPerItem,
  onPress,
  onLongPress,
}) => {
  const { t } = useTranslation();
  const revenue = quantity * salePrice;
  const profit = revenue - (quantity * costPerItem);
  const isProfitable = profit >= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${itemName}, ${t('saleItem.quantityAt', { qty: quantity, price: formatCurrency(salePrice) })}, ${formatCurrency(revenue)}`}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.divider,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textPrimary }} numberOfLines={1}>
            {itemName}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary }}>
            {t('saleItem.quantityAt', { qty: quantity, price: formatCurrency(salePrice) })}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
            {formatCurrency(revenue)}
          </Text>
          <Text style={{ fontSize: 12, color: isProfitable ? colors.growth : colors.danger }}>
            {isProfitable ? '+' : ''}{formatCurrency(profit)} {t('saleItem.profit')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

SaleItem.displayName = 'SaleItem';
