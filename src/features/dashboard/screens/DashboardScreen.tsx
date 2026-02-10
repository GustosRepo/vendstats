import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { EmptyState } from '../../../components';
import { getAllEvents, getAllSales, getQuickSaleItems, getLowStockThreshold } from '../../../storage';
import { calculateGlobalStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { Event, GlobalStats, QuickSaleItem } from '../../../types';
import { colors, shadows, radius } from '../../../theme';
import { MascotImages } from '../../../../assets';

const { width: screenWidth } = Dimensions.get('window');

// Finance chart component
const FinanceChart: React.FC<{ data: number[]; height?: number }> = ({ data, height = 100 }) => {
  const width = screenWidth - 64;
  const padding = { top: 12, bottom: 8, left: 0, right: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (data.length < 2) return null;

  const minValue = Math.min(...data) * 0.85;
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

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={colors.chartLine} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={colors.chartLine} stopOpacity={0.01} />
        </LinearGradient>
      </Defs>
      <Path d={areaD} fill="url(#chartGradient)" />
      <Path d={pathD} stroke={colors.chartLine} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={lastPoint.x} cy={lastPoint.y} r={5} fill={colors.surface} stroke={colors.chartLine} strokeWidth={2.5} />
    </Svg>
  );
};

// Pill button
const PillButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: 10,
      paddingHorizontal: 20,
    }}
    activeOpacity={0.85}
  >
    <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
  </TouchableOpacity>
);

// Hero revenue card
const HeroRevenueCard: React.FC<{ revenue: number; revenueData: number[] }> = ({ revenue, revenueData }) => (
  <View style={[{ 
    backgroundColor: colors.surface, 
    borderRadius: radius.xl, 
    padding: 24,
    paddingBottom: 16,
  }, shadows.lg]}>
    <Text style={{ 
      fontSize: 11, 
      fontWeight: '600', 
      color: colors.textTertiary, 
      letterSpacing: 0.8, 
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      Total Revenue
    </Text>
    <Text style={{ 
      fontSize: 44, 
      fontWeight: '700', 
      color: colors.textPrimary, 
      letterSpacing: -1.5,
      marginBottom: 4,
    }}>
      {formatCurrency(revenue)}
    </Text>
    {revenueData.length > 1 && (
      <View style={{ marginTop: 16 }}>
        <FinanceChart data={revenueData} height={90} />
      </View>
    )}
  </View>
);

// Metric card
const MetricCard: React.FC<{ label: string; value: string; subtitle?: string }> = ({ label, value, subtitle }) => (
  <View style={[{ 
    backgroundColor: colors.surface, 
    borderRadius: radius.xl, 
    padding: 20,
    flex: 1,
  }, shadows.md]}>
    <Text style={{ 
      fontSize: 11, 
      fontWeight: '600', 
      color: colors.textTertiary, 
      letterSpacing: 0.8, 
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {label}
    </Text>
    <Text style={{ 
      fontSize: 26, 
      fontWeight: '700', 
      color: colors.textPrimary, 
      letterSpacing: -0.3,
    }}>
      {value}
    </Text>
    {subtitle && (
      <Text style={{ 
        fontSize: 13, 
        fontWeight: '500', 
        color: colors.growth, 
        marginTop: 4,
      }}>
        {subtitle}
      </Text>
    )}
  </View>
);

// Event row
const EventRow: React.FC<{
  event: Event;
  profit: number;
  onPress: () => void;
  isLast?: boolean;
}> = ({ event, profit, onPress, isLast }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.divider,
    }} 
    activeOpacity={0.7}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
        {event.name}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 3 }}>
        {new Date(event.date).toLocaleDateString()}
      </Text>
    </View>
    <Text style={{ fontSize: 17, fontWeight: '700', color: profit >= 0 ? colors.growth : colors.loss, marginRight: 12 }}>
      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
    </Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </TouchableOpacity>
);

