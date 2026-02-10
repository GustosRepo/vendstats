import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import { AddProductScreen, EditProductScreen } from '../features/products/screens';
import { PaywallScreen } from '../features/subscription/screens/PaywallScreen';
import { PrivacyPolicyScreen } from '../features/settings/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../features/settings/screens/TermsOfServiceScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
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
          options={{ 
            title: 'New Event',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="EditEvent"
          component={EditEventScreen}
          options={{ 
            title: 'Edit Event',
          }}
        />
        
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{ 
            title: 'Event Dashboard',
          }}
        />
        
        <Stack.Screen
          name="AddSale"
          component={AddSaleScreen}
          options={{ 
            title: 'Add Sale',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="EditSale"
          component={EditSaleScreen}
          options={{ 
            title: 'Edit Sale',
          }}
        />
        
        <Stack.Screen
          name="QuickSale"
          component={QuickSaleScreen}
          options={{ 
            title: 'Quick Sale',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="EditEventProducts"
          component={EditEventProductsScreen}
          options={{ 
            title: 'Edit Products',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{ 
            title: 'Add Product',
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="EditProduct"
          component={EditProductScreen}
          options={{ 
            title: 'Edit Product',
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
            title: 'Privacy Policy',
          }}
        />
        
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{ 
            title: 'Terms of Service',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
