import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenProps } from '../../../navigation/types';
import { TexturePattern } from '../../../components/TexturePattern';
import { MascotImages } from '../../../../assets';
import { 
  getSubscriptionState, 
  hasPremiumAccess, 
  getRemainingTrialDays,
} from '../../../storage';
import { mmkvStorage } from '../../../storage/mmkv';
import { getAllEvents, getAllSales } from '../../../storage';
import { SubscriptionState } from '../../../types';
import { colors, shadows, radius } from '../../../theme';

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
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: '500', color: danger ? colors.danger : colors.textPrimary }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 2 }}>{subtitle}</Text>}
    </View>
    {badge && (
      <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>{badge}</Text>
      </View>
    )}
    {value && <Text style={{ fontSize: 15, color: colors.textSecondary, marginRight: 8 }}>{value}</Text>}
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
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [trialDays, setTrialDays] = useState(0);

  const loadSettings = useCallback(() => {
    const state = getSubscriptionState();
    setSubscription(state);
    setIsPremium(hasPremiumAccess());
    setTrialDays(getRemainingTrialDays());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleManageSubscription = () => {
    if (isPremium) {
      Alert.alert(
        'Manage Subscription',
        'You can manage your subscription in your device settings.',
        [
          { text: 'OK' },
          { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
        ]
      );
    } else {
      navigation.navigate('Paywall');
    }
  };

  const handleExportCSV = async () => {
    if (!isPremium) {
      navigation.navigate('Paywall');
      return;
    }

    const events = getAllEvents();
    const sales = getAllSales();

    let csv = 'Event Name,Event Date,Booth Fee,Travel Cost,Item Name,Quantity,Sale Price,Cost Per Item,Revenue,Profit\n';

    events.forEach(event => {
      const eventSales = sales.filter(s => s.eventId === event.id);
      
      if (eventSales.length === 0) {
        csv += `"${event.name}","${event.date}",${event.boothFee},${event.travelCost},,,,,,\n`;
      } else {
        eventSales.forEach(sale => {
          const revenue = sale.quantity * sale.salePrice;
          const profit = revenue - (sale.quantity * sale.costPerItem);
          csv += `"${event.name}","${event.date}",${event.boothFee},${event.travelCost},"${sale.itemName}",${sale.quantity},${sale.salePrice},${sale.costPerItem},${revenue},${profit}\n`;
        });
      }
    });

    Alert.alert(
      'Export CSV',
      'CSV export would be saved to your device. This feature requires expo-sharing and expo-file-system to be fully implemented.',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all events, sales, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            mmkvStorage.clearAll();
            Alert.alert('Data Reset', 'All data has been cleared.');
            loadSettings();
          },
        },
      ]
    );
  };

  const getSubscriptionStatusText = (): string => {
    if (!subscription) return 'Unknown';
    
    switch (subscription.status) {
      case 'active':
        return 'Premium Active';
      case 'trial':
        return `Trial (${trialDays} days left)`;
      case 'expired':
        return 'Expired';
      default:
        return 'Free';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TexturePattern />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>Settings</Text>
        </View>

        {/* Subscription Section */}
        <SectionHeader title="Subscription" />
        <SettingsCard>
          <SettingsRow
            icon="diamond-outline"
            title={getSubscriptionStatusText()}
            subtitle={isPremium ? 'Manage your subscription' : 'Upgrade to Premium'}
            onPress={handleManageSubscription}
          />
          {!isPremium && (
            <View style={{ paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.divider }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>Premium Features:</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>• Unlimited events</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>• Advanced statistics</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>• CSV export</Text>
            </View>
          )}
        </SettingsCard>

        {/* Data Section */}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="Data" />
          <SettingsCard>
            <SettingsRow
              icon="document-text-outline"
              title="Export CSV"
              subtitle={isPremium ? 'Export all data' : 'Premium feature'}
              onPress={handleExportCSV}
              badge={!isPremium ? 'PRO' : undefined}
            />
            <SettingsRow
              icon="trash-outline"
              title="Reset All Data"
              subtitle="Delete all events and sales"
              onPress={handleResetData}
              danger
              showChevron={false}
              isLast
            />
          </SettingsCard>
        </View>

        {/* About Section */}
        <View style={{ marginTop: 24 }}>
          <SectionHeader title="About" />
          <SettingsCard>
            <SettingsRow
              icon="information-circle-outline"
              title="Version"
              value="1.0.0"
              showChevron={false}
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => {}}
            />
            <SettingsRow
              icon="document-outline"
              title="Terms of Service"
              onPress={() => {}}
              isLast
            />
          </SettingsCard>
        </View>

        {/* App Branding */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}>
          <Image 
            source={MascotImages.smile} 
            style={{ width: 80, height: 80, marginBottom: 12 }} 
            resizeMode="contain" 
          />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>VendStats</Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 4 }}>Track your pop-up profits</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