export const DashboardScreen: React.FC<TabScreenProps<'Dashboard'>> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [eventProfits, setEventProfits] = useState<Record<string, number>>({});
  const [lowStockItems, setLowStockItems] = useState<QuickSaleItem[]>([]);

  const loadData = useCallback(() => {
    const allEvents = getAllEvents();
    const allSales = getAllSales();
    const globalStats = calculateGlobalStats(allEvents, allSales);
    
    // Check for low stock items based on user's threshold setting
    const threshold = getLowStockThreshold();
    const allProducts = getQuickSaleItems();
    const lowStock = allProducts.filter(p => 
      p.stockCount !== undefined && p.stockCount <= threshold
    ).sort((a, b) => (a.stockCount || 0) - (b.stockCount || 0));
    setLowStockItems(lowStock);
    
    // Calculate profit per event
    const profits: Record<string, number> = {};
    allEvents.forEach(event => {
      const eventSales = allSales.filter(s => s.eventId === event.id);
      const revenue = eventSales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
      const costs = eventSales.reduce((sum, s) => sum + s.costPerItem * s.quantity, 0);
      const expenses = event.boothFee + event.travelCost;
      profits[event.id] = revenue - costs - expenses;
    });

    setEvents(allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setStats(globalStats);
    setEventProfits(profits);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  const recentEvents = events.slice(0, 3);
  const hasEvents = events.length > 0;

  // Build revenue trend from events
  const revenueData = events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map(e => eventProfits[e.id] || 0)
    .map((_, i, arr) => arr.slice(0, i + 1).reduce((sum, v) => sum + v, 0)); // Cumulative

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Header Section */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingTop: 16, 
          paddingBottom: 28,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={MascotImages.wink} 
                style={{ width: 56, height: 56, marginRight: 12 }} 
                resizeMode="contain" 
              />
              <View>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: '700', 
                  color: colors.textPrimary, 
                  letterSpacing: -0.5,
                  marginBottom: 2,
                }}>
                  Your Hustle
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                }}>
                  {hasEvents ? `${events.length} events tracked` : 'Get started'}
                </Text>
              </View>
            </View>
            <PillButton 
              label="New Event" 
              onPress={() => navigation.navigate('CreateEvent')} 
            />
          </View>
        </View>

        {!hasEvents ? (
          <View style={{ paddingHorizontal: 24 }}>
            <EmptyState
              title="Welcome to VendStats!"
              message="Create your first event to start tracking your pop-up business profits."
              actionLabel="Create Event"
              onAction={() => navigation.navigate('CreateEvent')}
              icon={<Image source={MascotImages.tent} style={{ width: 120, height: 120 }} resizeMode="contain" />}
            />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24 }}>
            {/* Hero Revenue Card */}
            <View style={{ marginBottom: 16 }}>
              <HeroRevenueCard 
                revenue={stats?.totalRevenue || 0} 
                revenueData={revenueData}
              />
            </View>

            {/* Secondary Metrics Row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
              <MetricCard 
                label="Net Profit" 
                value={formatCurrency(stats?.totalProfit || 0)} 
              />
              <MetricCard 
                label="Events" 
                value={String(events.length)} 
              />
            </View>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger || '#EF4444'} style={{ marginRight: 6 }} />
                    <Text style={{ 
                      fontSize: 11, 
                      fontWeight: '600', 
                      color: colors.danger || '#EF4444', 
                      letterSpacing: 0.8, 
                      textTransform: 'uppercase',
                    }}>
                      Low Stock Alert
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={[{ 
                  backgroundColor: colors.surface, 
                  borderRadius: radius.xl, 
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }, shadows.md]}>
                  {lowStockItems.slice(0, 3).map((item, index) => (
                    <View 
                      key={item.id} 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        paddingVertical: 10,
                        borderBottomWidth: index < Math.min(lowStockItems.length, 3) - 1 ? 1 : 0,
                        borderBottomColor: colors.divider,
                      }}
                    >
                      {item.imageUri ? (
                        <Image 
                          source={{ uri: item.imageUri }} 
                          style={{ width: 40, height: 40, borderRadius: 8, marginRight: 12 }} 
                        />
                      ) : (
                        <View style={{ 
                          width: 40, height: 40, borderRadius: 8, 
                          backgroundColor: colors.copper + '20', 
                          alignItems: 'center', justifyContent: 'center', marginRight: 12 
                        }}>
                          <Ionicons name="cube-outline" size={20} color={colors.copper} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                          {item.itemName}
                        </Text>
                      </View>
                      <View style={{ 
                        backgroundColor: (item.stockCount || 0) === 0 ? (colors.danger || '#EF4444') + '15' : '#FEF3C7',
                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
                      }}>
                        <Text style={{ 
                          fontSize: 13, 
                          fontWeight: '700', 
                          color: (item.stockCount || 0) === 0 ? (colors.danger || '#EF4444') : '#D97706',
                        }}>
                          {(item.stockCount || 0) === 0 ? 'Out of Stock' : `${item.stockCount} left`}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {lowStockItems.length > 3 && (
                    <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingTop: 8 }}>
                      +{lowStockItems.length - 3} more items low on stock
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Recent Events Section */}
            {recentEvents.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ 
                    fontSize: 11, 
                    fontWeight: '600', 
                    color: colors.textTertiary, 
                    letterSpacing: 0.8, 
                    textTransform: 'uppercase',
                  }}>
                    Recent Events
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>View All</Text>
                  </TouchableOpacity>
                </View>
                <View style={[{ 
                  backgroundColor: colors.surface, 
                  borderRadius: radius.xl, 
                  paddingHorizontal: 20,
                }, shadows.md]}>
                  {recentEvents.map((event, index) => (
                    <EventRow 
                      key={event.id} 
                      event={event}
                      profit={eventProfits[event.id] || 0}
                      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })} 
                      isLast={index === recentEvents.length - 1} 
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Quick Action */}
            {recentEvents.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('QuickSale', { eventId: recentEvents[0].id })}
                style={[{
                  backgroundColor: colors.surface,
                  borderRadius: radius.xl,
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }, shadows.md]}
                activeOpacity={0.7}
              >
                <View style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 12, 
                  backgroundColor: colors.primaryLight, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="flash" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    Quick Sale
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
                    Record a sale in seconds
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
