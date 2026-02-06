import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { colors } from '../theme';

// Navigators
import { TabNavigator } from './TabNavigator';

// Screens
import { CreateEventScreen } from '../features/events/screens/CreateEventScreen';
import { EditEventScreen } from '../features/events/screens/EditEventScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { AddSaleScreen } from '../features/sales/screens/AddSaleScreen';
import { EditSaleScreen } from '../features/sales/screens/EditSaleScreen';
import { QuickSaleScreen } from '../features/sales/screens/QuickSaleScreen';
import { PaywallScreen } from '../features/subscription/screens/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
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
          name="Paywall"
          component={PaywallScreen}
          options={{ 
            title: '',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
