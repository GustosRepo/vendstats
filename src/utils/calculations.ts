/**
 * Calculation utilities for event statistics
 */

import { Event, Sale, EventStats, GlobalStats, BestSellingItem, MostProfitableEvent } from '../types';

/**
 * Calculate statistics for a single event
 */
export const calculateEventStats = (event: Event, sales: Sale[]): EventStats => {
  // Calculate revenue and cost of goods from sales
  const totalRevenue = sales.reduce((sum, sale) => {
    return sum + (sale.quantity * sale.salePrice);
  }, 0);

  const totalCostOfGoods = sales.reduce((sum, sale) => {
    return sum + (sale.quantity * sale.costPerItem);
  }, 0);

  // Event expenses (booth fee + travel)
  const totalExpenses = event.boothFee + event.travelCost;

  // Profit calculations
  const grossProfit = totalRevenue - totalCostOfGoods;
  const netProfit = grossProfit - totalExpenses;

  // Profit margin (as percentage of revenue)
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Find best selling item
  const bestSellingItem = findBestSellingItem(sales);

  return {
    totalRevenue,
    totalCostOfGoods,
    totalExpenses,
    grossProfit,
    netProfit,
    profitMargin,
    bestSellingItem,
    salesCount: sales.reduce((sum, sale) => sum + sale.quantity, 0),
  };
};

/**
 * Find the best selling item from sales
 */
const findBestSellingItem = (sales: Sale[]): BestSellingItem | null => {
  if (sales.length === 0) return null;

  // Group by item name
  const itemMap = new Map<string, { quantity: number; revenue: number }>();

  sales.forEach((sale) => {
    const existing = itemMap.get(sale.itemName) || { quantity: 0, revenue: 0 };
    itemMap.set(sale.itemName, {
      quantity: existing.quantity + sale.quantity,
      revenue: existing.revenue + (sale.quantity * sale.salePrice),
    });
  });

  // Find item with highest quantity
  let bestItem: BestSellingItem | null = null;
  let maxQuantity = 0;

  itemMap.forEach((data, itemName) => {
    if (data.quantity > maxQuantity) {
      maxQuantity = data.quantity;
      bestItem = {
        itemName,
        quantity: data.quantity,
        revenue: data.revenue,
      };
    }
  });

  return bestItem;
};

/**
 * Calculate global statistics across all events
 */
export const calculateGlobalStats = (events: Event[], allSales: Sale[]): GlobalStats => {
  let totalRevenue = 0;
  let totalProfit = 0;
  let mostProfitableEvent: MostProfitableEvent | null = null;
  let maxProfit = -Infinity;

  events.forEach((event) => {
    const eventSales = allSales.filter((sale) => sale.eventId === event.id);
    const stats = calculateEventStats(event, eventSales);

    totalRevenue += stats.totalRevenue;
    totalProfit += stats.netProfit;

    if (stats.netProfit > maxProfit) {
      maxProfit = stats.netProfit;
      mostProfitableEvent = {
        eventId: event.id,
        eventName: event.name,
        profit: stats.netProfit,
      };
    }
  });

  const totalEvents = events.length;
  const averageProfitPerEvent = totalEvents > 0 ? totalProfit / totalEvents : 0;

  return {
    totalRevenue,
    totalProfit,
    totalEvents,
    averageProfitPerEvent,
    mostProfitableEvent,
  };
};

/**
 * Calculate revenue for a single sale
 */
export const calculateSaleRevenue = (sale: Sale): number => {
  return sale.quantity * sale.salePrice;
};

/**
 * Calculate profit for a single sale
 */
export const calculateSaleProfit = (sale: Sale): number => {
  const revenue = calculateSaleRevenue(sale);
  const cost = sale.quantity * sale.costPerItem;
  return revenue - cost;
};

/**
 * Calculate profit margin for a sale
 */
export const calculateSaleProfitMargin = (sale: Sale): number => {
  const revenue = calculateSaleRevenue(sale);
  if (revenue === 0) return 0;
  
  const profit = calculateSaleProfit(sale);
  return (profit / revenue) * 100;
};

/**
 * Get revenue data grouped by day/week for charts
 */
