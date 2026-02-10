import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Tab Navigator param list
export type TabParamList = {
  Dashboard: undefined;
  Events: undefined;
  Products: undefined;
  Stats: undefined;
  Settings: undefined;
};

// Root Stack Navigator param list
export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  EventDetail: { eventId: string };
  AddSale: { eventId: string };
  EditSale: { eventId: string; saleId: string };
  Paywall: undefined;
  QuickSale: { eventId: string };
  AddProduct: undefined;
  EditProduct: { productId: string };
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// Navigation prop types for use in screens
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
