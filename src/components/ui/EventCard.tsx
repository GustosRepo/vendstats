import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { colors, radius, shadows } from '../../theme';

interface EventCardProps {
  name: string;
  date: string;
  revenue: number;
  profit: number;
  salesCount: number;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = React.memo(({
  name,
  date,
  revenue,
  profit,
  salesCount,
  onPress,
}) => {
  const isProfitable = profit >= 0;
  const formattedDate = formatDate(new Date(date), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formattedDate}, ${formatCurrency(profit)} profit`}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: 16,
        marginBottom: 12,
        ...shadows.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
            {name}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
            {formattedDate}
          </Text>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: isProfitable ? colors.growth : colors.danger }}>
            {formatCurrency(profit)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>profit</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Revenue</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
            {formatCurrency(revenue)}
          </Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Sales</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>
            {salesCount} items
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

EventCard.displayName = 'EventCard';
