import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Image, Modal, Platform, ActionSheetIOS } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { TabScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { 
  getSubscriptionState, 
  hasPremiumAccess, 
  getRemainingTrialDays,
  getLowStockThreshold,
  setLowStockThreshold,
  setLanguage,
  getCurrency,
  setCurrency,
  activateSubscription,
  expireSubscription,
} from '../../../storage';
import { getQrCodeUri, setQrCodeUri, getReminderEnabled, setReminderEnabled } from '../../../storage/settings';
import { mmkvStorage } from '../../../storage/mmkv';
import { getAllEvents, getAllSales } from '../../../storage';
import { SubscriptionState } from '../../../types';
import { colors, shadows, radius } from '../../../theme';
import { changeLanguage, LANGUAGES, SupportedLanguage } from '../../../i18n';

// Settings Row Component
const SettingsRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  badge?: string;
  isLast?: boolean;
}> = ({ icon, title, subtitle, value, onPress, showChevron = true, danger, badge, isLast }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.divider,
    }}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={{ 
      width: 36, 
      height: 36, 
      borderRadius: 10, 
      backgroundColor: danger ? colors.dangerLight : colors.primaryLight, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginRight: 14 
    }}>
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
    </View>
    <View style={{ flex: 1, marginRight: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: '500', color: danger ? colors.danger : colors.textPrimary }} numberOfLines={1}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }} numberOfLines={2}>{subtitle}</Text>}
    </View>
    {badge && (
      <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8, flexShrink: 0 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>{badge}</Text>
      </View>
    )}
    {value && <Text style={{ fontSize: 15, color: colors.textSecondary, marginRight: 8, flexShrink: 1, maxWidth: '40%', textAlign: 'right' }} numberOfLines={1}>{value}</Text>}
    {showChevron && onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
  </TouchableOpacity>
);

// Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={{ 
    fontSize: 12, 
    fontWeight: '600', 
    color: colors.textSecondary, 
    letterSpacing: 0.5, 
    textTransform: 'uppercase', 
    marginBottom: 12,
    marginTop: 8,
  }}>
    {title}
  </Text>
);

// Settings Card
const SettingsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: 16 }, shadows.sm]}>
    {children}
  </View>
);

