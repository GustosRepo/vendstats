import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from './types';
import { colors } from '../theme';
import { hasSeenOnboarding, setOnboardingComplete } from '../storage';

// Navigators
import { TabNavigator } from './TabNavigator';

// Screens
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { CreateEventScreen } from '../features/events/screens/CreateEventScreen';
import { EditEventScreen } from '../features/events/screens/EditEventScreen';
import { EditEventProductsScreen } from '../features/events/screens/EditEventProductsScreen';
import { EventDetailScreen } from '../features/events/screens/EventDetailScreen';
import { AddSaleScreen } from '../features/sales/screens/AddSaleScreen';
import { EditSaleScreen } from '../features/sales/screens/EditSaleScreen';
import { QuickSaleScreen } from '../features/sales/screens/QuickSaleScreen';
import { AddProductScreen, EditProductScreen, MenuDisplayScreen } from '../features/products/screens';
import { PaywallScreen } from '../features/subscription/screens/PaywallScreen';
import { PrivacyPolicyScreen } from '../features/settings/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../features/settings/screens/TermsOfServiceScreen';
import { BestSellersScreen } from '../features/stats/screens/BestSellersScreen';
import { EventComparisonScreen } from '../features/stats/screens/EventComparisonScreen';
import { EventRankingScreen } from '../features/stats/screens/EventRankingScreen';
import { EventReportScreen } from '../features/events/screens/EventReportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = hasSeenOnboarding();
    setShowOnboarding(!seen);
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingComplete();
    setShowOnboarding(false);
  };

  // Loading state
  if (showOnboarding === null) {
    return null;
  }

  // Show onboarding
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="CreateEvent"
          component={CreateEventScreen}
          options={({ navigation }) => ({ 
            title: t('createEvent.title'),
            presentation: 'fullScreenModal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="EditEvent"
          component={EditEventScreen}
          options={{ 
            title: t('editEvent.title'),
          }}
        />
        
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={({ route }) => ({ 
            title: t('eventDetail.title'),
          })}
        />
        
        <Stack.Screen
          name="AddSale"
          component={AddSaleScreen}
          options={({ navigation }) => ({ 
            title: t('addSale.title'),
            presentation: 'fullScreenModal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="EditSale"
          component={EditSaleScreen}
          options={{ 
            title: t('editSale.title'),
          }}
        />
        
        <Stack.Screen
          name="QuickSale"
          component={QuickSaleScreen}
          options={({ navigation }) => ({ 
            title: t('quickSale.title'),
            presentation: 'fullScreenModal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="EditEventProducts"
          component={EditEventProductsScreen}
          options={({ navigation }) => ({ 
            title: t('editEventItems.title'),
            presentation: 'fullScreenModal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={({ navigation }) => ({ 
            title: t('addItem.title'),
            presentation: 'fullScreenModal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <Stack.Screen
          name="EditProduct"
          component={EditProductScreen}
          options={{ 
            title: t('editItem.title'),
          }}
        />
        
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ 
            title: '',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ 
            title: t('paywall.privacyPolicy'),
          }}
        />
        
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{ 
            title: t('paywall.termsOfUse'),
          }}
        />
        
        <Stack.Screen
          name="BestSellers"
          component={BestSellersScreen}
          options={{ 
            title: t('bestSellers.title'),
          }}
        />
        
        <Stack.Screen
          name="EventComparison"
          component={EventComparisonScreen}
          options={{ 
            title: t('comparison.title'),
          }}
        />
        
        <Stack.Screen
          name="EventRanking"
          component={EventRankingScreen}
          options={{ 
            title: t('ranking.title'),
          }}
        />
        
        <Stack.Screen
          name="MenuDisplay"
          component={MenuDisplayScreen}
          options={{ 
            title: t('menu.title'),
          }}
        />
        
        <Stack.Screen
          name="EventReport"
          component={EventReportScreen}
          options={{ 
            title: t('eventReport.title'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
