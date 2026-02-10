import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { EmptyState } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { getAllEvents, getAllSales } from '../../../storage';
import { calculateGlobalStats, getRevenueOverTime, getTopSellingProducts, getProfitByEvent } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { GlobalStats } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

// Hero Metric Card
const HeroMetricCard: React.FC<{
  label: string;
  value: string;
  positive?: boolean;
}> = ({ label, value, positive }) => (
  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, alignItems: 'center' }, shadows.md]}>
    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 40, fontWeight: '700', color: positive !== undefined ? (positive ? colors.growth : colors.danger) : colors.textPrimary, letterSpacing: -1 }}>
      {value}
    </Text>
  </View>
);

// Stat Card
const StatCard: React.FC<{
  label: string;
  value: string;
  growth?: string;
}> = ({ label, value, growth }) => (
  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
      {label}
    </Text>
    <View>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>{value}</Text>
      {growth && (
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.growth, marginTop: 4 }}>{growth}</Text>
      )}
    </View>
  </View>
);

// Insight Row
const InsightRow: React.FC<{ icon: keyof typeof Ionicons.glyphMap; text: string; isLast?: boolean }> = ({ icon, text, isLast }) => (
  <View style={{ 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: colors.divider,
  }}>
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <Text style={{ fontSize: 15, color: colors.textSecondary, flex: 1, lineHeight: 22 }}>{text}</Text>
  </View>
);

export const GlobalStatsScreen: React.FC<TabScreenProps<'Stats'>> = ({ navigation }) => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);
  const [revenueData, setRevenueData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([]);
  const [eventProfits, setEventProfits] = useState<{ name: string; profit: number; revenue: number }[]>([]);

  const screenWidth = Dimensions.get('window').width - 48;

  const loadStats = useCallback(() => {
    const events = getAllEvents();
    const sales = getAllSales();
    
    setHasEvents(events.length > 0);
    
    if (events.length > 0) {
      const globalStats = calculateGlobalStats(events, sales);
      setStats(globalStats);
      
      // Chart data
      setRevenueData(getRevenueOverTime(sales, 30));
      setTopProducts(getTopSellingProducts(sales, 5));
      setEventProfits(getProfitByEvent(events, sales));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats();
    setRefreshing(false);
  }, [loadStats]);

  if (!hasEvents) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <TexturePattern />
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>Statistics</Text>
        </View>
        <EmptyState
          title="No Stats Yet"
          message="Create events and log sales to see your global statistics."
          actionLabel="Create Event"
          onAction={() => navigation.navigate('CreateEvent')}
          icon={<Image source={MascotImages.phone} style={{ width: 120, height: 120 }} resizeMode="contain" />}
        />
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textTertiary }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const isProfitable = stats.totalProfit >= 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>Statistics</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            Across {stats.totalEvents} event{stats.totalEvents !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          {/* Hero - Total Profit */}
          <View style={{ marginBottom: 16 }}>
            <HeroMetricCard 
              label="Total Profit" 
              value={formatCurrency(stats.totalProfit)} 
              positive={isProfitable}
            />
          </View>

          {/* Revenue Card */}
          <View style={{ marginBottom: 16 }}>
            <StatCard 
              label="Total Revenue" 
              value={formatCurrency(stats.totalRevenue)}
              growth="+12.5%"
            />
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  Avg / Event
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: stats.averageProfitPerEvent >= 0 ? colors.growth : colors.danger }}>
                  {formatCurrency(stats.averageProfitPerEvent)}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  Events
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{stats.totalEvents}</Text>
              </View>
            </View>
          </View>

          {/* Most Profitable Event */}
          {stats.mostProfitableEvent && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                Top Performer
              </Text>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                      {stats.mostProfitableEvent.eventName}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: colors.growth }}>
                    {formatCurrency(stats.mostProfitableEvent.profit)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Insights */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              Insights
            </Text>
            <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: 20 }, shadows.sm]}>
              <InsightRow 
                icon="wallet-outline" 
                text={`Total revenue of ${formatCurrency(stats.totalRevenue)} across all events`}
              />
              <InsightRow 
                icon="trending-up-outline" 
                text={`Average profit of ${formatCurrency(stats.averageProfitPerEvent)} per event`}
              />
              {stats.mostProfitableEvent && (
                <InsightRow 
                  icon="trophy-outline" 
                  text={`Best performer: "${stats.mostProfitableEvent.eventName}"`}
                  isLast
                />
              )}
            </View>
          </View>

          {/* Revenue Over Time Chart */}
          {revenueData.data.some(d => d > 0) && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                Revenue This Week
              </Text>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, overflow: 'hidden' }, shadows.sm]}>
                <LineChart
                  data={{
                    labels: revenueData.labels,
                    datasets: [{ data: revenueData.data.map(d => d || 0) }],
                  }}
                  width={screenWidth - 32}
                  height={180}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(27, 67, 50, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: colors.primary,
                    },
                  }}
                  bezier
                  style={{ marginLeft: -8, borderRadius: 16 }}
                />
              </View>
            </View>
          )}

          {/* Top Selling Products Chart */}
          {topProducts.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                Top Selling Products
              </Text>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 }, shadows.sm]}>
                {topProducts.map((product, index) => (
                  <View 
                    key={product.name} 
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      paddingVertical: 12,
                      borderBottomWidth: index < topProducts.length - 1 ? 1 : 0,
                      borderBottomColor: colors.divider,
                    }}
                  >
                    <View style={{ 
                      width: 28, height: 28, borderRadius: 14, 
                      backgroundColor: index === 0 ? colors.copper + '20' : colors.divider, 
                      alignItems: 'center', justifyContent: 'center', marginRight: 12 
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: index === 0 ? colors.copper : colors.textSecondary }}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {product.quantity} sold
                      </Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.growth }}>
                      {formatCurrency(product.revenue)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Profit By Event Chart */}
          {eventProfits.length > 1 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                Profit By Event
              </Text>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, overflow: 'hidden' }, shadows.sm]}>
                <BarChart
                  data={{
                    labels: eventProfits.slice(0, 5).map(e => e.name),
                    datasets: [{ data: eventProfits.slice(0, 5).map(e => Math.max(0, e.profit)) }],
                  }}
                  width={screenWidth - 32}
                  height={200}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(184, 115, 51, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: { borderRadius: 16 },
                    barPercentage: 0.6,
                  }}
                  style={{ marginLeft: -8, borderRadius: 16 }}
                  showValuesOnTopOfBars
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
