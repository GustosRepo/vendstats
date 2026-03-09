import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList } from './types';
import { colors } from '../theme';
import { AnimatedTabIcon } from '../components/animations';
import { QrCodeFab } from '../components/QrCodeFab';
import { getQuickSaleItems, getLowStockThreshold, hasPremiumAccess } from '../storage';

// Screens
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { EventsScreen } from '../features/events/screens/EventsScreen';
import { ProductsScreen } from '../features/products/screens/ProductsScreen';
import { GlobalStatsScreen } from '../features/stats/screens/GlobalStatsScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Executive finance-grade icons - clean and minimal
const tabIcons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Events: { active: 'calendar', inactive: 'calendar-outline' },
  Products: { active: 'cube', inactive: 'cube-outline' },
  Stats: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export const TabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const [lowStockBadge, setLowStockBadge] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (hasPremiumAccess()) {
        const threshold = getLowStockThreshold();
        const products = getQuickSaleItems();
        const count = products.filter(p => p.stockCount !== undefined && p.stockCount <= threshold).length;
        setLowStockBadge(count);
      } else {
        setLowStockBadge(0);
      }
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const iconSet = tabIcons[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
          const iconName = focused ? iconSet.active : iconSet.inactive;
          const badge = route.name === 'Products' ? lowStockBadge : undefined;
          return <AnimatedTabIcon name={iconName} size={22} color={color} focused={focused} badge={badge} />;
        },
        // Deep money teal for active, muted gray for inactive
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          paddingBottom: 25,
          paddingTop: 12,
          paddingHorizontal: 28,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
          letterSpacing: 0.1,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: t('tabs.dashboard') }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ tabBarLabel: t('tabs.events') }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ tabBarLabel: t('tabs.items') }}
      />
      <Tab.Screen 
        name="Stats" 
        component={GlobalStatsScreen}
        options={{ tabBarLabel: t('tabs.stats') }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: t('tabs.settings') }}
      />
    </Tab.Navigator>
    <QrCodeFab />
    </View>
  );
};
