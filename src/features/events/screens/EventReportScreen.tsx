import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { RootStackScreenProps } from '../../../navigation/types';
import { Card, PrimaryButton } from '../../../components';
import { TexturePattern } from '../../../components/TexturePattern';
import { getEventById, getSalesByEventId, getQuickSaleItems, hasPremiumAccess } from '../../../storage';
import { calculateEventStats } from '../../../utils/calculations';
import {
  generateFreeReport,
  generateProReport,
  formatFreeReportText,
  formatProReportText,
  FreeReport,
  ProReport,
} from '../../../utils/report';
import { Event, Sale, EventStats } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

export const EventReportScreen: React.FC<RootStackScreenProps<'EventReport'>> = ({
  navigation,
  route,
}) => {
  const { eventId } = route.params;
  const { t } = useTranslation();
  const isPremium = hasPremiumAccess();
  const viewShotRef = useRef<ViewShot>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [freeReport, setFreeReport] = useState<FreeReport | null>(null);
  const [proReport, setProReport] = useState<ProReport | null>(null);

  useFocusEffect(
    useCallback(() => {
      const eventData = getEventById(eventId);
      const salesData = getSalesByEventId(eventId);
      if (!eventData) return;

      setEvent(eventData);
      setSales(salesData);
      const eventStats = calculateEventStats(eventData, salesData);
      setStats(eventStats);
      setFreeReport(generateFreeReport(eventData, eventStats));

      if (isPremium) {
        // Build sell-through data
        const quickItems = getQuickSaleItems();
        const itemSales = new Map<string, number>();
        salesData.forEach(s => {
          itemSales.set(s.itemName, (itemSales.get(s.itemName) || 0) + s.quantity);
        });
        const stData = quickItems
          .filter(item => {
            if (eventData.productIds && eventData.productIds.length > 0) {
              return eventData.productIds.includes(item.id);
            }
            return true;
          })
          .filter(item => item.stockCount !== undefined && item.stockCount > 0)
          .map(item => {
            const sold = itemSales.get(item.itemName) || 0;
            const prepared = (item.stockCount || 0) + sold;
            const rate = prepared > 0 ? Math.min((sold / prepared) * 100, 100) : 0;
            return { name: item.itemName, sold, prepared, rate };
          })
          .filter(item => item.prepared > 0);

        setProReport(generateProReport(eventData, salesData, eventStats, stData));
      }
    }, [eventId, isPremium])
  );

  const handleShareImage = async () => {
    if (!viewShotRef.current) return;
    try {
      const capture = viewShotRef.current.capture;
      if (!capture) return;
      const uri = await capture();

      const dest = `${FileSystem.cacheDirectory}vendstats-report-${Date.now()}.png`;
      await FileSystem.copyAsync({ from: uri, to: dest });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(dest, {
          mimeType: 'image/png',
          dialogTitle: t('eventReport.share'),
          UTI: 'public.png',
        });
      } else {
        // Fallback to text
        handleShareText();
      }
    } catch (e) {
      console.error('Report share error:', e);
      handleShareText();
    }
  };

  const handleShareText = async () => {
    const text = isPremium && proReport
      ? formatProReportText(proReport)
      : freeReport
        ? formatFreeReportText(freeReport)
        : '';
    if (!text) return;
    try {
      await Share.share({ message: text });
    } catch {}
  };

  if (!event || !stats || !freeReport) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <TexturePattern />
        <Text style={{ color: colors.textTertiary }}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <TexturePattern />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Capturable Report Card ── */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
          style={{ margin: 20 }}
        >
          <View style={[{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            overflow: 'hidden',
          }, shadows.lg]}>
            {/* Card Header Band */}
            <View style={{
              backgroundColor: colors.primary,
              paddingVertical: 20,
              paddingHorizontal: 24,
            }}>
              <Text style={{
                fontSize: 22,
                fontWeight: '800',
                color: '#FFFFFF',
                letterSpacing: -0.3,
              }}>
                {event.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                  {freeReport.date}
                </Text>
              </View>
              {event.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    {event.location}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Profit Hero */}
            <View style={{
              paddingVertical: 24,
              paddingHorizontal: 24,
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                {t('eventReport.netProfit')}
              </Text>
              <Text style={{
                fontSize: 44,
                fontWeight: '800',
                color: freeReport.isProfitable ? colors.growth : colors.danger,
                letterSpacing: -1,
              }}>
                {freeReport.profit}
              </Text>
            </View>

            {/* Summary Row */}
            <View style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}>
              <View style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.divider }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  {t('common.revenue')}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                  {freeReport.revenue}
                </Text>
              </View>
              <View style={{ flex: 1, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  {t('eventReport.expenses')}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                  {freeReport.expenses}
                </Text>
              </View>
            </View>

            {/* Pro Metrics (only for premium) */}
            {isPremium && proReport ? (
              <>
                {/* Key Metrics Grid */}
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  borderBottomWidth: proReport.itemBreakdown.length > 0 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}>
                  <MetricCell
                    label={t('report.itemsSold')}
                    value={String(proReport.itemsSold)}
                    icon="cart-outline"
                    borderRight
                    borderBottom
                  />
                  <MetricCell
                    label={t('eventReport.profitMargin')}
                    value={proReport.profitMargin}
                    icon="pie-chart-outline"
                    borderBottom
                  />
                  {proReport.topSeller ? (
                    <MetricCell
                      label={t('report.bestSeller')}
                      value={proReport.topSeller.name}
                      subValue={`×${proReport.topSeller.quantity}`}
                      icon="star-outline"
                      borderRight
                    />
                  ) : (
                    <MetricCell
                      label={t('eventReport.avgItemMargin')}
                      value={proReport.avgItemMargin}
                      icon="analytics-outline"
                      borderRight
                    />
                  )}
                  {proReport.sellThroughRate ? (
                    <MetricCell
                      label={t('eventReport.sellThrough')}
                      value={proReport.sellThroughRate}
                      icon="sync-outline"
                    />
                  ) : (
                    <MetricCell
                      label={proReport.topSeller ? t('eventReport.avgItemMargin') : t('eventReport.sellThrough')}
                      value={proReport.topSeller ? proReport.avgItemMargin : '—'}
                      icon={proReport.topSeller ? 'analytics-outline' : 'sync-outline'}
                    />
                  )}
                </View>

                {/* Item Breakdown */}
                {proReport.itemBreakdown.length > 0 && (
                  <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: colors.textTertiary,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}>
                      {t('eventReport.itemBreakdown')}
                    </Text>
                    {proReport.itemBreakdown.slice(0, 6).map((item, i) => (
                      <View
                        key={item.name}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 8,
                          borderBottomWidth: i < Math.min(proReport.itemBreakdown.length, 6) - 1 ? 1 : 0,
                          borderBottomColor: colors.divider,
                        }}
                      >
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.primaryLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                            {i + 1}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                            {t('eventReport.itemDetail', { qty: item.qty, revenue: item.revenue })}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.growth }}>
                          {item.profit}
                        </Text>
                      </View>
                    ))}
                    {proReport.itemBreakdown.length > 6 && (
                      <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
                        +{proReport.itemBreakdown.length - 6} more
                      </Text>
                    )}
                  </View>
                )}
              </>
            ) : null}

            {/* Card Footer / Branding */}
            <View style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              backgroundColor: colors.primary + '08',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '500' }}>
                Tracked with{' '}
              </Text>
              <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>
                VendStats
              </Text>
              <Text style={{ fontSize: 11, marginLeft: 4 }}>📊</Text>
            </View>
          </View>
        </ViewShot>

        {/* Free user upsell — below the card, not in the captured image */}
        {!isPremium && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Card variant="outlined" padding="lg">
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Ionicons name="lock-closed" size={24} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                  {t('eventReport.unlockTitle')}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 4 }}>
                  {t('eventReport.unlockBullet1')}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 4 }}>
                  {t('eventReport.unlockBullet2')}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 4 }}>
                  {t('eventReport.unlockBullet3')}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 20 }}>
                  {t('eventReport.unlockBullet4')}
                </Text>
                <PrimaryButton
                  title={t('eventReport.upgradeCta')}
                  onPress={() => navigation.navigate('Paywall')}
                  size="md"
                />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          },
          shadows.sm,
        ]}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={handleShareText}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.primary,
            }}
            accessibilityRole="button"
            accessibilityLabel={t('eventReport.shareText')}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary }}>
              {t('eventReport.shareText')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShareImage}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: radius.lg,
              backgroundColor: colors.primary,
            }}
            accessibilityRole="button"
            accessibilityLabel={t('eventReport.shareImage')}
          >
            <Ionicons name="image-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>
              {t('eventReport.shareImage')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ── Metric Cell (for 2×2 grid) ── */
const MetricCell: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon: keyof typeof Ionicons.glyphMap;
  borderRight?: boolean;
  borderBottom?: boolean;
}> = ({ label, value, subValue, icon, borderRight, borderBottom }) => (
  <View style={{
    width: '50%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRightWidth: borderRight ? 1 : 0,
    borderRightColor: colors.divider,
    borderBottomWidth: borderBottom ? 1 : 0,
    borderBottomColor: colors.divider,
  }}>
    <Ionicons name={icon} size={18} color={colors.primary} style={{ marginBottom: 6 }} />
    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textTertiary, letterSpacing: 0.3, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }} numberOfLines={1}>
      {value}
    </Text>
    {subValue && (
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 2 }}>
        {subValue}
      </Text>
    )}
  </View>
);

/* ── Report Row (kept for text fallback reference) ── */
const ReportRow: React.FC<{
  label: string;
  value: string;
  icon: string;
  last?: boolean;
}> = ({ label, value, icon, last }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: colors.divider,
    }}
  >
    <Ionicons name={icon as any} size={18} color={colors.primary} style={{ marginRight: 12 }} />
    <Text style={{ flex: 1, fontSize: 14, color: colors.textSecondary }}>{label}</Text>
    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{value}</Text>
  </View>
);