export const getRevenueOverTime = (sales: Sale[], periodDays: number = 30): { labels: string[]; data: number[] } => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  
  // Filter sales within the period
  const recentSales = sales.filter(sale => new Date(sale.createdAt) >= cutoffDate);
  
  // Group by day
  const dailyRevenue = new Map<string, number>();
  
  recentSales.forEach(sale => {
    const date = new Date(sale.createdAt);
    const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
    const existing = dailyRevenue.get(dateKey) || 0;
    dailyRevenue.set(dateKey, existing + (sale.quantity * sale.salePrice));
  });
  
  // Create array of last N days
  const labels: string[] = [];
  const data: number[] = [];
  
  // Get the last 7 days for cleaner chart
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
    labels.push(dateKey);
    data.push(dailyRevenue.get(dateKey) || 0);
  }
  
  return { labels, data };
};

/**
 * Get top selling products ranked by quantity
 */
export const getTopSellingProducts = (sales: Sale[], limit: number = 5): { name: string; quantity: number; revenue: number }[] => {
  const itemMap = new Map<string, { quantity: number; revenue: number }>();
  
  sales.forEach(sale => {
    const existing = itemMap.get(sale.itemName) || { quantity: 0, revenue: 0 };
    itemMap.set(sale.itemName, {
      quantity: existing.quantity + sale.quantity,
      revenue: existing.revenue + (sale.quantity * sale.salePrice),
    });
  });
  
  // Convert to array and sort by quantity
  const items: { name: string; quantity: number; revenue: number }[] = [];
  itemMap.forEach((data, name) => {
    items.push({ name, ...data });
  });
  
  return items
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

/**
 * Get profit data for each event
 */
export const getProfitByEvent = (events: Event[], allSales: Sale[]): { name: string; profit: number; revenue: number }[] => {
  return events.map(event => {
    const eventSales = allSales.filter(sale => sale.eventId === event.id);
    const stats = calculateEventStats(event, eventSales);
    
    return {
      name: event.name.length > 12 ? event.name.substring(0, 12) + '...' : event.name,
      profit: stats.netProfit,
      revenue: stats.totalRevenue,
    };
  }).sort((a, b) => b.profit - a.profit);
};

/**
 * Get extended stats for the stats screen
 */
export const getExtendedStats = (events: Event[], allSales: Sale[]) => {
  // Profit margin
  const totalRevenue = allSales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
  const totalCost = allSales.reduce((sum, s) => sum + s.costPerItem * s.quantity, 0);
  const totalExpenses = events.reduce((sum, e) => sum + e.boothFee + e.travelCost, 0);
  const netProfit = totalRevenue - totalCost - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Expense breakdown
  const totalBoothFees = events.reduce((sum, e) => sum + e.boothFee, 0);
  const totalTravelCosts = events.reduce((sum, e) => sum + e.travelCost, 0);
  
  // Total items sold
  const totalItemsSold = allSales.reduce((sum, s) => sum + s.quantity, 0);
  
  // Average sale value
  const avgSaleValue = allSales.length > 0 
    ? totalRevenue / allSales.length 
    : 0;
    
  // Average items per event
  const avgItemsPerEvent = events.length > 0 
    ? totalItemsSold / events.length 
    : 0;
    
  // Highest revenue product
  const productMap = new Map<string, { quantity: number; revenue: number; profit: number }>();
  allSales.forEach(sale => {
    const existing = productMap.get(sale.itemName) || { quantity: 0, revenue: 0, profit: 0 };
    productMap.set(sale.itemName, {
      quantity: existing.quantity + sale.quantity,
      revenue: existing.revenue + sale.salePrice * sale.quantity,
      profit: existing.profit + (sale.salePrice - sale.costPerItem) * sale.quantity,
    });
  });
  
  let bestSeller: { name: string; quantity: number; revenue: number } | null = null;
  let highestRevenue: { name: string; revenue: number } | null = null;
  let mostProfitableProduct: { name: string; profit: number } | null = null;
  
  let maxQty = 0, maxRev = 0, maxProfit = 0;
  productMap.forEach((data, name) => {
    if (data.quantity > maxQty) {
      maxQty = data.quantity;
      bestSeller = { name, quantity: data.quantity, revenue: data.revenue };
    }
    if (data.revenue > maxRev) {
      maxRev = data.revenue;
      highestRevenue = { name, revenue: data.revenue };
    }
    if (data.profit > maxProfit) {
      maxProfit = data.profit;
      mostProfitableProduct = { name, profit: data.profit };
    }
  });
  
  return {
    profitMargin,
    totalBoothFees,
    totalTravelCosts,
    totalItemsSold,
    avgSaleValue,
    avgItemsPerEvent,
    bestSeller,
    highestRevenue,
    mostProfitableProduct,
    totalCostOfGoods: totalCost,
  };
};
