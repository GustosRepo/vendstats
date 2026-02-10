// Event Types
export interface Event {
  id: string;
  name: string;
  date: string; // ISO date string
  boothFee: number;
  travelCost: number;
  notes: string;
  productIds?: string[]; // Products brought to this event
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  name: string;
  date: string;
  boothFee: number;
  travelCost: number;
  notes?: string;
  productIds?: string[];
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

// Sale Types
export interface Sale {
  id: string;
  eventId: string;
  itemName: string;
  quantity: number;
  salePrice: number; // Price per item sold
  costPerItem: number; // Cost to vendor per item
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleInput {
  eventId: string;
  itemName: string;
  quantity: number;
  salePrice: number;
  costPerItem: number;
}

export interface UpdateSaleInput extends Partial<Omit<CreateSaleInput, 'eventId'>> {
  id: string;
}

// Stats Types
export interface EventStats {
  totalRevenue: number;
  totalCostOfGoods: number;
  totalExpenses: number; // boothFee + travelCost
  grossProfit: number; // revenue - cost of goods
  netProfit: number; // grossProfit - expenses
  profitMargin: number; // percentage
  bestSellingItem: BestSellingItem | null;
  salesCount: number;
}

export interface BestSellingItem {
  itemName: string;
  quantity: number;
  revenue: number;
}

export interface GlobalStats {
  totalRevenue: number;
  totalProfit: number;
  totalEvents: number;
  averageProfitPerEvent: number;
  mostProfitableEvent: MostProfitableEvent | null;
}

export interface MostProfitableEvent {
  eventId: string;
  eventName: string;
  profit: number;
}

// Subscription Types
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'none';

export interface SubscriptionState {
  status: SubscriptionStatus;
  trialStartDate: string | null;
  trialEndDate: string | null;
  isPremium: boolean;
}

export interface PremiumFeatures {
  unlimitedEvents: boolean;
  advancedStats: boolean;
  csvExport: boolean;
}

// Quick Sale Item (for fast entry) - now includes photo and stock
export interface QuickSaleItem {
  id: string;
  itemName: string;
  defaultPrice: number;
  defaultCost: number;
  imageUri?: string;    // Photo of the product
  stockCount?: number;  // How many we have
}

// Storage Keys
export const STORAGE_KEYS = {
  EVENTS: 'vendstats_events',
  SALES: 'vendstats_sales',
  QUICK_ITEMS: 'vendstats_quick_items',
  SUBSCRIPTION: 'vendstats_subscription',
  SETTINGS: 'vendstats_settings',
  FIRST_EVENT_CREATED: 'vendstats_first_event_created',
} as const;
