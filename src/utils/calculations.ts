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

  // Event expenses (booth fee + travel + supplies + misc)
  const totalExpenses = (event.boothFee ?? 0) + (event.travelCost ?? 0) + (event.suppliesCost || 0) + (event.miscCost || 0);

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
 * Calculate break-even point for an event
 * Returns how many more units need to be sold to cover all expenses
 */
export const calculateBreakEven = (event: Event, sales: Sale[]): {
  avgProfitPerUnit: number;
  unitsToBreakEven: number;
  isBreakEven: boolean;
  totalExpenses: number;
  totalProfit: number;
} => {
  const stats = calculateEventStats(event, sales);
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);
  const avgProfitPerUnit = totalUnits > 0 
    ? (stats.totalRevenue - stats.totalCostOfGoods) / totalUnits 
    : 0;
  
  const totalExpenses = stats.totalExpenses;
  const coveredSoFar = stats.totalRevenue - stats.totalCostOfGoods;
  const remaining = totalExpenses - coveredSoFar;
  
  const unitsToBreakEven = avgProfitPerUnit > 0 
    ? Math.max(0, Math.ceil(remaining / avgProfitPerUnit))
    : 0;
  
  return {
    avgProfitPerUnit,
    unitsToBreakEven,
    isBreakEven: stats.netProfit >= 0,
    totalExpenses,
    totalProfit: stats.netProfit,
  };
};

/**
 * Calculate prep recommendations for items based on historical sales data
 * Looks at all past events to compute avg sold per event for each item
 */
export const calculatePrepRecommendations = (
  events: Event[], 
  allSales: Sale[], 
  quickItems: { id: string; itemName: string }[]
): { name: string; avgSold: number; minSold: number; maxSold: number; eventsAppeared: number; recommended: number }[] => {
  // Group sales by item across events
  const itemEventSales = new Map<string, number[]>();
  
  events.forEach(event => {
    const eventSales = allSales.filter(s => s.eventId === event.id);
    const itemQty = new Map<string, number>();
    
    eventSales.forEach(s => {
      itemQty.set(s.itemName, (itemQty.get(s.itemName) || 0) + s.quantity);
    });
    
    // For items that were brought but not sold at this event, count as 0
    quickItems.forEach(qi => {
      const brought = !event.productIds || event.productIds.length === 0 || event.productIds.includes(qi.id);
      if (brought) {
        const sold = itemQty.get(qi.itemName) || 0;
        const existing = itemEventSales.get(qi.itemName) || [];
        existing.push(sold);
        itemEventSales.set(qi.itemName, existing);
      }
    });
  });
  
  const results: { name: string; avgSold: number; minSold: number; maxSold: number; eventsAppeared: number; recommended: number }[] = [];
  
  itemEventSales.forEach((salesPerEvent, name) => {
    if (salesPerEvent.length === 0) return;
    const avg = salesPerEvent.reduce((a, b) => a + b, 0) / salesPerEvent.length;
    const min = Math.min(...salesPerEvent);
    const max = Math.max(...salesPerEvent);
    // Recommend avg + 20% buffer, rounded up
    const recommended = Math.ceil(avg * 1.2);
    
    results.push({
      name,
      avgSold: Math.round(avg * 10) / 10,
      minSold: min,
      maxSold: max,
      eventsAppeared: salesPerEvent.length,
      recommended: Math.max(recommended, 1),
    });
  });
  
  return results.sort((a, b) => b.avgSold - a.avgSold);
};

/**
 * Get comprehensive item analysis across all events
 * Returns per-item stats: total sold, revenue, profit, avg per event, events count
 */
