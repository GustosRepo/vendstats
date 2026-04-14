import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions, Image, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TabScreenProps } from '../../../navigation/types';
import { EmptyState } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { getAllEvents, getAllSales, getQuickSaleItems } from '../../../storage';
import { hasPremiumAccess } from '../../../storage';
import { getDataVersion } from '../../../storage/mmkv';
import { calculateGlobalStats, getRevenueOverTime, getRevenueByPeriod, getTopSellingProducts, getProfitByEvent, getExtendedStats, calculateEventStats, generateSmartInsights } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { GlobalStats } from '../../../types';
import { colors, shadows, radius } from '../../../theme';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatDate } from '../../../utils/date';

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
  const { t } = useTranslation();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);
  const [revenueData, setRevenueData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([]);
  const [eventProfits, setEventProfits] = useState<{ name: string; profit: number; revenue: number }[]>([]);
  const [extendedStats, setExtendedStats] = useState<any>(null);
  const [inventoryValue, setInventoryValue] = useState({ atCost: 0, atRetail: 0 });
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | '3month'>('week');
  const [allSalesRef, setAllSalesRef] = useState<any[]>([]);
  const [smartInsights, setSmartInsights] = useState<{ icon: string; key: string; params?: Record<string, string | number> }[]>([]);
  const [revenueGrowth, setRevenueGrowth] = useState<string | undefined>(undefined);
  const lastLoadedVersion = useRef(-1);

  const screenWidth = Dimensions.get('window').width - 48;

  const loadStats = useCallback((force = false) => {
    // Skip if data hasn't changed since last load
    const currentVersion = getDataVersion();
    if (!force && currentVersion === lastLoadedVersion.current) return;
    lastLoadedVersion.current = currentVersion;

    const events = getAllEvents();
    const sales = getAllSales();
    const products = getQuickSaleItems();
    
    setHasEvents(events.length > 0);
    
    if (events.length > 0) {
      const globalStats = calculateGlobalStats(events, sales);
      setStats(globalStats);

      // Calculate real revenue growth (recent half vs early half of events)
      const sorted = [...events].sort((a, b) => {
        const ta = new Date(a.date).getTime();
        const tb = new Date(b.date).getTime();
        return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
      });
      if (sorted.length >= 2) {
        const mid = Math.floor(sorted.length / 2);
        const earlyRev = sorted.slice(0, mid).reduce((sum, e) => {
          return sum + sales.filter(s => s.eventId === e.id).reduce((s2, s) => s2 + s.quantity * s.salePrice, 0);
        }, 0);
        const recentRev = sorted.slice(mid).reduce((sum, e) => {
          return sum + sales.filter(s => s.eventId === e.id).reduce((s2, s) => s2 + s.quantity * s.salePrice, 0);
        }, 0);
        if (earlyRev > 0) {
          const pct = ((recentRev - earlyRev) / earlyRev) * 100;
          const safePct = isNaN(pct) ? 0 : pct;
          setRevenueGrowth((safePct >= 0 ? '+' : '') + safePct.toFixed(1) + '%');
        } else if (recentRev > 0) {
          setRevenueGrowth('+100%');
        } else {
          setRevenueGrowth(undefined);
        }
      } else {
        setRevenueGrowth(undefined);
      }
      
      // Extended stats
      setExtendedStats(getExtendedStats(events, sales));
      
      // Inventory value
      const atCost = products.reduce((sum, p) => sum + (p.stockCount || 0) * p.defaultCost, 0);
      const atRetail = products.reduce((sum, p) => sum + (p.stockCount || 0) * p.defaultPrice, 0);
      setInventoryValue({ atCost, atRetail });
      
      // Chart data
      setAllSalesRef(sales);
      setRevenueData(getRevenueByPeriod(sales, revenuePeriod));
      setTopProducts(getTopSellingProducts(sales, 5));
      setEventProfits(getProfitByEvent(events, sales));
      setSmartInsights(generateSmartInsights(events, sales));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats(true);
    setRefreshing(false);
  }, [loadStats]);

  const handleShareMonthlyReport = async () => {
    const events = getAllEvents();
    const sales = getAllSales();
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthName = formatDate(now, 'MMMM yyyy');

    // Filter events this month
    const monthEvents = events.filter(e => {
      try {
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false;
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });

    // Filter sales this month
    const monthEventIds = new Set(monthEvents.map(e => e.id));
    const monthSales = sales.filter(s => monthEventIds.has(s.eventId));

    const totalRevenue = monthSales.reduce((sum, s) => sum + s.quantity * s.salePrice, 0);
    const totalCost = monthSales.reduce((sum, s) => sum + s.quantity * s.costPerItem, 0);
    const totalExpenses = monthEvents.reduce((sum, e) => sum + (e.boothFee ?? 0) + (e.travelCost ?? 0) + (e.suppliesCost || 0) + (e.miscCost || 0), 0);
    const netProfit = totalRevenue - totalCost - totalExpenses;
    const totalItems = monthSales.reduce((sum, s) => sum + s.quantity, 0);

    // Best event
    let bestEvent = '';
    let bestProfit = -Infinity;
    monthEvents.forEach(e => {
      const eSales = monthSales.filter(s => s.eventId === e.id);
      const eStats = calculateEventStats(e, eSales);
      if (eStats.netProfit > bestProfit) {
        bestProfit = eStats.netProfit;
        bestEvent = e.name;
      }
    });

    const emoji = netProfit >= 0 ? '📈' : '📉';

    const report = [
      `📊 ${t('monthlySummary.title')} — ${monthName}`,
      '',
      `🗓 ${t('monthlySummary.events')}: ${monthEvents.length}`,
      `💰 ${t('common.revenue')}: ${formatCurrency(totalRevenue)}`,
      `${emoji} ${t('report.netProfit')}: ${formatCurrency(netProfit)}`,
      `📦 ${t('report.itemsSold')}: ${totalItems}`,
      '',
      bestEvent ? `⭐ ${t('monthlySummary.bestEvent')}: ${bestEvent} (${formatCurrency(bestProfit)})` : '',
      '',
      `— ${t('report.generatedBy')} VendStats`,
    ].filter(Boolean).join('\n');

    try {
      await Share.share({ message: report });
    } catch {}
  };

  if (!hasEvents) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <TexturePattern />
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>{t('stats.title')}</Text>
        </View>
        <EmptyState
          title={t('stats.noStatsYet')}
          message={t('stats.noStatsMessage')}
          actionLabel={t('events.createEvent')}
          onAction={() => navigation.navigate('CreateEvent')}
          icon={<Image source={MascotImages.phone} style={{ width: 120, height: 120 }} resizeMode="contain" />}
        />
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textTertiary }}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  // Pro gate — free users see a teaser
  if (!hasPremiumAccess()) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <TexturePattern />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>{t('stats.title')}</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
              {t('stats.acrossEvents', { count: stats.totalEvents })}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            {/* Blurred preview cards */}
            <View style={{ marginBottom: 16, opacity: 0.35 }}>
              <HeroMetricCard label={t('stats.totalProfit')} value="$••••" />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, opacity: 0.35 }}>
              <View style={{ flex: 1 }}>
                <StatCard label={t('stats.totalRevenue')} value="$••••" />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard label={t('stats.avgPerEvent')} value="$••••" />
              </View>
            </View>

            {/* Upgrade CTA */}
            <View style={[{
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: 32,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.primary + '30',
            }, shadows.md]}>
              <Image
                source={MascotImages.phone}
                style={{ width: 100, height: 100, marginBottom: 20 }}
                resizeMode="contain"
              />
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: colors.primaryLight,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="lock-closed" size={26} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                {t('stats.proFeature')}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
                {t('stats.proFeatureMessage')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Paywall')}
                style={[{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 32,
                  paddingVertical: 14,
                  borderRadius: radius.full,
                }, shadows.sm]}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  {t('stats.upgradeToPro')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>{t('stats.title')}</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            {t('stats.acrossEvents', { count: stats.totalEvents })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EventComparison')}
            style={[{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              paddingVertical: 12,
              gap: 8,
              borderWidth: 1,
              borderColor: colors.primary + '25',
            }, shadows.sm]}
          >
            <Ionicons name="git-compare-outline" size={18} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>{t('comparison.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShareMonthlyReport}
            style={[{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              paddingVertical: 12,
              gap: 8,
              borderWidth: 1,
              borderColor: colors.copper + '25',
            }, shadows.sm]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.copper} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.copper }}>{t('monthlySummary.share')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          {/* Hero - Total Profit */}
          <View style={{ marginBottom: 16 }}>
            <HeroMetricCard 
              label={t('stats.totalProfit')} 
              value={formatCurrency(stats.totalProfit)} 
              positive={isProfitable}
            />
          </View>

          {/* Revenue Card */}
          <View style={{ marginBottom: 16 }}>
            <StatCard 
              label={t('stats.totalRevenue')} 
              value={formatCurrency(stats.totalRevenue)}
              growth={revenueGrowth}
            />
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  {t('stats.avgPerEvent')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: stats.averageProfitPerEvent >= 0 ? colors.growth : colors.danger }}>
                  {formatCurrency(stats.averageProfitPerEvent)}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  {t('events.title')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{stats.totalEvents}</Text>
              </View>
            </View>
          </View>

          {/* Profit Margin & Items Sold Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  {t('stats.profitMargin')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: (extendedStats?.profitMargin || 0) >= 0 ? colors.growth : colors.danger }}>
                  {(extendedStats?.profitMargin || 0).toFixed(1)}%
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  {t('stats.itemsSold')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{extendedStats?.totalItemsSold || 0}</Text>
              </View>
            </View>
          </View>

          {/* Avg Sale Value & Items/Event Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  {t('stats.avgSale')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.copper }}>
                  {formatCurrency(extendedStats?.avgSaleValue || 0)}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                  {t('stats.itemsPerEvent')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
                  {(extendedStats?.avgItemsPerEvent || 0).toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Expense Breakdown */}
          {(extendedStats?.totalBoothFees > 0 || extendedStats?.totalTravelCosts > 0 || extendedStats?.totalSuppliesCosts > 0 || extendedStats?.totalMiscCosts > 0) && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                {t('stats.expenseBreakdown')}
              </Text>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary }}>{t('stats.boothFees')}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>{formatCurrency(extendedStats?.totalBoothFees || 0)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary }}>{t('stats.travelCosts')}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>{formatCurrency(extendedStats?.totalTravelCosts || 0)}</Text>
                </View>
                {(extendedStats?.totalSuppliesCosts || 0) > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 15, color: colors.textSecondary }}>{t('stats.suppliesCosts')}</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>{formatCurrency(extendedStats?.totalSuppliesCosts || 0)}</Text>
                  </View>
                )}
                {(extendedStats?.totalMiscCosts || 0) > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 15, color: colors.textSecondary }}>{t('stats.miscCosts')}</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>{formatCurrency(extendedStats?.totalMiscCosts || 0)}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary }}>{t('stats.costOfGoods')}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>{formatCurrency(extendedStats?.totalCostOfGoods || 0)}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{t('stats.totalExpenses')}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.danger }}>
                    {formatCurrency((extendedStats?.totalBoothFees || 0) + (extendedStats?.totalTravelCosts || 0) + (extendedStats?.totalSuppliesCosts || 0) + (extendedStats?.totalMiscCosts || 0) + (extendedStats?.totalCostOfGoods || 0))}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Inventory Value */}
          {(inventoryValue.atCost > 0 || inventoryValue.atRetail > 0) && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
                {t('stats.inventoryValue')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                      {t('stats.atCost')}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                      {formatCurrency(inventoryValue.atCost)}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                      {t('stats.potential')}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.growth }}>
                      {formatCurrency(inventoryValue.atRetail)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Product Insights */}
          {(extendedStats?.bestSeller || extendedStats?.highestRevenue || extendedStats?.mostProfitableProduct) && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {t('stats.productInsights')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('BestSellers')}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                    {t('common.viewAll')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 }, shadows.sm]}>
                {extendedStats?.bestSeller && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                        {t('stats.bestSeller')}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {extendedStats.bestSeller.name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.copper }}>{t('stats.sold', { qty: extendedStats.bestSeller.quantity })}</Text>
                  </View>
                )}
                {extendedStats?.highestRevenue && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                        {t('stats.highestRevenue')}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {extendedStats.highestRevenue.name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.growth }}>{formatCurrency(extendedStats.highestRevenue.revenue)}</Text>
                  </View>
                )}
                {extendedStats?.mostProfitableProduct && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                        {t('stats.mostProfitable')}
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {extendedStats.mostProfitableProduct.name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.growth }}>{formatCurrency(extendedStats.mostProfitableProduct.profit)}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Most Profitable Event */}
          {stats.mostProfitableEvent && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {t('stats.topPerformer')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('EventRanking')}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                    {t('ranking.viewAll')}
                  </Text>
                </TouchableOpacity>
              </View>
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
              {t('stats.insights')}
            </Text>
            <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: 20 }, shadows.sm]}>
              <InsightRow 
                icon="wallet-outline" 
                text={t('stats.totalRevenueAcross', { amount: formatCurrency(stats.totalRevenue) })}
              />
              <InsightRow 
                icon="trending-up-outline" 
                text={t('stats.avgProfitPerEvent', { amount: formatCurrency(stats.averageProfitPerEvent) })}
              />
              {stats.mostProfitableEvent && (
                <InsightRow 
                  icon="trophy-outline" 
                  text={t('stats.bestPerformer', { name: stats.mostProfitableEvent.eventName })}
                  isLast={smartInsights.length === 0}
                />
              )}
              {smartInsights.map((insight, idx) => (
                <InsightRow
                  key={insight.key}
                  icon={insight.icon as keyof typeof Ionicons.glyphMap}
                  text={t(insight.key, insight.params)}
                  isLast={idx === smartInsights.length - 1}
                />
              ))}
            </View>
          </View>

          {/* Revenue Over Time Chart */}
          {revenueData.data.some(d => d > 0) && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {t('stats.revenueTrends')}
                </Text>
                <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 2 }}>
                  {(['week', 'month', '3month'] as const).map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => {
                        setRevenuePeriod(p);
                        setRevenueData(getRevenueByPeriod(allSalesRef, p));
                      }}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: radius.sm,
                        backgroundColor: revenuePeriod === p ? colors.primary : 'transparent',
                      }}
                    >
                      <Text style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: revenuePeriod === p ? '#FFFFFF' : colors.textTertiary,
                      }}>
                        {p === 'week' ? t('stats.period7d') : p === 'month' ? t('stats.period30d') : t('stats.period3m')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
                      r: revenuePeriod === '3month' ? '3' : '4',
                      strokeWidth: '2',
                      stroke: colors.primary,
                    },
                    propsForLabels: {
                      fontSize: revenuePeriod === '3month' ? 9 : 11,
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
                {t('stats.topSellingItems')}
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
                        {t('stats.sold', { qty: product.quantity })}
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
                {t('stats.profitByEvent')}
              </Text>
              <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, overflow: 'hidden' }, shadows.sm]}>
                <BarChart
                  data={{
                    labels: eventProfits.slice(0, 5).map(e => e.name),
                    datasets: [{ data: eventProfits.slice(0, 5).map(e => Math.round(Math.max(0, e.profit))) }],
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
