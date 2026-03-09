import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { getAllEvents, getAllSales } from '../../../storage';
import { calculateEventStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { Event, EventStats } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

interface RankedEvent {
  event: Event;
  stats: EventStats;
}

type SortMode = 'best' | 'worst';

export const EventRankingScreen: React.FC<RootStackScreenProps<'EventRanking'>> = ({ navigation }) => {
  const { t } = useTranslation();
  const [rankedEvents, setRankedEvents] = useState<RankedEvent[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    const events = getAllEvents();
    const sales = getAllSales();
    const ranked = events.map(event => ({
      event,
      stats: calculateEventStats(event, sales.filter(s => s.eventId === event.id)),
    }));
    setRankedEvents(ranked);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  }, [loadData]);

  const sorted = [...rankedEvents].sort((a, b) =>
    sortMode === 'best'
      ? b.stats.netProfit - a.stats.netProfit
      : a.stats.netProfit - b.stats.netProfit
  );

  // Summary stats
  const profitable = rankedEvents.filter(e => e.stats.netProfit >= 0).length;
  const unprofitable = rankedEvents.length - profitable;
  const avgProfit = rankedEvents.length > 0
    ? rankedEvents.reduce((sum, e) => sum + e.stats.netProfit, 0) / rankedEvents.length
    : 0;

  const getMedalIcon = (index: number): string | null => {
    if (sortMode !== 'best') return null;
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Summary Row */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingTop: 16, marginBottom: 16 }}>
          <View style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, alignItems: 'center' }, shadows.sm]}>
            <Ionicons name="trending-up" size={20} color={colors.growth} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.growth, marginTop: 4 }}>{profitable}</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('ranking.profitable')}</Text>
          </View>
          <View style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, alignItems: 'center' }, shadows.sm]}>
            <Ionicons name="trending-down" size={20} color={colors.danger} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.danger, marginTop: 4 }}>{unprofitable}</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('ranking.unprofitable')}</Text>
          </View>
          <View style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, alignItems: 'center' }, shadows.sm]}>
            <Ionicons name="stats-chart" size={20} color={colors.copper} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: avgProfit >= 0 ? colors.growth : colors.danger, marginTop: 4 }}>{formatCurrency(avgProfit)}</Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{t('ranking.avgProfit')}</Text>
          </View>
        </View>

        {/* Sort Toggle */}
        <View style={{ flexDirection: 'row', marginHorizontal: 24, marginBottom: 16, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4 }}>
          {(['best', 'worst'] as SortMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => setSortMode(mode)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: radius.md,
                backgroundColor: sortMode === mode ? (mode === 'best' ? colors.primary : colors.danger) : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: sortMode === mode ? '#FFFFFF' : colors.textTertiary,
              }}>
                {mode === 'best' ? t('ranking.bestFirst') : t('ranking.worstFirst')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Event List */}
        <View style={{ paddingHorizontal: 24 }}>
          {sorted.map((item, index) => {
            const { event, stats } = item;
            const isProfitable = stats.netProfit >= 0;
            const medal = getMedalIcon(index);

            return (
              <TouchableOpacity
                key={event.id}
                onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                style={[{
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  padding: 16,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: isProfitable ? colors.growth : colors.danger,
                }, shadows.sm]}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  {/* Rank */}
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: medal ? 'transparent' : (isProfitable ? colors.growth + '15' : colors.danger + '15'),
                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                  }}>
                    {medal ? (
                      <Text style={{ fontSize: 20 }}>{medal}</Text>
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isProfitable ? colors.growth : colors.danger }}>
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Name & Date */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                      {event.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
                      {formatDate(new Date(event.date), 'MMM d, yyyy')}
                      {event.location ? ` · ${event.location}` : ''}
                    </Text>
                  </View>

                  {/* Profit */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: isProfitable ? colors.growth : colors.danger }}>
                      {formatCurrency(stats.netProfit)}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
                      {stats.profitMargin >= 0 ? '+' : ''}{stats.profitMargin.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Stat chips */}
                <View style={{ flexDirection: 'row', gap: 8, marginLeft: 44 }}>
                  <View style={{ backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      💰 {formatCurrency(stats.totalRevenue)}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      📦 {stats.salesCount} {t('ranking.items')}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      🏷️ {formatCurrency(stats.totalExpenses)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {sorted.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="podium-outline" size={48} color={colors.textMuted} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginTop: 16 }}>
                {t('ranking.noEvents')}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4, textAlign: 'center' }}>
                {t('ranking.noEventsMessage')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