export const getItemAnalysis = (events: Event[], allSales: Sale[]): {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
  avgPerEvent: number;
  eventsCount: number;
  profitMargin: number;
}[] => {
  const itemMap = new Map<string, { 
    quantity: number; revenue: number; cost: number; eventIds: Set<string> 
  }>();
  
  allSales.forEach(sale => {
    const existing = itemMap.get(sale.itemName) || { quantity: 0, revenue: 0, cost: 0, eventIds: new Set<string>() };
    existing.quantity += sale.quantity;
    existing.revenue += sale.quantity * sale.salePrice;
    existing.cost += sale.quantity * sale.costPerItem;
    existing.eventIds.add(sale.eventId);
    itemMap.set(sale.itemName, existing);
  });
  
  const results: {
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
    avgPerEvent: number;
    eventsCount: number;
    profitMargin: number;
  }[] = [];
  
  itemMap.forEach((data, name) => {
    const profit = data.revenue - data.cost;
    const eventsCount = data.eventIds.size;
    results.push({
      name,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
      totalProfit: profit,
      avgPerEvent: eventsCount > 0 ? Math.round((data.quantity / eventsCount) * 10) / 10 : 0,
      eventsCount,
      profitMargin: data.revenue > 0 ? (profit / data.revenue) * 100 : 0,
    });
  });
  
  return results.sort((a, b) => b.totalQuantity - a.totalQuantity);
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
 * Get revenue data by period: 'week' (7 days), 'month' (4 weeks), '3month' (12 weeks)
 */
export const getRevenueByPeriod = (
  sales: Sale[], 
  period: 'week' | 'month' | '3month'
): { labels: string[]; data: number[] } => {
  const now = new Date();
  const labels: string[] = [];
  const data: number[] = [];
  
  if (period === 'week') {
    // 7 daily buckets
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayRevenue = sales
        .filter(s => { const d = new Date(s.createdAt); return d >= dayStart && d < dayEnd; })
        .reduce((sum, s) => sum + s.quantity * s.salePrice, 0);
      labels.push(`${dayStart.getMonth() + 1}/${dayStart.getDate()}`);
      data.push(dayRevenue);
    }
  } else if (period === 'month') {
    // 4 weekly buckets
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekRevenue = sales
        .filter(s => { const d = new Date(s.createdAt); return d >= weekStart && d < weekEnd; })
        .reduce((sum, s) => sum + s.quantity * s.salePrice, 0);
      labels.push(`${weekStart.getMonth() + 1}/${weekStart.getDate()}`);
      data.push(weekRevenue);
    }
  } else {
    // 3month: 12 weekly buckets — only show every 3rd label to avoid overlap
    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekRevenue = sales
        .filter(s => { const d = new Date(s.createdAt); return d >= weekStart && d < weekEnd; })
        .reduce((sum, s) => sum + s.quantity * s.salePrice, 0);
      // Show label at positions 0, 3, 6, 9, 11 (first, every 3rd, last)
      const pos = 11 - i;
      const showLabel = pos % 3 === 0 || pos === 11;
      labels.push(showLabel ? `${weekStart.getMonth() + 1}/${weekStart.getDate()}` : '');
      data.push(weekRevenue);
    }
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
  const totalExpenses = events.reduce((sum, e) => sum + (e.boothFee ?? 0) + (e.travelCost ?? 0) + (e.suppliesCost || 0) + (e.miscCost || 0), 0);
  const netProfit = totalRevenue - totalCost - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Expense breakdown
  const totalBoothFees = events.reduce((sum, e) => sum + (e.boothFee ?? 0), 0);
  const totalTravelCosts = events.reduce((sum, e) => sum + (e.travelCost ?? 0), 0);
  const totalSuppliesCosts = events.reduce((sum, e) => sum + (e.suppliesCost || 0), 0);
  const totalMiscCosts = events.reduce((sum, e) => sum + (e.miscCost || 0), 0);
  
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
    totalSuppliesCosts,
    totalMiscCosts,
    totalItemsSold,
    avgSaleValue,
    avgItemsPerEvent,
    bestSeller,
    highestRevenue,
    mostProfitableProduct,
    totalCostOfGoods: totalCost,
  };
};

/**
 * Generate smart profit insights based on data patterns
 * Returns an array of { icon, key, params } objects for i18n rendering
 */
