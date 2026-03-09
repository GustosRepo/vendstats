/**
 * Event report generator — free vs pro tiers
 */

import { Event, Sale, EventStats } from '../types';
import { calculateEventStats } from './calculations';
import { formatCurrency } from './currency';
import { formatDate } from './date';

export interface FreeReport {
  eventName: string;
  date: string;
  revenue: string;
  expenses: string;
  profit: string;
  isProfitable: boolean;
}

export interface ProReport extends FreeReport {
  itemsSold: number;
  topSeller: { name: string; quantity: number } | null;
  profitMargin: string;
  sellThroughRate: string | null;
  totalUnits: number;
  avgItemMargin: string;
  itemBreakdown: { name: string; qty: number; revenue: string; profit: string }[];
  location?: string;
  weather?: string;
}

/**
 * Generate the basic free-tier report data
 */
export const generateFreeReport = (event: Event, stats: EventStats): FreeReport => ({
  eventName: event.name,
  date: formatDate(new Date(event.date), 'MMMM d, yyyy'),
  revenue: formatCurrency(stats.totalRevenue),
  expenses: formatCurrency(stats.totalExpenses + stats.totalCostOfGoods),
  profit: formatCurrency(stats.netProfit),
  isProfitable: stats.netProfit >= 0,
});

/**
 * Generate the full pro-tier report data
 */
export const generateProReport = (
  event: Event,
  sales: Sale[],
  stats: EventStats,
  sellThrough: { name: string; sold: number; prepared: number; rate: number }[],
): ProReport => {
  const free = generateFreeReport(event, stats);

  // Item breakdown
  const itemMap = new Map<string, { qty: number; revenue: number; cost: number }>();
  sales.forEach(sale => {
    const existing = itemMap.get(sale.itemName) || { qty: 0, revenue: 0, cost: 0 };
    existing.qty += sale.quantity;
    existing.revenue += sale.quantity * sale.salePrice;
    existing.cost += sale.quantity * sale.costPerItem;
    itemMap.set(sale.itemName, existing);
  });

  const itemBreakdown = Array.from(itemMap.entries())
    .sort((a, b) => b[1].qty - a[1].qty)
    .map(([name, data]) => ({
      name,
      qty: data.qty,
      revenue: formatCurrency(data.revenue),
      profit: formatCurrency(data.revenue - data.cost),
    }));

  // Average item margin
  const totalRevenue = sales.reduce((s, sale) => s + sale.quantity * sale.salePrice, 0);
  const totalCost = sales.reduce((s, sale) => s + sale.quantity * sale.costPerItem, 0);
  const avgMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  // Avg sell-through rate
  const avgSellThrough =
    sellThrough.length > 0
      ? sellThrough.reduce((s, item) => s + item.rate, 0) / sellThrough.length
      : null;

  return {
    ...free,
    itemsSold: stats.salesCount,
    topSeller: stats.bestSellingItem
      ? { name: stats.bestSellingItem.itemName, quantity: stats.bestSellingItem.quantity }
      : null,
    profitMargin: `${stats.profitMargin.toFixed(1)}%`,
    sellThroughRate: avgSellThrough !== null ? `${avgSellThrough.toFixed(0)}%` : null,
    totalUnits: stats.salesCount,
    avgItemMargin: `${avgMargin.toFixed(1)}%`,
    itemBreakdown,
    location: event.location,
    weather: event.weather,
  };
};

/**
 * Format free report as shareable text
 */
export const formatFreeReportText = (report: FreeReport): string => {
  return [
    `📊 ${report.eventName}`,
    `📅 ${report.date}`,
    '',
    `💰 Revenue: ${report.revenue}`,
    `📦 Expenses: ${report.expenses}`,
    `${report.isProfitable ? '📈' : '📉'} Profit: ${report.profit}`,
    '',
    '— Tracked with VendStats 📊',
  ].join('\n');
};

/**
 * Format pro report as shareable text
 */
export const formatProReportText = (report: ProReport): string => {
  const lines: string[] = [
    `🧾 ${report.eventName} Report`,
    `📅 ${report.date}`,
  ];

  if (report.location) lines.push(`📍 ${report.location}`);
  lines.push('');

  lines.push(`💰 Revenue: ${report.revenue}`);
  lines.push(`📦 Expenses: ${report.expenses}`);
  lines.push(`${report.isProfitable ? '📈' : '📉'} Profit: ${report.profit}`);
  lines.push('');

  lines.push(`🛒 Items Sold: ${report.itemsSold}`);
  if (report.topSeller) {
    lines.push(`⭐ Top Seller: ${report.topSeller.name} (${report.topSeller.quantity})`);
  }
  lines.push('');

  lines.push(`📊 Profit Margin: ${report.profitMargin}`);
  if (report.sellThroughRate) {
    lines.push(`📦 Sell-Through Rate: ${report.sellThroughRate}`);
  }
  lines.push(`💵 Avg Item Margin: ${report.avgItemMargin}`);

  if (report.itemBreakdown.length > 0) {
    lines.push('');
    lines.push('Item Breakdown:');
    report.itemBreakdown.forEach(item => {
      lines.push(`  • ${item.name}: ${item.qty} sold — ${item.revenue}`);
    });
  }

  lines.push('');
  lines.push('— Tracked with VendStats');

  return lines.join('\n');
};