export const SettingsScreen: React.FC<TabScreenProps<'Settings'>> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [trialDays, setTrialDays] = useState(0);
  const [lowStockThreshold, setLowStockThresholdState] = useState(5);
  const [showThresholdPicker, setShowThresholdPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [qrCodeUri, setQrCodeUriState] = useState<string | undefined>(undefined);
  const [reminderEnabled, setReminderEnabledState] = useState(false);

  const thresholdOptions = [1, 2, 3, 5, 10, 15, 20];

  const CURRENCIES = [
    { code: 'USD', symbol: '$', label: t('currency.usd') },
    { code: 'THB', symbol: '฿', label: t('currency.thb') },
    { code: 'MXN', symbol: '$', label: t('currency.mxn') },
    { code: 'EUR', symbol: '€', label: t('currency.eur') },
  ];

  const loadSettings = useCallback(() => {
    const state = getSubscriptionState();
    setSubscription(state);
    setIsPremium(hasPremiumAccess());
    setTrialDays(getRemainingTrialDays());
    setLowStockThresholdState(getLowStockThreshold());
    setQrCodeUriState(getQrCodeUri());
    setCurrentCurrency(getCurrency());
    setReminderEnabledState(getReminderEnabled());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleManageSubscription = () => {
    if (isPremium) {
      Alert.alert(
        t('settings.manageSubscriptionAlert'),
        t('settings.manageSubscriptionMessage'),
        [
          { text: t('common.ok') },
          { text: t('settings.openSettings'), onPress: () => Linking.openURL('app-settings:') },
        ]
      );
    } else {
      navigation.navigate('Paywall');
    }
  };

  const shareCSVFile = async (csv: string, suffix: string) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const fileName = `vendstats-${suffix}-${date}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: t('settings.exportVendStatsData'),
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert(t('settings.exportComplete'), `CSV: ${fileName}`, [{ text: t('common.ok') }]);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(t('settings.exportFailed'), t('settings.exportFailedMessage'));
    }
  };

  const buildAllDataCSV = (events: any[], sales: any[]) => {
    let csv = `${t('csv.eventName')},${t('csv.eventDate')},${t('csv.boothFee')},${t('csv.travelCost')},${t('csv.itemName')},${t('csv.quantity')},${t('csv.salePrice')},${t('csv.costPerItem')},${t('csv.revenue')},${t('csv.profit')}\n`;
    events.forEach(event => {
      const eventSales = sales.filter((s: any) => s.eventId === event.id);
      if (eventSales.length === 0) {
        csv += `"${event.name || ''}","${event.date || ''}",${event.boothFee ?? 0},${event.travelCost ?? 0},,,,,,\n`;
      } else {
        eventSales.forEach((sale: any) => {
          const qty = sale.quantity ?? 0;
          const price = sale.salePrice ?? 0;
          const cost = sale.costPerItem ?? 0;
          const revenue = qty * price;
          const profit = revenue - (qty * cost);
          csv += `"${event.name || ''}","${event.date || ''}",${event.boothFee ?? 0},${event.travelCost ?? 0},"${sale.itemName || ''}",${qty},${price},${cost},${revenue},${profit}\n`;
        });
      }
    });
    return csv;
  };

  const buildEventsCSV = (events: any[], sales: any[]) => {
    let csv = `${t('csv.eventName')},${t('csv.eventDate')},${t('csvExport.location')},${t('csv.boothFee')},${t('csv.travelCost')},${t('csvExport.supplies')},${t('csvExport.misc')},${t('csv.revenue')},${t('csv.profit')},${t('csvExport.itemsSold')}\n`;
    events.forEach(event => {
      const eventSales = sales.filter((s: any) => s.eventId === event.id);
      const revenue = eventSales.reduce((sum: number, s: any) => sum + (s.quantity ?? 0) * (s.salePrice ?? 0), 0);
      const cost = eventSales.reduce((sum: number, s: any) => sum + (s.quantity ?? 0) * (s.costPerItem ?? 0), 0);
      const expenses = (event.boothFee ?? 0) + (event.travelCost ?? 0) + (event.suppliesCost || 0) + (event.miscCost || 0);
      const profit = revenue - cost - expenses;
      const itemsSold = eventSales.reduce((sum: number, s: any) => sum + (s.quantity ?? 0), 0);
      csv += `"${event.name || ''}","${event.date || ''}","${event.location || ''}",${event.boothFee ?? 0},${event.travelCost ?? 0},${event.suppliesCost || 0},${event.miscCost || 0},${revenue},${profit},${itemsSold}\n`;
    });
    return csv;
  };

  const buildItemsCSV = (sales: any[]) => {
    const itemMap = new Map<string, { qty: number; revenue: number; cost: number; events: Set<string> }>();
    sales.forEach((s: any) => {
      const existing = itemMap.get(s.itemName) || { qty: 0, revenue: 0, cost: 0, events: new Set<string>() };
      existing.qty += s.quantity;
      existing.revenue += s.quantity * s.salePrice;
      existing.cost += s.quantity * s.costPerItem;
      existing.events.add(s.eventId);
      itemMap.set(s.itemName, existing);
    });
    let csv = `${t('csv.itemName')},${t('csv.quantity')},${t('csv.revenue')},${t('csv.profit')},${t('csvExport.margin')},${t('csvExport.eventsCount')}\n`;
    itemMap.forEach((data, name) => {
      const profit = data.revenue - data.cost;
      const margin = data.revenue > 0 ? ((profit / data.revenue) * 100).toFixed(1) : '0';
      csv += `"${name}",${data.qty},${data.revenue},${profit},${margin}%,${data.events.size}\n`;
    });
    return csv;
  };

  const buildExpensesCSV = (events: any[]) => {
    let csv = `${t('csv.eventName')},${t('csv.eventDate')},${t('csv.boothFee')},${t('csv.travelCost')},${t('csvExport.supplies')},${t('csvExport.misc')},${t('csvExport.totalExpenses')}\n`;
    events.forEach(event => {
      const total = (event.boothFee ?? 0) + (event.travelCost ?? 0) + (event.suppliesCost || 0) + (event.miscCost || 0);
      csv += `"${event.name || ''}","${event.date || ''}",${event.boothFee ?? 0},${event.travelCost ?? 0},${event.suppliesCost || 0},${event.miscCost || 0},${total}\n`;
    });
    return csv;
  };

  const handleExportCSV = async () => {
    if (!isPremium) {
      navigation.navigate('Paywall');
      return;
    }

    const events = getAllEvents();
    const sales = getAllSales();

    if (events.length === 0) {
      Alert.alert(t('settings.noData'), t('settings.noEventsToExport'));
      return;
    }

    const options = [
      t('csvExport.allData'),
      t('csvExport.eventsOnly'),
      t('csvExport.itemsOnly'),
      t('csvExport.expensesOnly'),
      t('common.cancel'),
    ];

    const handleChoice = async (index: number) => {
      switch (index) {
        case 0:
          await shareCSVFile(buildAllDataCSV(events, sales), 'all');
          break;
        case 1:
          await shareCSVFile(buildEventsCSV(events, sales), 'events');
          break;
        case 2:
          await shareCSVFile(buildItemsCSV(sales), 'items');
          break;
        case 3:
          await shareCSVFile(buildExpensesCSV(events), 'expenses');
          break;
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 4,
          title: t('csvExport.chooseExport'),
        },
        handleChoice
      );
    } else {
      Alert.alert(
        t('csvExport.chooseExport'),
        undefined,
        [
          { text: options[0], onPress: () => handleChoice(0) },
          { text: options[1], onPress: () => handleChoice(1) },
          { text: options[2], onPress: () => handleChoice(2) },
          { text: options[3], onPress: () => handleChoice(3) },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleResetData = () => {
    Alert.alert(
      t('settings.resetAllData'),
      t('settings.resetAllDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: () => {
            mmkvStorage.clearAll();
            Alert.alert(t('settings.dataReset'), t('settings.allDataCleared'));
            loadSettings();
          },
        },
      ]
    );
  };

  const handleChangeLanguage = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    await changeLanguage(lang);
    setShowLanguagePicker(false);
  };

  const getCurrentLanguageLabel = (): string => {
    const lang = LANGUAGES.find(l => l.code === i18n.language);
    return lang?.nativeLabel || 'English';
  };

  const handlePickQrImage = () => {
    Alert.alert(t('qrCode.selectQrImage'), undefined, [
      {
        text: t('qrCode.chooseFromLibrary'),
        onPress: async () => {
          const result = await (await import('expo-image-picker')).launchImageLibraryAsync({
            mediaTypes: (await import('expo-image-picker')).MediaTypeOptions.Images,
            quality: 0.9,
          });
          if (!result.canceled && result.assets[0]) {
            const dir = `${FileSystem.documentDirectory}qr/`;
            const dirInfo = await FileSystem.getInfoAsync(dir);
            if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
            const dest = `${dir}payment_qr_${Date.now()}.jpg`;
            await FileSystem.copyAsync({ from: result.assets[0].uri, to: dest });
            setQrCodeUri(dest);
            setQrCodeUriState(dest);
          }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleRemoveQrCode = () => {
    Alert.alert(t('qrCode.removeConfirm'), t('qrCode.removeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (qrCodeUri) {
            try { await FileSystem.deleteAsync(qrCodeUri, { idempotent: true }); } catch {}
          }
          setQrCodeUri(undefined);
          setQrCodeUriState(undefined);
        },
      },
    ]);
  };

  const getSubscriptionStatusText = (): string => {
    if (!subscription) return t('settings.unknown');
    
    switch (subscription.status) {
      case 'active':
        return t('settings.premiumActive');
      case 'trial':
        return t('settings.trialDaysLeft', { days: trialDays });
      case 'expired':
        return t('settings.expired');
      default:
        return t('settings.free');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>{t('settings.title')}</Text>
        </View>

        {/* Language Section */}
        <SectionHeader title={t('settings.language')} />
        <SettingsCard>
          <SettingsRow
            icon="language-outline"
            title={t('settings.language')}
            subtitle={t('settings.languageSubtitle')}
            value={getCurrentLanguageLabel()}
            onPress={() => setShowLanguagePicker(true)}
            isLast
          />
        </SettingsCard>

        {/* Currency Section */}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={t('settings.currency')} />
          <SettingsCard>
            <SettingsRow
              icon="cash-outline"
              title={t('settings.currency')}
              subtitle={t('settings.currencySubtitle')}
              value={CURRENCIES.find(c => c.code === currentCurrency)?.code || 'USD'}
              onPress={() => setShowCurrencyPicker(true)}
              isLast
            />
          </SettingsCard>
        </View>

        {/* Payment QR Section */}
        <View style={{ marginTop: 24 }}>
        <SectionHeader title={t('qrCode.paymentQr')} />
        <SettingsCard>
          <SettingsRow
            icon="qr-code-outline"
            title={t('qrCode.paymentQr')}
            subtitle={t('qrCode.paymentQrSubtitle')}
            value={qrCodeUri ? '✓' : t('qrCode.noQrSet')}
            onPress={() => {
              // Tap the floating QR button via the FAB — but we can also manage here
              if (qrCodeUri) {
                Alert.alert(t('qrCode.paymentQr'), undefined, [
                  { text: t('qrCode.changeQr'), onPress: handlePickQrImage },
                  { text: t('qrCode.removeQr'), style: 'destructive', onPress: handleRemoveQrCode },
                  { text: t('common.cancel'), style: 'cancel' },
                ]);
              } else {
                handlePickQrImage();
              }
            }}
            isLast
          />
        </SettingsCard>
        </View>

        {/* Inventory Section */}
        <View style={{ marginTop: 24 }}>
        <SectionHeader title={t('settings.inventory')} />
        <SettingsCard>
          <SettingsRow
            icon="alert-circle-outline"
            title={t('settings.lowItemAlert')}
            subtitle={t('settings.lowItemAlertSubtitle', { threshold: lowStockThreshold })}
            value={String(lowStockThreshold)}
            onPress={() => setShowThresholdPicker(true)}
          />
          <SettingsRow
            icon="notifications-outline"
            title={t('reminder.title')}
            subtitle={t('reminder.subtitle')}
            value={reminderEnabled ? t('reminder.enabled') : t('reminder.disabled')}
            onPress={() => {
              const next = !reminderEnabled;
              setReminderEnabled(next);
              setReminderEnabledState(next);
            }}
            isLast
          />
        </SettingsCard>
        </View>

        {/* Subscription Section */}
        <View style={{ marginTop: 24 }}>
        <SectionHeader title={t('settings.subscription')} />
        <SettingsCard>
          <SettingsRow
            icon="diamond-outline"
            title={getSubscriptionStatusText()}
            subtitle={isPremium ? t('settings.manageSubscription') : t('settings.upgradeToPremium')}
            onPress={handleManageSubscription}
          />
          {!isPremium && (
            <View style={{ paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.divider }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>{t('settings.premiumFeatures')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{t('settings.unlimitedEvents')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{t('settings.advancedStatistics')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{t('settings.csvExport')}</Text>
            </View>
          )}
        </SettingsCard>
        </View>

        {/* Data Section */}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={t('settings.data')} />
          <SettingsCard>
            <SettingsRow
              icon="document-text-outline"
              title={t('settings.exportCSV')}
              subtitle={isPremium ? t('settings.exportAllData') : t('settings.premiumFeature')}
              onPress={handleExportCSV}
              badge={!isPremium ? t('settings.pro') : undefined}
            />
            <SettingsRow
              icon="trash-outline"
              title={t('settings.resetAllData')}
              subtitle={t('settings.deleteAllEventsAndSales')}
              onPress={handleResetData}
              danger
              showChevron={false}
              isLast
            />
          </SettingsCard>
        </View>

        {/* About Section */}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title={t('settings.about')} />
          <SettingsCard>
            <SettingsRow
              icon="information-circle-outline"
              title={t('settings.version')}
              value="1.0.0"
              showChevron={false}
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              title={t('settings.privacyPolicy')}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <SettingsRow
              icon="document-outline"
              title={t('settings.termsOfService')}
              onPress={() => navigation.navigate('TermsOfService')}
              isLast
            />
          </SettingsCard>
        </View>

        {/* DEV TOOLS — toggle subscription tier */}
        {__DEV__ && (
          <View style={{ marginTop: 24 }}>
            <SectionHeader title="🛠 DEV TOOLS" />
            <SettingsCard>
              <TouchableOpacity
                onPress={() => {
                  if (isPremium) {
                    expireSubscription();
                  } else {
                    activateSubscription();
                  }
                  loadSettings();
                  Alert.alert('Tier Changed', isPremium ? 'Switched to FREE' : 'Switched to PRO');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                }}
              >
                <Ionicons name="swap-horizontal-outline" size={22} color={colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    {isPremium ? 'Switch to FREE' : 'Switch to PRO'}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>
                    Current: {isPremium ? '✅ PRO' : '🔒 FREE'}
                  </Text>
                </View>
                <View style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: isPremium ? colors.growth + '20' : colors.primaryLight,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isPremium ? colors.growth : colors.primary }}>
                    {isPremium ? 'PRO' : 'FREE'}
                  </Text>
                </View>
              </TouchableOpacity>
            </SettingsCard>
          </View>
        )}

        {/* App Branding */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}>
          <Image 
            source={MascotImages.smile} 
            style={{ width: 80, height: 80, marginBottom: 12 }} 
            resizeMode="contain" 
          />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>VendStats</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4 }}>{t('settings.appTagline')}</Text>
        </View>
      </ScrollView>

      {/* Low Stock Threshold Picker Modal */}
      <Modal
        visible={showThresholdPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThresholdPicker(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowThresholdPicker(false)}
        >
          <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, width: '80%', maxWidth: 320 }, shadows.lg]}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
              {t('settings.lowItemAlertModalTitle')}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              {t('settings.lowItemAlertModalSubtitle')}
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {thresholdOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    setLowStockThreshold(option);
                    setLowStockThresholdState(option);
                    setShowThresholdPicker(false);
                  }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: lowStockThreshold === option ? colors.primary : colors.divider,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: lowStockThreshold === option ? 'white' : colors.textPrimary,
                  }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={() => setShowThresholdPicker(false)}
              style={{ marginTop: 20, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, width: '80%', maxWidth: 320 }, shadows.lg]}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
              {t('settings.currency')}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              {t('settings.currencySubtitle')}
            </Text>
            
            <View style={{ gap: 10 }}>
              {CURRENCIES.map(curr => (
                <TouchableOpacity
                  key={curr.code}
                  onPress={() => {
                    setCurrency(curr.code);
                    setCurrentCurrency(curr.code);
                    setShowCurrencyPicker(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: currentCurrency === curr.code ? colors.primaryLight : colors.divider,
                    borderWidth: currentCurrency === curr.code ? 2 : 0,
                    borderColor: currentCurrency === curr.code ? colors.primary : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginRight: 12 }}>{curr.symbol}</Text>
                    <View>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: currentCurrency === curr.code ? colors.primary : colors.textPrimary,
                      }}>
                        {curr.code}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 1 }}>
                        {curr.label}
                      </Text>
                    </View>
                  </View>
                  {currentCurrency === curr.code && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(false)}
              style={{ marginTop: 20, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowLanguagePicker(false)}
        >
          <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, width: '80%', maxWidth: 320 }, shadows.lg]}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
              {t('settings.language')}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              {t('settings.languageSubtitle')}
            </Text>
            
            <View style={{ gap: 10 }}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleChangeLanguage(lang.code)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: i18n.language === lang.code ? colors.primaryLight : colors.divider,
                    borderWidth: i18n.language === lang.code ? 2 : 0,
                    borderColor: i18n.language === lang.code ? colors.primary : 'transparent',
                  }}
                >
                  <View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: i18n.language === lang.code ? colors.primary : colors.textPrimary,
                    }}>
                      {lang.nativeLabel}
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: colors.textTertiary,
                      marginTop: 2,
                    }}>
                      {lang.label}
                    </Text>
                  </View>
                  {i18n.language === lang.code && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={() => setShowLanguagePicker(false)}
              style={{ marginTop: 20, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