export const generateSmartInsights = (
  events: Event[], 
  allSales: Sale[]
): { icon: string; key: string; params?: Record<string, string | number> }[] => {
  const insights: { icon: string; key: string; params?: Record<string, string | number> }[] = [];
  
  if (events.length < 2) return insights;
  
  // 1. Day-of-week analysis: which day is most profitable?
  const dayProfits = new Map<number, { total: number; count: number }>();
  events.forEach(event => {
    const d = new Date(event.date);
    const day = isNaN(d.getTime()) ? 0 : d.getDay();
    const eventSales = allSales.filter(s => s.eventId === event.id);
    const stats = calculateEventStats(event, eventSales);
    const existing = dayProfits.get(day) || { total: 0, count: 0 };
    dayProfits.set(day, { total: existing.total + stats.netProfit, count: existing.count + 1 });
  });
  
  let bestDay = -1;
  let bestDayAvg = -Infinity;
  dayProfits.forEach((data, day) => {
    if (data.count >= 1) {
      const avg = data.total / data.count;
      if (avg > bestDayAvg) {
        bestDayAvg = avg;
        bestDay = day;
      }
    }
  });
  
  if (bestDay >= 0 && bestDayAvg > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    insights.push({
      icon: 'calendar-outline',
      key: 'smartInsights.bestDay',
      params: { day: dayNames[bestDay] },
    });
  }
  
  // 2. Margin trend: are margins improving or declining?
  const sortedEvents = [...events].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
  });
  if (sortedEvents.length >= 4) {
    const half = Math.floor(sortedEvents.length / 2);
    const firstHalf = sortedEvents.slice(0, half);
    const secondHalf = sortedEvents.slice(half);
    
    const calcAvgMargin = (evts: Event[]) => {
      let totalRev = 0, totalProfit = 0;
      evts.forEach(e => {
        const eSales = allSales.filter(s => s.eventId === e.id);
        const st = calculateEventStats(e, eSales);
        totalRev += st.totalRevenue;
        totalProfit += st.netProfit;
      });
      return totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
    };
    
    const earlyMargin = calcAvgMargin(firstHalf);
    const recentMargin = calcAvgMargin(secondHalf);
    const diff = recentMargin - earlyMargin;
    
    if (Math.abs(diff) >= 3) {
      insights.push({
        icon: diff > 0 ? 'trending-up-outline' : 'trending-down-outline',
        key: diff > 0 ? 'smartInsights.marginsImproving' : 'smartInsights.marginsDeclining',
        params: { percent: Math.abs(Math.round(diff)) },
      });
    }
  }
  
  // 3. Best revenue item vs best profit item mismatch
  const itemMap = new Map<string, { revenue: number; profit: number; qty: number }>();
  allSales.forEach(s => {
    const existing = itemMap.get(s.itemName) || { revenue: 0, profit: 0, qty: 0 };
    existing.revenue += s.quantity * s.salePrice;
    existing.profit += s.quantity * (s.salePrice - s.costPerItem);
    existing.qty += s.quantity;
    itemMap.set(s.itemName, existing);
  });
  
  let topRevenueItem = '', topProfitItem = '';
  let maxRev = 0, maxProf = 0;
  itemMap.forEach((data, name) => {
    if (data.revenue > maxRev) { maxRev = data.revenue; topRevenueItem = name; }
    if (data.profit > maxProf) { maxProf = data.profit; topProfitItem = name; }
  });
  
  if (topRevenueItem && topProfitItem && topRevenueItem !== topProfitItem) {
    insights.push({
      icon: 'bulb-outline',
      key: 'smartInsights.revenueVsProfit',
      params: { revenueItem: topRevenueItem, profitItem: topProfitItem },
    });
  }
  
  // 4. High-expense warning: if expenses > 40% of revenue
  const totalRev = allSales.reduce((sum, s) => sum + s.quantity * s.salePrice, 0);
  const totalExp = events.reduce((sum, e) => sum + (e.boothFee ?? 0) + (e.travelCost ?? 0) + (e.suppliesCost || 0) + (e.miscCost || 0), 0);
  if (totalRev > 0) {
    const expRatio = (totalExp / totalRev) * 100;
    if (expRatio > 40) {
      insights.push({
        icon: 'warning-outline',
        key: 'smartInsights.highExpenses',
        params: { percent: Math.round(expRatio) },
      });
    }
  }
  
  // 5. Avg items per event trend
  if (sortedEvents.length >= 4) {
    const half = Math.floor(sortedEvents.length / 2);
    const earlyAvg = sortedEvents.slice(0, half).reduce((sum, e) => {
      return sum + allSales.filter(s => s.eventId === e.id).reduce((s2, s) => s2 + s.quantity, 0);
    }, 0) / half;
    const recentAvg = sortedEvents.slice(half).reduce((sum, e) => {
      return sum + allSales.filter(s => s.eventId === e.id).reduce((s2, s) => s2 + s.quantity, 0);
    }, 0) / (sortedEvents.length - half);
    
    if (recentAvg > earlyAvg * 1.2) {
      insights.push({
        icon: 'arrow-up-circle-outline',
        key: 'smartInsights.sellingMore',
        params: { recent: Math.round(recentAvg), early: Math.round(earlyAvg) },
      });
    }
  }
  
  // 6. Location insight: if events have locations, find best location
  const locProfit = new Map<string, { total: number; count: number }>();
  events.forEach(event => {
    if (!event.location) return;
    const eSales = allSales.filter(s => s.eventId === event.id);
    const stats = calculateEventStats(event, eSales);
    const existing = locProfit.get(event.location) || { total: 0, count: 0 };
    locProfit.set(event.location, { total: existing.total + stats.netProfit, count: existing.count + 1 });
  });
  
  let bestLoc = '';
  let bestLocAvg = -Infinity;
  locProfit.forEach((data, loc) => {
    if (data.count >= 2) {
      const avg = data.total / data.count;
      if (avg > bestLocAvg) {
        bestLocAvg = avg;
        bestLoc = loc;
      }
    }
  });
  
  if (bestLoc) {
    insights.push({
      icon: 'location-outline',
      key: 'smartInsights.bestLocation',
      params: { location: bestLoc },
    });
  }
  
  return insights.slice(0, 5); // Cap at 5 insights
};

