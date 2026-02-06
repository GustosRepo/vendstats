import React from 'react';
import { ScrollView, View, Text, Dimensions } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../theme';
import {
  AppScreen,
  AppHeader,
  Card,
  CardHeader,
  CardDivider,
  ChartCard,
  KPIStatCard,
  MiniKPIRow,
  ListRow,
  ListDivider,
  ListSection,
  Badge,
  SecondaryButton,
} from '../components/design-system';

// Simple bar chart component
const SimpleBarChart: React.FC<{ data: number[]; color: string; height?: number }> = ({
  data,
  color,
  height = 140,
}) => {
  const width = Dimensions.get('window').width - 56;
  const padding = { top: 20, bottom: 20, left: 10, right: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data) * 1.1;
  const barWidth = chartWidth / data.length - 8;

  return (
    <Svg width={width} height={height}>
      {data.map((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding.left + (index * chartWidth) / data.length + 4;
        const y = padding.top + chartHeight - barHeight;
        return (
          <Rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={4}
            fill={color}
            opacity={0.8 + (value / maxValue) * 0.2}
          />
        );
      })}
    </Svg>
  );
};

// Simple line chart component
const SimpleLineChart: React.FC<{
  data: number[];
  color: string;
  height?: number;
  showGrid?: boolean;
}> = ({ data, color, height = 140, showGrid = false }) => {
  const width = Dimensions.get('window').width - 56;
  const padding = { top: 20, bottom: 20, left: 10, right: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minValue = Math.min(...data) * 0.9;
  const maxValue = Math.max(...data) * 1.1;
  const range = maxValue - minValue;

  const points = data.map((value, index) => ({
    x: padding.left + (index / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight,
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp2x = prev.x + (2 * (curr.x - prev.x)) / 3;
    pathD += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`gradient-detail-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaD} fill={`url(#gradient-detail-${color})`} />
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Mock event data
const eventData = {
  id: '1',
  name: "Farmer's Market Downtown",
  date: 'Saturday, Feb 1, 2026',
  location: '123 Main Street, Portland OR',
  status: 'completed',
  stats: {
    revenue: 856.50,
    expenses: 285.00,
    profit: 571.50,
    sales: 47,
    avgSale: 18.22,
  },
};

const salesByHour = [45, 62, 98, 125, 142, 118, 95, 72, 58, 32];
const salesTrend = [12, 18, 24, 32, 28, 45, 38, 52, 48, 62, 55, 72];

const lineItems = [
  { id: '1', name: 'Artisan Bread', qty: 24, price: 8.50, total: 204.00 },
  { id: '2', name: 'Honey Jar (16oz)', qty: 18, price: 12.00, total: 216.00 },
  { id: '3', name: 'Jam Sampler Pack', qty: 15, price: 15.00, total: 225.00 },
  { id: '4', name: 'Fresh Eggs (dozen)', qty: 12, price: 7.50, total: 90.00 },
  { id: '5', name: 'Lavender Soap', qty: 8, price: 6.00, total: 48.00 },
];

const expenses = [
  { id: '1', name: 'Booth Fee', amount: 150.00 },
  { id: '2', name: 'Supplies', amount: 85.00 },
  { id: '3', name: 'Transportation', amount: 50.00 },
];

/**
 * EventDetailScreen - Detailed view of a single event
 * Shows summary stats, charts, and line-item breakdown
 */
export const EventDetailScreen: React.FC<{
  navigation?: any;
  route?: {
    params?: {
      eventId?: string;
    };
  };
}> = ({
  navigation,
  route,
}) => {
  return (
    <AppScreen
      header={
        <AppHeader
          title={eventData.name}
          subtitle={eventData.date}
          leftAction={{
            icon: 'chevron-back',
            onPress: () => navigation?.goBack(),
          }}
          rightActions={[
            { icon: 'create-outline', onPress: () => navigation?.navigate('EditEvent', { eventId: eventData.id }) },
            { icon: 'share-outline', onPress: () => {} },
          ]}
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Status Badge */}
        <View className="flex-row items-center mb-4">
          <Badge label="Completed" variant="success" />
          <Text
            style={[typography.bodySmall, { color: colors.textSecondary }]}
            className="ml-3"
          >
            {eventData.location}
          </Text>
        </View>

        {/* Main KPI Card */}
        <Card>
          <View className="items-center mb-4">
            <Text
              style={[typography.labelSmall, { color: colors.textSecondary }]}
              className="uppercase tracking-wide"
            >
              Net Profit
            </Text>
            <Text
              style={[typography.kpiLarge, { color: colors.success }]}
              className="mt-1"
            >
              ${eventData.stats.profit.toFixed(2)}
            </Text>
          </View>
          <CardDivider />
          <MiniKPIRow
            items={[
              {
                label: 'Revenue',
                value: `$${eventData.stats.revenue.toFixed(0)}`,
                color: colors.primary,
              },
              {
                label: 'Expenses',
                value: `$${eventData.stats.expenses.toFixed(0)}`,
                color: colors.danger,
              },
              {
                label: 'Sales',
                value: eventData.stats.sales.toString(),
              },
            ]}
          />
        </Card>

        {/* Sales by Hour Chart */}
        <View className="mt-5">
          <ChartCard title="Sales by Hour" height={180}>
            <SimpleBarChart data={salesByHour} color={colors.primary} height={160} />
          </ChartCard>
        </View>

        {/* Revenue Trend */}
        <View className="mt-5">
          <ChartCard title="Revenue Trend" height={160}>
            <SimpleLineChart data={salesTrend} color={colors.success} height={140} />
          </ChartCard>
        </View>

        {/* Top Products */}
        <ListSection
          title="Items Sold"
          action={{ label: 'Add Item', onPress: () => navigation?.navigate('AddSale', { eventId: eventData.id }) }}
        />
        <Card noPadding>
          <View className="py-1">
            {lineItems.map((item, index) => (
              <View key={item.id}>
                <View className="px-4">
                  <ListRow
                    title={item.name}
                    subtitle={`${item.qty} × $${item.price.toFixed(2)}`}
                    value={`$${item.total.toFixed(2)}`}
                    showChevron={false}
                    compact
                  />
                </View>
                {index < lineItems.length - 1 && <ListDivider />}
              </View>
            ))}
          </View>
        </Card>

        {/* Expenses */}
        <ListSection
          title="Expenses"
          action={{ label: 'Add Expense', onPress: () => {} }}
        />
        <Card noPadding>
          <View className="py-1">
            {expenses.map((expense, index) => (
              <View key={expense.id}>
                <View className="px-4">
                  <ListRow
                    title={expense.name}
                    value={`-$${expense.amount.toFixed(2)}`}
                    valueColor={colors.danger}
                    showChevron={false}
                    compact
                  />
                </View>
                {index < expenses.length - 1 && <ListDivider />}
              </View>
            ))}
          </View>
        </Card>

        {/* Actions */}
        <View className="mt-6">
          <SecondaryButton
            title="Duplicate Event"
            icon="copy-outline"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
};

export default EventDetailScreen;
