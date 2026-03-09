// Event Types
export interface Event {
  id: string;
  name: string;
  date: string; // ISO date string
  location?: string; // Event location/venue
  boothFee: number;
  travelCost: number;
  suppliesCost?: number;  // Ingredients / packaging / supplies
  miscCost?: number;      // Other miscellaneous expenses
  notes: string;
  productIds?: string[]; // Products brought to this event
  tags?: string[];       // Custom event tags/categories
  receiptPhotoUri?: string; // Photo of receipt for expenses
  weather?: string;      // Weather conditions (sunny, cloudy, rainy, etc.)
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  name: string;
  date: string;
  location?: string;
  boothFee: number;
  travelCost: number;
  suppliesCost?: number;
  miscCost?: number;
  notes?: string;
  productIds?: string[];
  tags?: string[];
  receiptPhotoUri?: string;
  weather?: string;
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

// Ingredient for cost breakdown
export interface Ingredient {
  name: string;
  cost: number;
  quantity?: number; // Amount used per unit (optional)
}

// Quick Sale Item (for fast entry) - now includes photo and stock
export interface QuickSaleItem {
  id: string;
  itemName: string;
  defaultPrice: number;
  defaultCost: number;
  imageUri?: string;    // Photo of the product
  stockCount?: number;  // How many we have
  ingredients?: Ingredient[]; // Ingredient cost breakdown
}

// Vendor category (from onboarding)
export type VendorCategory = 'food' | 'crafts' | 'clothing' | 'jewelry' | 'other';

// App Settings
export interface AppSettings {
  lowStockThreshold: number;  // Alert when count is at or below this number
  language?: string;          // User's preferred language (en, th, es)
  currency?: string;          // User's preferred currency code (USD, THB, MXN, EUR)
  qrCodeUri?: string;         // URI to vendor's payment QR code image
  vendorCategory?: VendorCategory; // What the vendor sells (set during onboarding)
  reminderEnabled?: boolean;  // Daily logging reminder
}

export const DEFAULT_SETTINGS: AppSettings = {
  lowStockThreshold: 5,
  language: undefined,
  currency: undefined,
  qrCodeUri: undefined,
  vendorCategory: undefined,
};

// Storage Keys
export const STORAGE_KEYS = {
  EVENTS: 'vendstats_events',
  SALES: 'vendstats_sales',
  QUICK_ITEMS: 'vendstats_quick_items',
  SUBSCRIPTION: 'vendstats_subscription',
  SETTINGS: 'vendstats_settings',
  FIRST_EVENT_CREATED: 'vendstats_first_event_created',
  USED_EVENTS_COUNT: 'vendstats_used_events_count',
  EVENTS_WITH_SALES: 'vendstats_events_with_sales',
} as const;
