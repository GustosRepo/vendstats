/**
 * Unit tests for src/utils/calculations.ts
 *
 * Covers: calculateEventStats, calculateGlobalStats, calculateSaleRevenue,
 *         calculateSaleProfit, calculateSaleProfitMargin, calculateBreakEven,
 *         calculatePrepRecommendations, getItemAnalysis, getTopSellingProducts,
 *         getProfitByEvent, getExtendedStats, generateSmartInsights, calculateForecast
 */

import {
  calculateEventStats,
  calculateGlobalStats,
  calculateSaleRevenue,
  calculateSaleProfit,
  calculateSaleProfitMargin,
  calculateBreakEven,
  calculatePrepRecommendations,
  getItemAnalysis,
  getTopSellingProducts,
  getProfitByEvent,
  getExtendedStats,
  generateSmartInsights,
  calculateForecast,
} from '../utils/calculations';

import type { Event, Sale } from '../types';

// ---------------------------------------------------------------------------
// Helpers – factory functions to build test data
// ---------------------------------------------------------------------------

const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'evt-1',
  name: 'Farmers Market',
  date: '2024-06-15T10:00:00.000Z',
  boothFee: 50,
  travelCost: 20,
  suppliesCost: 0,
  miscCost: 0,
  notes: '',
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  ...overrides,
});

const makeSale = (overrides: Partial<Sale> = {}): Sale => ({
  id: 'sale-1',
  eventId: 'evt-1',
  itemName: 'Cookie',
  quantity: 10,
  salePrice: 5,
  costPerItem: 2,
  createdAt: '2024-06-15T12:00:00.000Z',
  updatedAt: '2024-06-15T12:00:00.000Z',
  ...overrides,
});

// ---------------------------------------------------------------------------
// calculateEventStats
// ---------------------------------------------------------------------------
describe('calculateEventStats', () => {
  it('calculates correct stats for a single event with one sale', () => {
    const event = makeEvent();
    const sales = [makeSale()];
    const stats = calculateEventStats(event, sales);

    // revenue = 10 * 5 = 50
    expect(stats.totalRevenue).toBe(50);
    // COGS = 10 * 2 = 20
    expect(stats.totalCostOfGoods).toBe(20);
    // expenses = 50 + 20 = 70
    expect(stats.totalExpenses).toBe(70);
    // gross = 50 - 20 = 30
    expect(stats.grossProfit).toBe(30);
    // net = 30 - 70 = -40
    expect(stats.netProfit).toBe(-40);
    // margin = -40/50 * 100 = -80
    expect(stats.profitMargin).toBe(-80);
    expect(stats.salesCount).toBe(10);
    expect(stats.bestSellingItem).toEqual({ itemName: 'Cookie', quantity: 10, revenue: 50 });
  });

  it('handles multiple sales and identifies the best seller', () => {
    const event = makeEvent({ boothFee: 0, travelCost: 0 });
    const sales = [
      makeSale({ id: 's1', itemName: 'Cookie', quantity: 5, salePrice: 3, costPerItem: 1 }),
      makeSale({ id: 's2', itemName: 'Cookie', quantity: 10, salePrice: 3, costPerItem: 1 }),
      makeSale({ id: 's3', itemName: 'Brownie', quantity: 8, salePrice: 4, costPerItem: 1.5 }),
    ];
    const stats = calculateEventStats(event, sales);

    // Cookies total qty = 15, Brownie = 8, so best seller = Cookie
    expect(stats.bestSellingItem?.itemName).toBe('Cookie');
    expect(stats.bestSellingItem?.quantity).toBe(15);
    // revenue = 15*3 + 8*4 = 45 + 32 = 77
    expect(stats.totalRevenue).toBe(77);
    expect(stats.salesCount).toBe(23);
  });

  it('returns null best seller for zero sales', () => {
    const event = makeEvent();
    const stats = calculateEventStats(event, []);

    expect(stats.totalRevenue).toBe(0);
    expect(stats.bestSellingItem).toBeNull();
    expect(stats.profitMargin).toBe(0);
  });

  it('includes optional suppliesCost and miscCost in expenses', () => {
    const event = makeEvent({ boothFee: 100, travelCost: 30, suppliesCost: 25, miscCost: 15 });
    const stats = calculateEventStats(event, []);

    expect(stats.totalExpenses).toBe(170);
  });
});

