import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert, Image, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, StatBox, SaleItem, EmptyState, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getEventById, getSalesByEventId, deleteSale, getQuickSaleItems } from '../../../storage';
import { calculateEventStats, calculateBreakEven, calculatePrepRecommendations, calculateForecast } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { Event, Sale, EventStats } from '../../../types';
import { colors } from '../../../theme';
import { MascotImages } from '../../../../assets';
import { getAllEvents, getAllSales } from '../../../storage';
import { getDataVersion } from '../../../storage/mmkv';

export const EventDetailScreen: React.FC<RootStackScreenProps<'EventDetail'>> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  const { t } = useTranslation();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [sellThrough, setSellThrough] = useState<{ name: string; sold: number; prepared: number; rate: number }[]>([]);
  const [breakEven, setBreakEven] = useState<{ avgProfitPerUnit: number; unitsToBreakEven: number; isBreakEven: boolean } | null>(null);
  const [prepRecs, setPrepRecs] = useState<{ name: string; avgSold: number; recommended: number; minSold: number; maxSold: number; eventsAppeared: number }[]>([]);
  const [showAllPrep, setShowAllPrep] = useState(false);
  const [forecast, setForecast] = useState<{ predictedRevenue: number; predictedProfit: number; predictedItems: number; basedOnEvents: number } | null>(null);
  const lastLoadedVersion = useRef(-1);

  const WEATHER_MAP: Record<string, string> = {
    sunny: '☀️', cloudy: '☁️', rainy: '🌧️', hot: '🔥', cold: '❄️', windy: '💨',
  };

  const loadData = useCallback(() => {
    // Skip if data hasn't changed since last load
    const currentVersion = getDataVersion();
    if (currentVersion === lastLoadedVersion.current) return;
    lastLoadedVersion.current = currentVersion;

    const eventData = getEventById(eventId);
    const salesData = getSalesByEventId(eventId);
    
    if (eventData) {
      setEvent(eventData);
      setSales(salesData);
      setStats(calculateEventStats(eventData, salesData));

      // Calculate sell-through rate
      const quickItems = getQuickSaleItems();
      const itemSales = new Map<string, number>();
      salesData.forEach(s => {
        itemSales.set(s.itemName, (itemSales.get(s.itemName) || 0) + s.quantity);
      });

      const stData = quickItems
        .filter(item => {
          // Only items that were brought to this event (or all if no productIds)
          if (eventData.productIds && eventData.productIds.length > 0) {
            return eventData.productIds.includes(item.id);
          }
          return true;
        })
        .filter(item => item.stockCount !== undefined && item.stockCount > 0)
        .map(item => {
          const sold = itemSales.get(item.itemName) || 0;
          const prepared = (item.stockCount || 0) + sold; // original stock = current + sold
          const rate = prepared > 0 ? Math.min((sold / prepared) * 100, 100) : 0;
          return { name: item.itemName, sold, prepared, rate };
        })
        .filter(item => item.prepared > 0);
      
      setSellThrough(stData);

      // Break-even calculation
      const be = calculateBreakEven(eventData, salesData);
      setBreakEven(be);

      // Prep recommendations (based on ALL events history)
      const allEvents = getAllEvents();
      const allSalesData = getAllSales();
      if (allEvents.length >= 1) {
        const recs = calculatePrepRecommendations(allEvents, allSalesData, quickItems);
        setPrepRecs(recs.filter(r => r.eventsAppeared >= 1));
      }

      // Sales forecast
      if (allEvents.length >= 2) {
        const fc = calculateForecast(allEvents, allSalesData, eventData);
        setForecast(fc);
      }
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddSale = () => {
    navigation.navigate('AddSale', { eventId });
  };

  const handleQuickSale = () => {
    navigation.navigate('QuickSale', { eventId });
  };

  const handleEditEvent = () => {
    navigation.navigate('EditEvent', { eventId });
  };

  const handleDuplicateEvent = () => {
    navigation.navigate('CreateEvent', { duplicateFromEventId: eventId });
  };

  const handleShareReport = async () => {
    if (!event || !stats) return;

    // Build item breakdown
    const itemMap = new Map<string, { qty: number; revenue: number; profit: number }>();
    sales.forEach(sale => {
      const existing = itemMap.get(sale.itemName) || { qty: 0, revenue: 0, profit: 0 };
      const rev = sale.quantity * sale.salePrice;
      const prof = rev - (sale.quantity * sale.costPerItem);
      itemMap.set(sale.itemName, {
        qty: existing.qty + sale.quantity,
        revenue: existing.revenue + rev,
        profit: existing.profit + prof,
      });
    });

    const itemLines = Array.from(itemMap.entries())
      .sort((a, b) => b[1].qty - a[1].qty)
      .map(([name, data]) => `  • ${name}: ${data.qty} ${t('report.unitsSold')} — ${formatCurrency(data.revenue)}`)
      .join('\n');

    const emoji = stats.netProfit >= 0 ? '📈' : '📉';
    const locationLine = event.location ? `📍 ${event.location}\n` : '';
    const tagsLine = event.tags && event.tags.length > 0
      ? `🏷️ ${event.tags.map(tag => t(`tags.${tag}`)).join(', ')}\n`
      : '';
    const weatherLine = event.weather
      ? `${WEATHER_MAP[event.weather] || ''} ${t(`weather.${event.weather}`)}\n`
      : '';

    const report = [
      `🧾 ${t('report.title')} — ${event.name}`,
      `📅 ${formatDate(new Date(event.date), 'MMMM d, yyyy')}`,
      locationLine,
      weatherLine,
      tagsLine,
      `${emoji} ${t('report.netProfit')}: ${formatCurrency(stats.netProfit)}`,
      `💰 ${t('common.revenue')}: ${formatCurrency(stats.totalRevenue)}`,
      `📦 ${t('report.itemsSold')}: ${stats.salesCount}`,
      '',
      stats.bestSellingItem ? `⭐ ${t('report.bestSeller')}: ${stats.bestSellingItem.itemName} (${stats.bestSellingItem.quantity})` : '',
      '',
      itemLines ? `${t('report.breakdown')}:\n${itemLines}` : '',
      '',
      `— ${t('report.generatedBy')} VendStats`,
    ].filter(Boolean).join('\n');

    try {
      await Share.share({ message: report });
    } catch {}
  };

  const handleEditSale = (saleId: string) => {
    navigation.navigate('EditSale', { eventId, saleId });
  };

  const handleDeleteSale = (saleId: string, itemName: string) => {
    Alert.alert(
      t('eventDetail.deleteSale'),
      t('eventDetail.deleteSaleConfirm', { name: itemName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteSale(saleId);
            loadData();
          },
        },
      ]
    );
  };

  if (!event || !stats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <TexturePattern />
        <Text style={{ color: colors.textTertiary }}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  const formattedDate = formatDate(new Date(event.date), 'EEEE, MMMM d, yyyy');
  const isProfitable = stats.netProfit >= 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>{event.name}</Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4 }}>{formattedDate}</Text>
              {event.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color={colors.textTertiary} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>{event.location}</Text>
                </View>
              ) : null}
              {event.weather ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 14, marginRight: 4 }}>{WEATHER_MAP[event.weather] || ''}</Text>
                  <Text style={{ fontSize: 14, color: colors.textMuted }}>{t(`weather.${event.weather}`)}</Text>
                </View>
              ) : null}
              {event.tags && event.tags.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {event.tags.map(tag => (
                    <View
                      key={tag}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: colors.primary + '18',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>
                        {t(`tags.${tag}`)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => navigation.navigate('EventReport', { eventId })}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDuplicateEvent}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditEvent}>
                <Text style={{ color: colors.copper, fontWeight: '500' }}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profit Hero */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
          <Card variant="elevated" padding="lg">
            <Text style={{ fontSize: 14, color: colors.textTertiary, fontWeight: "500", textAlign: "center", marginBottom: 8 }}>
              {t('eventDetail.netProfit')}
            </Text>
            <Text 
              style={{ fontSize: 42, fontWeight: '700', textAlign: 'center', color: isProfitable ? colors.growth : colors.danger }}
            >
              {formatCurrency(stats.netProfit)}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center", marginTop: 8 }}>
              {t('eventDetail.marginPercent', { value: stats.profitMargin.toFixed(1) })}
            </Text>
          </Card>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <StatBox
                label={t('common.revenue')}
                value={stats.totalRevenue}
                isCurrency
                variant="revenue"
              />
            </View>
            <View style={{ flex: 1 }}>
              <StatBox
                label={t('eventDetail.expenses')}
                value={stats.totalExpenses}
                isCurrency
                variant="expense"
              />
            </View>
          </View>
          
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <StatBox
                label={t('eventDetail.costOfGoods')}
                value={stats.totalCostOfGoods}
                isCurrency
              />
            </View>
            <View style={{ flex: 1 }}>
              <StatBox
                label={t('eventDetail.itemsSold')}
                value={stats.salesCount}
              />
            </View>
          </View>
        </View>

        {/* Best Selling Item */}
        {stats.bestSellingItem && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Card variant="outlined" padding="md">
              <Text style={{ fontSize: 12, color: colors.textTertiary, fontWeight: "500", marginBottom: 4 }}>
                {t('eventDetail.bestSeller')}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
                {stats.bestSellingItem.itemName}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>
                {t('eventDetail.bestSellerDetail', { qty: stats.bestSellingItem.quantity, revenue: formatCurrency(stats.bestSellingItem.revenue) })}
              </Text>
            </Card>
          </View>
        )}

        {/* Break-Even Calculator */}
        {breakEven && stats.totalExpenses > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
              {t('eventDetail.breakEven')}
            </Text>
            <Card variant="outlined" padding="md">
              {breakEven.isBreakEven ? (
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.growth} />
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.growth, marginTop: 8 }}>
                    {t('eventDetail.breakEvenReached')}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                    {t('eventDetail.breakEvenSurplus', { amount: formatCurrency(Math.abs(stats.netProfit)) })}
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Ionicons name="trending-up" size={32} color={colors.warning} />
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginTop: 8 }}>
                    {breakEven.unitsToBreakEven}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                    {t('eventDetail.breakEvenUnitsNeeded')}
                  </Text>
                  {breakEven.avgProfitPerUnit > 0 && (
                    <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 8 }}>
                      {t('eventDetail.breakEvenAvgProfit', { amount: formatCurrency(breakEven.avgProfitPerUnit) })}
                    </Text>
                  )}
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Sell-Through Rate */}
        {sellThrough.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
              {t('eventDetail.sellThrough')}
            </Text>
            <Card variant="outlined" padding="md">
              {sellThrough.map((item, i) => (
                <View 
                  key={item.name} 
                  style={{ 
                    paddingVertical: 10, 
                    borderBottomWidth: i < sellThrough.length - 1 ? 1 : 0, 
                    borderBottomColor: colors.divider 
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.textPrimary, flex: 1, marginRight: 8 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-sm font-semibold" style={{ color: item.rate >= 70 ? colors.growth : item.rate >= 40 ? colors.warning : colors.textTertiary }}>
                      {item.rate.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: colors.divider, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ 
                      height: '100%', 
                      width: `${item.rate}%`, 
                      backgroundColor: item.rate >= 70 ? colors.growth : item.rate >= 40 ? colors.stockLow : colors.textMuted,
                      borderRadius: 3,
                    }} />
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                    {t('eventDetail.sellThroughDetail', { sold: item.sold, prepared: item.prepared })}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Prep Recommendations */}
        {prepRecs.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
              {t('eventDetail.prepRecommendation')}
            </Text>
            <Card variant="outlined" padding="md">
              {(showAllPrep ? prepRecs : prepRecs.slice(0, 5)).map((item, i) => (
                <View 
                  key={item.name} 
                  style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingVertical: 10, 
                    borderBottomWidth: i < (showAllPrep ? prepRecs.length : Math.min(prepRecs.length, 5)) - 1 ? 1 : 0, 
                    borderBottomColor: colors.divider 
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.textPrimary }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {t('eventDetail.prepDetail', { avg: item.avgSold, min: item.minSold, max: item.maxSold, events: item.eventsAppeared })}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                      {item.recommended}
                    </Text>
                  </View>
                </View>
              ))}
              {prepRecs.length > 5 && (
                <TouchableOpacity 
                  onPress={() => setShowAllPrep(!showAllPrep)} 
                  style={{ paddingTop: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                    {showAllPrep ? t('eventDetail.showLess') : t('eventDetail.showAll', { count: prepRecs.length })}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>
        )}

        {/* Expense Breakdown */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
            {t('eventDetail.expenseBreakdown')}
          </Text>
          <Card variant="outlined" padding="md">
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
              <Text style={{ color: colors.textSecondary }}>{t('eventDetail.boothFee')}</Text>
              <Text style={{ fontWeight: "500", color: colors.textPrimary }}>
                {formatCurrency(event.boothFee)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
              <Text style={{ color: colors.textSecondary }}>{t('eventDetail.travelCost')}</Text>
              <Text style={{ fontWeight: "500", color: colors.textPrimary }}>
                {formatCurrency(event.travelCost)}
              </Text>
            </View>
            {(event.suppliesCost ?? 0) > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <Text style={{ color: colors.textSecondary }}>{t('eventDetail.suppliesCost')}</Text>
                <Text style={{ fontWeight: "500", color: colors.textPrimary }}>
                  {formatCurrency(event.suppliesCost!)}
                </Text>
              </View>
            )}
            {(event.miscCost ?? 0) > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <Text style={{ color: colors.textSecondary }}>{t('eventDetail.miscCost')}</Text>
                <Text style={{ fontWeight: "500", color: colors.textPrimary }}>
                  {formatCurrency(event.miscCost!)}
                </Text>
              </View>
            )}
            {event.receiptPhotoUri ? (
              <TouchableOpacity
                onPress={() => Alert.alert(t('receipt.viewReceipt'), undefined, [{ text: t('common.ok') }])}
                style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12 }}
              >
                <Image
                  source={{ uri: event.receiptPhotoUri }}
                  style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.success }}>{t('receipt.receiptAdded')}</Text>
                  <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{t('receipt.tapToView')}</Text>
                </View>
                <Ionicons name="image-outline" size={20} color={colors.success} />
              </TouchableOpacity>
            ) : null}
          </Card>
        </View>

        {/* Event Sales Forecast */}
        {forecast && forecast.basedOnEvents >= 2 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
              {t('forecast.title')}
            </Text>
            <Card variant="outlined" padding="md">
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Ionicons name="analytics-outline" size={28} color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 8, textAlign: 'center' }}>
                  {t('forecast.basedOn', { count: forecast.basedOnEvents })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' }}>{t('common.revenue')}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 4 }}>{formatCurrency(forecast.predictedRevenue)}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.growth + '15', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' }}>{t('common.profit')}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.growth, marginTop: 4 }}>{formatCurrency(forecast.predictedProfit)}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' }}>{t('forecast.predictedItems')}</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 4 }}>{forecast.predictedItems}</Text>
              </View>
            </Card>
          </View>
        )}

        {/* Sales List */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>
              {t('eventDetail.salesCount', { count: sales.length })}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={handleQuickSale}
                style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="flash" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.primary, fontWeight: '500' }}>{t('eventDetail.quickButton')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSale}
                style={{ backgroundColor: colors.copperLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="create-outline" size={14} color={colors.copper} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.copper, fontWeight: '500' }}>{t('eventDetail.addButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {sales.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <View style={{ alignItems: "center", paddingVertical: 8 }}>
                <Image 
                  source={MascotImages.winkPhone} 
                  style={{ width: 80, height: 80, marginBottom: 12 }} 
                  resizeMode="contain" 
                />
                <Text style={{ textAlign: "center", color: colors.textTertiary }}>
                  {t('eventDetail.noSalesYet')}
                </Text>
              </View>
            </Card>
          ) : (
            sales.map((sale) => (
              <SaleItem
                key={sale.id}
                itemName={sale.itemName}
                quantity={sale.quantity}
                salePrice={sale.salePrice}
                costPerItem={sale.costPerItem}
                onPress={() => handleEditSale(sale.id)}
                onLongPress={() => handleDeleteSale(sale.id, sale.itemName)}
              />
            ))
          )}
        </View>

        {/* Notes */}
        {event.notes && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 }}>{t('eventDetail.notes')}</Text>
            <Card variant="outlined" padding="md">
              <Text style={{ color: colors.textSecondary }}>{event.notes}</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Sale Button */}
      <View style={{ position: "absolute", bottom: 32, right: 20, left: 20 }}>
        <PrimaryButton
          title={t('eventDetail.addSaleFloating')}
          onPress={handleAddSale}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};
