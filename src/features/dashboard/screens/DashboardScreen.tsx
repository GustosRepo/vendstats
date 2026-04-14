import React, { useState, useCallback, useRef } from 'react';
import { ScrollView, View, Text, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { EmptyState } from '../../../components';
import { PressableScale, AnimatedListItem, FadeIn } from '../../../components/animations';
import { getAllEvents, getAllSales, getQuickSaleItems, getLowStockThreshold } from '../../../storage';
import { hasPremiumAccess } from '../../../storage';
import { getDataVersion } from '../../../storage/mmkv';
import { getReminderEnabled } from '../../../storage/settings';
import { calculateGlobalStats } from '../../../utils/calculations';
import { formatCurrency } from '../../../utils/currency';
import { Event, GlobalStats, QuickSaleItem } from '../../../types';
import { colors, shadows, radius } from '../../../theme';
import { MascotImages } from '../../../../assets';

const { width: screenWidth } = Dimensions.get('window');

// Pill button with icon
const PillButton: React.FC<{ label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void }> = ({ label, icon, onPress }) => (
  <PressableScale
    onPress={onPress}
    style={{
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    {icon && <Ionicons name={icon} size={15} color="#FFFFFF" style={{ marginRight: 5 }} />}
    <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
  </PressableScale>
);

// Hero revenue card - clean and simple
const HeroRevenueCard: React.FC<{ revenue: number; label: string }> = ({ revenue, label }) => (
  <View style={[{ 
    backgroundColor: colors.surface, 
    borderRadius: radius.xl, 
    padding: 24,
  }, shadows.lg]}>
    <Text style={{ 
      fontSize: 11, 
      fontWeight: '600', 
      color: colors.textTertiary, 
      letterSpacing: 0.8, 
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      {label}
    </Text>
    <Text style={{ 
      fontSize: 44, 
      fontWeight: '700', 
      color: colors.textPrimary, 
      letterSpacing: -1.5,
    }}>
      {formatCurrency(revenue)}
    </Text>
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
  <PressableScale 
    onPress={onPress} 
    scaleValue={0.98}
    hapticType="selection"
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.divider,
    }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
        {event.name}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 3 }}>
        {(() => { try { const d = new Date(event.date); return isNaN(d.getTime()) ? (event.date ?? '') : d.toLocaleDateString(); } catch { return event.date ?? ''; } })()}
      </Text>
    </View>
    <Text style={{ fontSize: 17, fontWeight: '700', color: profit >= 0 ? colors.growth : colors.loss, marginRight: 12 }}>
      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
    </Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </PressableScale>
);

export const DashboardScreen: React.FC<TabScreenProps<'Dashboard'>> = ({ navigation }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [eventProfits, setEventProfits] = useState<Record<string, number>>({});
  const [lowStockItems, setLowStockItems] = useState<QuickSaleItem[]>([]);
  const [hasProducts, setHasProducts] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const lastLoadedVersion = useRef(-1);

  const loadData = useCallback((force = false) => {
    // Skip if data hasn't changed since last load
    const currentVersion = getDataVersion();
    if (!force && currentVersion === lastLoadedVersion.current) return;
    lastLoadedVersion.current = currentVersion;

    const allEvents = getAllEvents();
    const allSales = getAllSales();
    const globalStats = calculateGlobalStats(allEvents, allSales);
    
    // Check for low stock items based on user's threshold setting
    const threshold = getLowStockThreshold();
    const allProducts = getQuickSaleItems();
    setHasProducts(allProducts.length > 0);
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
      const expenses = (event.boothFee ?? 0) + (event.travelCost ?? 0);
      profits[event.id] = revenue - costs - expenses;
    });

    setEvents(allEvents.sort((a, b) => {
      const ta = new Date(b.date).getTime();
      const tb = new Date(a.date).getTime();
      return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
    }));
    setStats(globalStats);
    setEventProfits(profits);

    // Daily reminder check
    if (getReminderEnabled() && allEvents.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const salesToday = allSales.filter(s => s.createdAt.startsWith(today));
      setShowReminder(salesToday.length === 0);
    } else {
      setShowReminder(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  const recentEvents = events.slice(0, 3);
  const hasEvents = events.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header Section */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingTop: 16, 
          paddingBottom: 28,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
              <Image 
                source={MascotImages.wink} 
                style={{ width: 56, height: 56, marginRight: 12 }} 
                resizeMode="contain" 
              />
              <View style={{ flexShrink: 1 }}>
                <Text 
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: colors.textPrimary, 
                    letterSpacing: -0.5,
                    marginBottom: 2,
                  }}>
                  VendStats 
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: colors.textSecondary,
                }} numberOfLines={1}>
                  {hasEvents ? t('dashboard.eventsTracked', { count: events.length }) : !hasProducts ? t('dashboard.addItemsToStart') : t('dashboard.getStarted')}
                </Text>
              </View>
            </View>
            <PillButton 
              icon={!hasProducts ? 'add-circle-outline' : 'calendar-outline'}
              label={!hasProducts ? t('dashboard.addItem') : t('dashboard.newEvent')} 
              onPress={() => !hasProducts ? navigation.navigate('AddProduct') : navigation.navigate('CreateEvent')} 
            />
          </View>
        </View>

        {!hasEvents ? (
          <View style={{ paddingHorizontal: 24 }}>
            {!hasProducts ? (
              <EmptyState
                title={t('dashboard.welcomeTitle')}
                message={t('dashboard.welcomeMessage')}
                actionLabel={t('dashboard.addItems')}
                onAction={() => navigation.navigate('AddProduct')}
                icon={<Image source={MascotImages.winkPhone} style={{ width: 120, height: 120 }} resizeMode="contain" />}
              />
            ) : (
              <EmptyState
                title={t('dashboard.itemsReadyTitle')}
                message={t('dashboard.itemsReadyMessage')}
                actionLabel={t('dashboard.createEvent')}
                onAction={() => navigation.navigate('CreateEvent')}
                icon={<Image source={MascotImages.tent} style={{ width: 120, height: 120 }} resizeMode="contain" />}
              />
            )}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24 }}>
            {/* Hero Revenue Card */}
            <AnimatedListItem index={0} type="slideUp">
              <View style={{ marginBottom: 16 }}>
                <HeroRevenueCard revenue={stats?.totalRevenue || 0} label={t('dashboard.totalRevenue')} />
              </View>
            </AnimatedListItem>

            {/* Secondary Metrics Row */}
            <AnimatedListItem index={1} type="slideUp">
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                <MetricCard 
                  label={t('dashboard.netProfit')} 
                  value={formatCurrency(stats?.totalProfit || 0)} 
                />
                <MetricCard 
                  label={t('dashboard.events')} 
                  value={String(events.length)} 
                />
              </View>
            </AnimatedListItem>

            {/* Daily Reminder Banner */}
            {showReminder && (
              <AnimatedListItem index={2} type="slideUp">
                <TouchableOpacity
                  onPress={() => recentEvents.length > 0 ? navigation.navigate('QuickSale', { eventId: recentEvents[0].id }) : null}
                  style={[{
                    backgroundColor: colors.warning + '18',
                    borderRadius: radius.xl,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: colors.warning + '40',
                  }]}
                >
                  <Ionicons name="notifications-outline" size={22} color={colors.warning} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{t('reminder.bannerTitle')}</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{t('reminder.bannerMessage')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </AnimatedListItem>
            )}

            {/* Low Stock Alert — Pro only */}
            {lowStockItems.length > 0 && hasPremiumAccess() && (
              <AnimatedListItem index={2} type="slideUp">
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="alert-circle" size={16} color={colors.stockOut} style={{ marginRight: 6 }} />
                      <Text style={{ 
                        fontSize: 11, 
                        fontWeight: '600', 
                        color: colors.stockOut, 
                        letterSpacing: 0.8, 
                        textTransform: 'uppercase',
                      }}>
                        {t('dashboard.lowItemAlert')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>{t('common.viewAll')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[{ 
                  backgroundColor: colors.surface, 
                  borderRadius: radius.xl, 
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }, shadows.md]}>
                  {/* Out-of-stock summary */}
                  {lowStockItems.filter(i => (i.stockCount || 0) === 0).length > 0 && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.stockOut + '10',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 8,
                    }}>
                      <Ionicons name="close-circle" size={18} color={colors.stockOut} style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.stockOut, flex: 1 }}>
                        {t('inventory.outOfStockCount', { count: lowStockItems.filter(i => (i.stockCount || 0) === 0).length })}
                      </Text>
                    </View>
                  )}
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
                        backgroundColor: (item.stockCount || 0) === 0 ? colors.stockOutBg : colors.stockLowBg,
                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
                      }}>
                        <Text style={{ 
                          fontSize: 13, 
                          fontWeight: '700', 
                          color: (item.stockCount || 0) === 0 ? colors.stockOut : colors.stockLow,
                        }}>
                          {(item.stockCount || 0) === 0 ? t('dashboard.outOfItems') : t('dashboard.itemsLeft', { count: item.stockCount })}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {lowStockItems.length > 3 && (
                    <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingTop: 8 }}>
                      {t('dashboard.moreItemsLow', { count: lowStockItems.length - 3 })}
                    </Text>
                  )}
                  </View>
                </View>
              </AnimatedListItem>
            )}

            {/* Recent Events Section */}
            {recentEvents.length > 0 && (
              <AnimatedListItem index={lowStockItems.length > 0 ? 3 : 2} type="slideUp">
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Text style={{ 
                      fontSize: 11, 
                      fontWeight: '600', 
                      color: colors.textTertiary, 
                      letterSpacing: 0.8, 
                      textTransform: 'uppercase',
                    }}>
                      {t('dashboard.recentEvents')}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>{t('common.viewAll')}</Text>
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
              </AnimatedListItem>
            )}

            {/* Quick Action */}
            {recentEvents.length > 0 && (
              <AnimatedListItem index={lowStockItems.length > 0 ? 4 : 3} type="slideUp">
                <PressableScale
                  onPress={() => navigation.navigate('QuickSale', { eventId: recentEvents[0].id })}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: radius.xl,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    ...shadows.md,
                  }}
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
                      {t('dashboard.quickSale')}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
                      {t('dashboard.quickSaleSubtitle')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </PressableScale>
              </AnimatedListItem>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
