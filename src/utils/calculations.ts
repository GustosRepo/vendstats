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
