import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { EmptyState } from '../../../components';
import { PressableScale, AnimatedListItem } from '../../../components/animations';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { getEventsSortedByDate, getSalesByEventId } from '../../../storage';
import { calculateEventStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { Event, EventStats } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

// Event Card - Clean executive style
const EventCard: React.FC<{
  name: string;
  date: string;
  location?: string;
  revenue: number;
  profit: number;
  salesCount: number;
  onPress: () => void;
  index: number;
}> = ({ name, date, location, revenue, profit, salesCount, onPress, index }) => {
  const { t } = useTranslation();
  return (
  <AnimatedListItem index={index} type="slideUp">
    <PressableScale
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: 20,
        marginBottom: 12,
        ...shadows.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 4 }}>{date}</Text>
          {location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>{location}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
      
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
            {t('common.revenue')}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{formatCurrency(revenue)}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
            {t('common.profit')}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: profit >= 0 ? colors.growth : colors.danger }}>
            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
            {t('common.sales')}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{salesCount}</Text>
        </View>
      </View>
    </PressableScale>
  </AnimatedListItem>
  );
};

export const EventsScreen: React.FC<TabScreenProps<'Events'>> = ({ navigation }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, EventStats>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(() => {
    const allEvents = getEventsSortedByDate();
    // Pre-compute stats for all events once instead of per-render-item
    const computed: Record<string, EventStats> = {};
    for (const event of allEvents) {
      const sales = getSalesByEventId(event.id);
      computed[event.id] = calculateEventStats(event, sales);
    }
    setEvents(allEvents);
    setStatsMap(computed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const renderEventItem = useCallback(({ item, index }: { item: Event; index: number }) => {
    const stats = statsMap[item.id];

    return (
      <EventCard
        name={item.name}
        date={item.date}
        location={item.location}
        revenue={stats?.totalRevenue ?? 0}
        profit={stats?.netProfit ?? 0}
        salesCount={stats?.salesCount ?? 0}
        onPress={() => handleEventPress(item.id)}
        index={index}
      />
    );
  }, [statsMap]);

  const eventsCount = events.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>{t('events.title')}</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
              {t('events.eventsTracked', { count: eventsCount })}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleCreateEvent}
            style={[{
              backgroundColor: colors.primary,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }, shadows.sm]}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Events List */}
      {events.length === 0 ? (
        <EmptyState
          title={t('events.noEventsYet')}
          message={t('events.noEventsMessage')}
          actionLabel={t('events.createEvent')}
          onAction={handleCreateEvent}
          icon={<Image source={MascotImages.celebrate} style={{ width: 120, height: 120 }} resizeMode="contain" />}
        />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
};
