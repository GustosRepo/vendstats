import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getAllEvents, getAllSales } from '../../../storage';
import { getItemAnalysis } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme';

type SortBy = 'quantity' | 'revenue' | 'profit' | 'margin';

export const BestSellersScreen: React.FC<RootStackScreenProps<'BestSellers'>> = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ReturnType<typeof getItemAnalysis>>([]);
  const [sortBy, setSortBy] = useState<SortBy>('quantity');

  useFocusEffect(
    useCallback(() => {
      const events = getAllEvents();
      const sales = getAllSales();
      const analysis = getItemAnalysis(events, sales);
      setItems(analysis);
    }, [])
  );

  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    switch (sortBy) {
      case 'quantity': return b.totalQuantity - a.totalQuantity;
      case 'revenue': return b.totalRevenue - a.totalRevenue;
      case 'profit': return b.totalProfit - a.totalProfit;
      case 'margin': return b.profitMargin - a.profitMargin;
      default: return 0;
    }
  }), [items, sortBy]);

  const sortOptions: { key: SortBy; label: string }[] = [
    { key: 'quantity', label: t('bestSellers.sortQuantity') },
    { key: 'revenue', label: t('bestSellers.sortRevenue') },
    { key: 'profit', label: t('bestSellers.sortProfit') },
    { key: 'margin', label: t('bestSellers.sortMargin') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sort Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {sortOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSortBy(opt.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: sortBy === opt.key ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: sortBy === opt.key ? colors.primary : colors.divider,
              }}
            >
              <Text style={{ 
                fontSize: 13, 
                fontWeight: '600', 
                color: sortBy === opt.key ? '#fff' : colors.textSecondary 
              }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary */}
        {items.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Card variant="elevated" padding="md" className="flex-1">
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('bestSellers.totalItems')}
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginTop: 4 }}>
                {items.length}
              </Text>
            </Card>
            <Card variant="elevated" padding="md" className="flex-1">
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('bestSellers.totalSold')}
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginTop: 4 }}>
                {items.reduce((sum, i) => sum + i.totalQuantity, 0)}
              </Text>
            </Card>
          </View>
        )}

        {/* Item List */}
        {sortedItems.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginTop: 12 }}>
                {t('bestSellers.noData')}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4, textAlign: 'center' }}>
                {t('bestSellers.noDataMessage')}
              </Text>
            </View>
          </Card>
        ) : (
          sortedItems.map((item, index) => (
            <Card key={item.name} variant="outlined" padding="md" className="mb-3">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Rank Badge */}
                <View style={{ 
                  width: 32, height: 32, borderRadius: 16, 
                  backgroundColor: index < 3 ? colors.primary + '15' : colors.divider,
                  justifyContent: 'center', alignItems: 'center', marginRight: 12 
                }}>
                  <Text style={{ 
                    fontSize: 14, fontWeight: '700', 
                    color: index < 3 ? colors.primary : colors.textTertiary 
                  }}>
                    {index + 1}
                  </Text>
                </View>

                {/* Item Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
                    {t('bestSellers.itemDetail', { events: item.eventsCount, avg: item.avgPerEvent })}
                  </Text>
                </View>

                {/* Primary Stat */}
                <View style={{ alignItems: 'flex-end' }}>
                  {sortBy === 'quantity' && (
                    <>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                        {item.totalQuantity}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('bestSellers.unitsSold')}</Text>
                    </>
                  )}
                  {sortBy === 'revenue' && (
                    <>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                        {formatCurrency(item.totalRevenue)}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('common.revenue')}</Text>
                    </>
                  )}
                  {sortBy === 'profit' && (
                    <>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: item.totalProfit >= 0 ? colors.growth : colors.danger }}>
                        {formatCurrency(item.totalProfit)}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('common.profit')}</Text>
                    </>
                  )}
                  {sortBy === 'margin' && (
                    <>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: item.profitMargin >= 50 ? colors.growth : item.profitMargin >= 20 ? colors.warning : colors.danger }}>
                        {item.profitMargin.toFixed(0)}%
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('bestSellers.margin')}</Text>
                    </>
                  )}
                </View>
              </View>

              {/* Stats Row */}
              <View style={{ flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.divider }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('bestSellers.qty')}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>{item.totalQuantity}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('common.revenue')}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>{formatCurrency(item.totalRevenue)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('common.profit')}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: item.totalProfit >= 0 ? colors.growth : colors.danger }}>{formatCurrency(item.totalProfit)}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary }}>{t('bestSellers.margin')}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>{item.profitMargin.toFixed(0)}%</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