/**
 * Calculate sales forecast for an event based on historical data.
 * Weights events that share the same tags, location, or weather more heavily.
 */
export const calculateForecast = (
  events: Event[],
  allSales: Sale[],
  targetEvent?: Event,
): { predictedRevenue: number; predictedProfit: number; predictedItems: number; basedOnEvents: number } => {
  if (events.length === 0) {
    return { predictedRevenue: 0, predictedProfit: 0, predictedItems: 0, basedOnEvents: 0 };
  }

  // Exclude the target event from source data
  const sourceEvents = targetEvent
    ? events.filter(e => e.id !== targetEvent.id)
    : events;

  if (sourceEvents.length === 0) {
    return { predictedRevenue: 0, predictedProfit: 0, predictedItems: 0, basedOnEvents: 0 };
  }

  let totalWeight = 0;
  let weightedRevenue = 0;
  let weightedProfit = 0;
  let weightedItems = 0;

  sourceEvents.forEach(event => {
    const eventSales = allSales.filter(s => s.eventId === event.id);
    const stats = calculateEventStats(event, eventSales);

    // Base weight = 1, bonus for matching attributes
    let weight = 1;
    if (targetEvent) {
      // Tag overlap bonus
      if (targetEvent.tags && event.tags) {
        const overlap = targetEvent.tags.filter(t => event.tags!.includes(t)).length;
        if (overlap > 0) weight += overlap * 0.5;
      }
      // Location match
      if (targetEvent.location && event.location && targetEvent.location === event.location) {
        weight += 1;
      }
      // Weather match
      if (targetEvent.weather && event.weather && targetEvent.weather === event.weather) {
        weight += 0.5;
      }
    }

    weightedRevenue += stats.totalRevenue * weight;
    weightedProfit += stats.netProfit * weight;
    weightedItems += stats.salesCount * weight;
    totalWeight += weight;
  });

  return {
    predictedRevenue: Math.round((weightedRevenue / totalWeight) * 100) / 100,
    predictedProfit: Math.round((weightedProfit / totalWeight) * 100) / 100,
    predictedItems: Math.round(weightedItems / totalWeight),
    basedOnEvents: sourceEvents.length,
  };
};
