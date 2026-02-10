import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { EmptyState } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { getEventsSortedByDate, getSalesByEventId, getEventsCount } from '../../../storage';
import { hasPremiumAccess, hasCreatedFirstEvent } from '../../../storage';
import { calculateEventStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { Event } from '../../../types';
import { FREE_TIER_LIMITS } from '../../../constants';
import { colors, shadows, radius } from '../../../theme';

// Event Card - Clean executive style
const EventCard: React.FC<{
  name: string;
  date: string;
  revenue: number;
  profit: number;
  salesCount: number;
  onPress: () => void;
}> = ({ name, date, revenue, profit, salesCount, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[{
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: 20,
      marginBottom: 12,
    }, shadows.sm]}
    activeOpacity={0.7}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>{name}</Text>
        <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 4 }}>{date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </View>
    
    <View style={{ flexDirection: 'row', gap: 24 }}>
      <View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
          Revenue
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{formatCurrency(revenue)}</Text>
      </View>
      <View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
          Profit
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: profit >= 0 ? colors.growth : colors.danger }}>
          {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
          Sales
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{salesCount}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const EventsScreen: React.FC<TabScreenProps<'Events'>> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(() => {
    const allEvents = getEventsSortedByDate();
    setEvents(allEvents);
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
    const eventCount = getEventsCount();
    const isPremium = hasPremiumAccess();

    if (eventCount >= FREE_TIER_LIMITS.MAX_EVENTS && !isPremium && hasCreatedFirstEvent()) {
      navigation.navigate('Paywall');
      return;
    }

    navigation.navigate('CreateEvent');
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const sales = getSalesByEventId(item.id);
    const stats = calculateEventStats(item, sales);

    return (
      <EventCard
        name={item.name}
        date={item.date}
        revenue={stats.totalRevenue}
        profit={stats.netProfit}
        salesCount={stats.salesCount}
        onPress={() => handleEventPress(item.id)}
      />
    );
  };

  const eventsCount = events.length;
  const isPremium = hasPremiumAccess();
  const remainingFreeEvents = Math.max(0, FREE_TIER_LIMITS.MAX_EVENTS - eventsCount);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>Events</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
              {eventsCount} event{eventsCount !== 1 ? 's' : ''} tracked
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

        {/* Free tier indicator */}
        {!isPremium && eventsCount > 0 && (
          <View style={{ 
            marginTop: 16, 
            backgroundColor: colors.surface, 
            borderRadius: radius.md, 
            paddingHorizontal: 16, 
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Free tier: {remainingFreeEvents} event{remainingFreeEvents !== 1 ? 's' : ''} remaining
            </Text>
          </View>
        )}
      </View>

      {/* Events List */}
      {events.length === 0 ? (
        <EmptyState
          title="No Events Yet"
          message="Create your first event to start tracking revenue and profit from your pop-up sales."
          actionLabel="Create Event"
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