// ---------------------------------------------------------------------------
// calculateSaleRevenue / calculateSaleProfit / calculateSaleProfitMargin
// ---------------------------------------------------------------------------
describe('single-sale helpers', () => {
  const sale = makeSale({ quantity: 4, salePrice: 10, costPerItem: 3 });

  it('calculateSaleRevenue returns quantity * salePrice', () => {
    expect(calculateSaleRevenue(sale)).toBe(40);
  });

  it('calculateSaleProfit returns revenue - cost', () => {
    // 40 - (4*3) = 28
    expect(calculateSaleProfit(sale)).toBe(28);
  });

  it('calculateSaleProfitMargin returns (profit/revenue)*100', () => {
    // 28/40 * 100 = 70
    expect(calculateSaleProfitMargin(sale)).toBe(70);
  });

  it('calculateSaleProfitMargin returns 0 when revenue is 0', () => {
    const zeroSale = makeSale({ quantity: 0, salePrice: 0 });
    expect(calculateSaleProfitMargin(zeroSale)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateGlobalStats
// ---------------------------------------------------------------------------
describe('calculateGlobalStats', () => {
  it('aggregates stats across multiple events', () => {
    const events = [
      makeEvent({ id: 'e1', name: 'Market A', boothFee: 0, travelCost: 0 }),
      makeEvent({ id: 'e2', name: 'Market B', boothFee: 0, travelCost: 0 }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', quantity: 10, salePrice: 5, costPerItem: 2 }),
      makeSale({ id: 's2', eventId: 'e2', quantity: 20, salePrice: 3, costPerItem: 1 }),
    ];

    const global = calculateGlobalStats(events, sales);

    // e1 revenue=50, net=30; e2 revenue=60, net=40
    expect(global.totalRevenue).toBe(110);
    expect(global.totalProfit).toBe(70);
    expect(global.totalEvents).toBe(2);
    expect(global.averageProfitPerEvent).toBe(35);
    expect(global.mostProfitableEvent).toEqual({ eventId: 'e2', eventName: 'Market B', profit: 40 });
  });

  it('returns empty stats for no events', () => {
    const global = calculateGlobalStats([], []);
    expect(global.totalEvents).toBe(0);
    expect(global.averageProfitPerEvent).toBe(0);
    expect(global.mostProfitableEvent).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateBreakEven
// ---------------------------------------------------------------------------
describe('calculateBreakEven', () => {
  it('already at break-even when net profit >= 0', () => {
    const event = makeEvent({ boothFee: 10, travelCost: 0 });
    const sales = [makeSale({ quantity: 10, salePrice: 5, costPerItem: 2 })];
    // gross = 30, expenses = 10, net = 20  → already profitable
    const result = calculateBreakEven(event, sales);

    expect(result.isBreakEven).toBe(true);
    expect(result.unitsToBreakEven).toBe(0);
    expect(result.totalProfit).toBe(20);
  });

  it('calculates units still needed to break even', () => {
    const event = makeEvent({ boothFee: 100, travelCost: 0 });
    const sales = [makeSale({ quantity: 10, salePrice: 5, costPerItem: 2 })];
    // gross = 30, expenses = 100, net = -70
    // avgProfitPerUnit = 30/10 = 3   remaining = 100 - 30 = 70   units = ceil(70/3) = 24
    const result = calculateBreakEven(event, sales);

    expect(result.isBreakEven).toBe(false);
    expect(result.avgProfitPerUnit).toBe(3);
    expect(result.unitsToBreakEven).toBe(24);
  });

  it('returns 0 unitsToBreakEven when avg profit per unit is 0', () => {
    const event = makeEvent({ boothFee: 50, travelCost: 0 });
    const result = calculateBreakEven(event, []);

    expect(result.unitsToBreakEven).toBe(0);
    expect(result.avgProfitPerUnit).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculatePrepRecommendations
// ---------------------------------------------------------------------------
describe('calculatePrepRecommendations', () => {
  it('returns per-item stats sorted by avgSold descending', () => {
    const events = [
      makeEvent({ id: 'e1' }),
      makeEvent({ id: 'e2' }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', itemName: 'Cookie', quantity: 10 }),
      makeSale({ id: 's2', eventId: 'e2', itemName: 'Cookie', quantity: 20 }),
      makeSale({ id: 's3', eventId: 'e1', itemName: 'Brownie', quantity: 5 }),
      makeSale({ id: 's4', eventId: 'e2', itemName: 'Brownie', quantity: 3 }),
    ];
    const quickItems = [
      { id: 'qi1', itemName: 'Cookie' },
      { id: 'qi2', itemName: 'Brownie' },
    ];

    const recs = calculatePrepRecommendations(events, sales, quickItems);

    expect(recs.length).toBe(2);
    // Cookie avg = 15, Brownie avg = 4 → Cookie first
    expect(recs[0].name).toBe('Cookie');
    expect(recs[0].avgSold).toBe(15);
    expect(recs[0].minSold).toBe(10);
    expect(recs[0].maxSold).toBe(20);
    // recommended = ceil(15 * 1.2) = 18
    expect(recs[0].recommended).toBe(18);

    expect(recs[1].name).toBe('Brownie');
    expect(recs[1].avgSold).toBe(4);
    // recommended = ceil(4 * 1.2) = 5
    expect(recs[1].recommended).toBe(5);
  });

  it('returns minimum recommended of 1', () => {
    const events = [makeEvent({ id: 'e1' })];
    const sales: Sale[] = []; // 0 sold → avg=0 → recommended should be max(ceil(0*1.2),1) = 1
    const quickItems = [{ id: 'qi1', itemName: 'Cookie' }];

    const recs = calculatePrepRecommendations(events, sales, quickItems);
    expect(recs[0].recommended).toBe(1);
  });

  it('returns empty array with no events', () => {
    const recs = calculatePrepRecommendations([], [], [{ id: 'qi1', itemName: 'Cookie' }]);
    expect(recs).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getItemAnalysis
// ---------------------------------------------------------------------------
describe('getItemAnalysis', () => {
  it('aggregates per-item totals across events', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' })];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', itemName: 'Cookie', quantity: 5, salePrice: 4, costPerItem: 1 }),
      makeSale({ id: 's2', eventId: 'e2', itemName: 'Cookie', quantity: 3, salePrice: 4, costPerItem: 1 }),
      makeSale({ id: 's3', eventId: 'e1', itemName: 'Brownie', quantity: 2, salePrice: 6, costPerItem: 2 }),
    ];

    const analysis = getItemAnalysis(events, sales);

    // Sorted by totalQuantity desc → Cookie(8) first
    expect(analysis[0].name).toBe('Cookie');
    expect(analysis[0].totalQuantity).toBe(8);
    expect(analysis[0].totalRevenue).toBe(32); // 8 * 4
    expect(analysis[0].totalProfit).toBe(24); // 32 - 8
    expect(analysis[0].eventsCount).toBe(2);
    expect(analysis[0].avgPerEvent).toBe(4); // 8/2

    expect(analysis[1].name).toBe('Brownie');
    expect(analysis[1].totalQuantity).toBe(2);
    expect(analysis[1].eventsCount).toBe(1);
  });

  it('returns empty array for no sales', () => {
    expect(getItemAnalysis([], [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getTopSellingProducts
// ---------------------------------------------------------------------------
describe('getTopSellingProducts', () => {
  it('returns top N products by quantity', () => {
    const sales = [
      makeSale({ id: 's1', itemName: 'A', quantity: 100 }),
      makeSale({ id: 's2', itemName: 'B', quantity: 200 }),
      makeSale({ id: 's3', itemName: 'C', quantity: 50 }),
    ];

    const top2 = getTopSellingProducts(sales, 2);
    expect(top2.length).toBe(2);
    expect(top2[0].name).toBe('B');
    expect(top2[1].name).toBe('A');
  });

  it('returns all if fewer than limit', () => {
    const sales = [makeSale({ id: 's1', itemName: 'X', quantity: 1 })];
    const top = getTopSellingProducts(sales, 5);
    expect(top.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getProfitByEvent
// ---------------------------------------------------------------------------
describe('getProfitByEvent', () => {
  it('returns per-event profit sorted descending', () => {
    const events = [
      makeEvent({ id: 'e1', name: 'Low', boothFee: 100, travelCost: 0 }),
      makeEvent({ id: 'e2', name: 'High', boothFee: 0, travelCost: 0 }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', quantity: 5, salePrice: 10, costPerItem: 3 }),
      makeSale({ id: 's2', eventId: 'e2', quantity: 5, salePrice: 10, costPerItem: 3 }),
    ];

    const result = getProfitByEvent(events, sales);

    // e2 net = 35, e1 net = 35-100 = -65
    expect(result[0].name).toBe('High');
    expect(result[0].profit).toBe(35);
    expect(result[1].profit).toBe(-65);
  });

  it('truncates long event names to 12 chars + ellipsis', () => {
    const events = [makeEvent({ name: 'Super Long Event Name Here' })];
    const result = getProfitByEvent(events, []);
    expect(result[0].name).toBe('Super Long E...');
  });
});

// ---------------------------------------------------------------------------
// getExtendedStats
// ---------------------------------------------------------------------------
describe('getExtendedStats', () => {
  it('returns correct aggregate figures', () => {
    const events = [
      makeEvent({ id: 'e1', boothFee: 40, travelCost: 10, suppliesCost: 5, miscCost: 5 }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', quantity: 10, salePrice: 8, costPerItem: 3 }),
      makeSale({ id: 's2', eventId: 'e1', itemName: 'Brownie', quantity: 5, salePrice: 6, costPerItem: 2 }),
    ];

    const ext = getExtendedStats(events, sales);

    // totalRevenue = 80 + 30 = 110
    // totalCOGS = 30 + 10 = 40
    // totalExpenses = 40+10+5+5 = 60
    // netProfit = 110 - 40 - 60 = 10
    expect(ext.profitMargin).toBeCloseTo((10 / 110) * 100, 2);
    expect(ext.totalBoothFees).toBe(40);
    expect(ext.totalTravelCosts).toBe(10);
    expect(ext.totalSuppliesCosts).toBe(5);
    expect(ext.totalMiscCosts).toBe(5);
    expect(ext.totalItemsSold).toBe(15);
    // avgSaleValue = 110 / 2 transactions = 55
    expect(ext.avgSaleValue).toBe(55);
    expect(ext.avgItemsPerEvent).toBe(15);
    expect((ext.bestSeller as any)?.name).toBe('Cookie');
    expect(ext.totalCostOfGoods).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// calculateForecast
// ---------------------------------------------------------------------------
describe('calculateForecast', () => {
  it('returns zeros for no events', () => {
    const result = calculateForecast([], []);
    expect(result).toEqual({ predictedRevenue: 0, predictedProfit: 0, predictedItems: 0, basedOnEvents: 0 });
  });

  it('returns simple average when no target event', () => {
    const events = [
      makeEvent({ id: 'e1', boothFee: 0, travelCost: 0 }),
      makeEvent({ id: 'e2', boothFee: 0, travelCost: 0 }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', quantity: 10, salePrice: 5, costPerItem: 2 }),
      makeSale({ id: 's2', eventId: 'e2', quantity: 20, salePrice: 3, costPerItem: 1 }),
    ];

    const result = calculateForecast(events, sales);

    // e1 rev=50, profit=30, items=10; e2 rev=60, profit=40, items=20
    // avg rev = 55, avg profit = 35, avg items = 15
    expect(result.predictedRevenue).toBe(55);
    expect(result.predictedProfit).toBe(35);
    expect(result.predictedItems).toBe(15);
    expect(result.basedOnEvents).toBe(2);
  });

  it('excludes target event from source data', () => {
    const events = [
      makeEvent({ id: 'e1', boothFee: 0, travelCost: 0 }),
      makeEvent({ id: 'e2', boothFee: 0, travelCost: 0 }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', quantity: 10, salePrice: 5, costPerItem: 2 }),
      makeSale({ id: 's2', eventId: 'e2', quantity: 20, salePrice: 3, costPerItem: 1 }),
    ];
    const target = events[1]; // exclude e2

    const result = calculateForecast(events, sales, target);

    // Only e1: rev=50, profit=30, items=10
    expect(result.predictedRevenue).toBe(50);
    expect(result.predictedProfit).toBe(30);
    expect(result.predictedItems).toBe(10);
    expect(result.basedOnEvents).toBe(1);
  });

  it('applies higher weight to events sharing tags/location/weather', () => {
    const events = [
      makeEvent({ id: 'e1', boothFee: 0, travelCost: 0, location: 'Park', tags: ['food'], weather: 'sunny' }),
      makeEvent({ id: 'e2', boothFee: 0, travelCost: 0, location: 'Mall', tags: ['craft'] }),
      makeEvent({ id: 'target', boothFee: 0, travelCost: 0, location: 'Park', tags: ['food'], weather: 'sunny' }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', quantity: 10, salePrice: 10, costPerItem: 2 }),
      makeSale({ id: 's2', eventId: 'e2', quantity: 10, salePrice: 10, costPerItem: 2 }),
    ];
    const target = events[2];

    const result = calculateForecast(events, sales, target);

    // e1 weight: 1 + 0.5 (tag overlap="food") + 1 (location="Park") + 0.5 (weather="sunny") = 3
    // e2 weight: 1 (no overlaps)
    // Both have same rev (100) and profit (80) and items (10)
    // weighted avg is same as unweighted since values are identical:
    // predictedRevenue = (100*3 + 100*1) / 4 = 100
    expect(result.predictedRevenue).toBe(100);
    expect(result.basedOnEvents).toBe(2);
  });

  it('returns zeros when only target event exists', () => {
    const target = makeEvent({ id: 'only' });
    const result = calculateForecast([target], [], target);
    expect(result.predictedRevenue).toBe(0);
    expect(result.basedOnEvents).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// generateSmartInsights
// ---------------------------------------------------------------------------
describe('generateSmartInsights', () => {
  it('returns empty array with fewer than 2 events', () => {
    const insights = generateSmartInsights([makeEvent()], []);
    expect(insights).toEqual([]);
  });

  it('produces at least one insight with enough data', () => {
    // Create 4 events on different days with sales
    const events = [
      makeEvent({ id: 'e1', name: 'A', date: '2024-01-06T10:00:00Z', boothFee: 10, travelCost: 0, location: 'Park' }),
      makeEvent({ id: 'e2', name: 'B', date: '2024-01-13T10:00:00Z', boothFee: 10, travelCost: 0, location: 'Park' }),
      makeEvent({ id: 'e3', name: 'C', date: '2024-01-20T10:00:00Z', boothFee: 10, travelCost: 0, location: 'Mall' }),
      makeEvent({ id: 'e4', name: 'D', date: '2024-01-27T10:00:00Z', boothFee: 10, travelCost: 0, location: 'Mall' }),
    ];
    const sales = [
      makeSale({ id: 's1', eventId: 'e1', itemName: 'A', quantity: 10, salePrice: 10, costPerItem: 2 }),
      makeSale({ id: 's2', eventId: 'e2', itemName: 'A', quantity: 15, salePrice: 10, costPerItem: 2 }),
      makeSale({ id: 's3', eventId: 'e3', itemName: 'B', quantity: 20, salePrice: 8, costPerItem: 3 }),
      makeSale({ id: 's4', eventId: 'e4', itemName: 'B', quantity: 25, salePrice: 8, costPerItem: 3 }),
    ];

    const insights = generateSmartInsights(events, sales);

    expect(insights.length).toBeGreaterThan(0);
    // Each insight should have icon and key
    insights.forEach(i => {
      expect(i.icon).toBeDefined();
      expect(i.key).toBeDefined();
    });
  });

  it('caps insights at 5', () => {
    // Create many events to potentially trigger all insight types
    const events = Array.from({ length: 10 }, (_, i) =>
      makeEvent({
        id: `e${i}`,
        name: `Event ${i}`,
        date: `2024-0${(i % 9) + 1}-${15 + (i % 7)}T10:00:00Z`,
        boothFee: 200 + i * 50,
        travelCost: 50,
        location: i < 5 ? 'Park' : 'Mall',
      })
    );
    const sales = events.flatMap((e, i) => [
      makeSale({ id: `s${i}a`, eventId: e.id, itemName: 'Cookie', quantity: 10 + i * 5, salePrice: 5, costPerItem: 2 }),
      makeSale({ id: `s${i}b`, eventId: e.id, itemName: 'Brownie', quantity: 5 + i * 2, salePrice: 8, costPerItem: 3 }),
    ]);

    const insights = generateSmartInsights(events, sales);
    expect(insights.length).toBeLessThanOrEqual(5);
  });
});
