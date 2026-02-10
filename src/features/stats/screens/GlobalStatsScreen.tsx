import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { EmptyState } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { getAllEvents, getAllSales } from '../../../storage';
import { calculateGlobalStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { GlobalStats } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

// Executive line chart - minimal
const ExecutiveChart: React.FC<{ data: number[]; height?: number; showGrowth?: boolean }> = ({ data, height = 100, showGrowth }) => {
  const width = Dimensions.get('window').width - 88;
  const padding = { top: 16, bottom: 16, left: 4, right: 4 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (data.length < 2) return null;

  const minValue = Math.min(...data) * 0.9;
  const maxValue = Math.max(...data) * 1.05;
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => ({
    x: padding.left + (index / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight,
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const tension = 0.3;
    const cp1x = prev.x + (curr.x - prev.x) * tension;
    const cp2x = curr.x - (curr.x - prev.x) * tension;
    pathD += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Path d={areaD} fill={showGrowth ? colors.growthLight : colors.chartFill} />
      <Path d={pathD} stroke={showGrowth ? colors.growth : colors.chartLine} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={colors.surface} stroke={showGrowth ? colors.growth : colors.chartLine} strokeWidth={2} />
    </Svg>
  );
};

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
  data?: number[];
}> = ({ label, value, growth, data }) => (
  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
      {label}
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>{value}</Text>
        {growth && (
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.growth, marginTop: 4 }}>{growth}</Text>
        )}
      </View>
      {data && data.length >= 2 && (
        <View style={{ marginLeft: 8 }}>
          <ExecutiveChart data={data} height={50} showGrowth />
        </View>
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

  const loadStats = useCallback(() => {
    const events = getAllEvents();
    const sales = getAllSales();
    
    setHasEvents(events.length > 0);
    
    if (events.length > 0) {
      const globalStats = calculateGlobalStats(events, sales);
      setStats(globalStats);
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
        contentContainerStyle={{ paddingBottom: 100 }}
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
          <View>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
