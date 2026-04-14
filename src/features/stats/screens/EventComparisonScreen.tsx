import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getAllEvents, getAllSales } from '../../../storage';
import { calculateEventStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { Event, EventStats } from '../../../types';
import { colors } from '../../../theme';

interface EventWithStats {
  event: Event;
  stats: EventStats;
}

export const EventComparisonScreen: React.FC<RootStackScreenProps<'EventComparison'>> = () => {
  const { t } = useTranslation();
  const [allEvents, setAllEvents] = useState<EventWithStats[]>([]);
  const [eventA, setEventA] = useState<EventWithStats | null>(null);
  const [eventB, setEventB] = useState<EventWithStats | null>(null);
  const [showPicker, setShowPicker] = useState<'A' | 'B' | null>(null);

  useFocusEffect(
    useCallback(() => {
      const events = getAllEvents();
      const sales = getAllSales();
      // Build sales-by-event map once instead of filtering per event
      const salesByEvent: Record<string, typeof sales> = {};
      for (const sale of sales) {
        if (!salesByEvent[sale.eventId]) salesByEvent[sale.eventId] = [];
        salesByEvent[sale.eventId].push(sale);
      }
      const withStats = events
        .map(event => ({
          event,
          stats: calculateEventStats(event, salesByEvent[event.id] || []),
        }))
        .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
      setAllEvents(withStats);
      
      // Auto-select first two events
      if (withStats.length >= 2 && !eventA && !eventB) {
        setEventA(withStats[0]);
        setEventB(withStats[1]);
      } else if (withStats.length === 1 && !eventA) {
        setEventA(withStats[0]);
      }
    }, [])
  );

  const selectEvent = (selected: EventWithStats) => {
    if (showPicker === 'A') setEventA(selected);
    else if (showPicker === 'B') setEventB(selected);
    setShowPicker(null);
  };

  const renderComparisonRow = (
    label: string,
    valueA: number,
    valueB: number,
    isCurrency: boolean = false,
    higherIsBetter: boolean = true,
  ) => {
    const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
    const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
    const tied = valueA === valueB;

    return (
      <View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 15, fontWeight: '700',
            color: tied ? colors.textPrimary : aWins ? colors.growth : colors.textSecondary,
          }}>
            {isCurrency ? formatCurrency(valueA) : (valueA ?? 0).toFixed(1)}
          </Text>
          {aWins && !tied && <Ionicons name="trophy" size={12} color={colors.growth} style={{ marginTop: 2 }} />}
        </View>
        <View style={{ width: 100, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>{label}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 15, fontWeight: '700',
            color: tied ? colors.textPrimary : bWins ? colors.growth : colors.textSecondary,
          }}>
            {isCurrency ? formatCurrency(valueB) : (valueB ?? 0).toFixed(1)}
          </Text>
          {bWins && !tied && <Ionicons name="trophy" size={12} color={colors.growth} style={{ marginTop: 2 }} />}
        </View>
      </View>
    );
  };

  const renderEventPicker = (slot: 'A' | 'B', selected: EventWithStats | null) => (
    <TouchableOpacity
      onPress={() => setShowPicker(slot)}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.divider,
        borderStyle: selected ? 'solid' : 'dashed',
        alignItems: 'center',
      }}
    >
      {selected ? (
        <>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }} numberOfLines={2}>
            {selected.event.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
            {formatDate(new Date(selected.event.date), 'MMM d, yyyy')}
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            {t('comparison.selectEvent')}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  const renderPickerItem = useCallback(({ item }: { item: EventWithStats }) => {
    const isSelected = 
      (showPicker === 'A' && eventB?.event.id === item.event.id) ||
      (showPicker === 'B' && eventA?.event.id === item.event.id);
    
    return (
      <TouchableOpacity
        onPress={() => !isSelected && selectEvent(item)}
        style={{
          backgroundColor: isSelected ? colors.divider : colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 10,
          opacity: isSelected ? 0.5 : 1,
          borderWidth: 1,
          borderColor: colors.divider,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
          {item.event.name}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 6, gap: 16 }}>
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            {formatDate(new Date(item.event.date), 'MMM d, yyyy')}
          </Text>
          <Text style={{ fontSize: 12, color: colors.growth, fontWeight: '600' }}>
            {formatCurrency(item.stats.netProfit)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {item.stats.salesCount} {t('common.sales').toLowerCase()}
          </Text>
        </View>
        {isSelected && (
          <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4, fontStyle: 'italic' }}>
            {t('comparison.alreadySelected')}
          </Text>
        )}
      </TouchableOpacity>
    );
  }, [showPicker, eventA, eventB, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Selectors */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {renderEventPicker('A', eventA)}
          <View style={{ justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textTertiary }}>vs</Text>
          </View>
          {renderEventPicker('B', eventB)}
        </View>

        {/* Comparison Table */}
        {eventA && eventB ? (
          <Card variant="elevated" padding="md">
            {/* Header */}
            <View style={{ flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: colors.divider }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }} numberOfLines={1}>
                  {eventA.event.name}
                </Text>
              </View>
              <View style={{ width: 100, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary }}>{t('comparison.metric')}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }} numberOfLines={1}>
                  {eventB.event.name}
                </Text>
              </View>
            </View>

            {renderComparisonRow(t('common.revenue'), eventA.stats.totalRevenue, eventB.stats.totalRevenue, true)}
            {renderComparisonRow(t('common.profit'), eventA.stats.netProfit, eventB.stats.netProfit, true)}
            {renderComparisonRow(t('comparison.grossProfit'), eventA.stats.grossProfit, eventB.stats.grossProfit, true)}
            {renderComparisonRow(t('eventDetail.expenses'), eventA.stats.totalExpenses, eventB.stats.totalExpenses, true, false)}
            {renderComparisonRow(t('eventDetail.costOfGoods'), eventA.stats.totalCostOfGoods, eventB.stats.totalCostOfGoods, true, false)}
            {renderComparisonRow(t('eventDetail.itemsSold'), eventA.stats.salesCount, eventB.stats.salesCount)}
            {renderComparisonRow(t('comparison.profitMargin'), eventA.stats.profitMargin, eventB.stats.profitMargin)}

            {/* Winner Summary */}
            <View style={{ paddingTop: 16, alignItems: 'center' }}>
              {eventA.stats.netProfit > eventB.stats.netProfit ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="trophy" size={18} color={colors.growth} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.growth }}>
                    {t('comparison.winner', { name: eventA.event.name })}
                  </Text>
                </View>
              ) : eventB.stats.netProfit > eventA.stats.netProfit ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="trophy" size={18} color={colors.growth} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.growth }}>
                    {t('comparison.winner', { name: eventB.event.name })}
                  </Text>
                </View>
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                  {t('comparison.tied')}
                </Text>
              )}
              {eventA.stats.netProfit !== eventB.stats.netProfit && (
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                  {t('comparison.profitDifference', { amount: formatCurrency(Math.abs(eventA.stats.netProfit - eventB.stats.netProfit)) })}
                </Text>
              )}
            </View>
          </Card>
        ) : (
          <Card variant="outlined" padding="lg">
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="git-compare-outline" size={48} color={colors.textMuted} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginTop: 12 }}>
                {t('comparison.selectTwo')}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4, textAlign: 'center' }}>
                {t('comparison.selectTwoMessage')}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Event Picker Modal */}
      <Modal visible={showPicker !== null} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
              {t('comparison.pickEvent')}
            </Text>
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={allEvents}
            keyExtractor={item => item.event.id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={renderPickerItem}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ color: colors.textTertiary }}>{t('comparison.noEvents')}</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
