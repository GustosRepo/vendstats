import { v4 as uuidv4 } from 'uuid';
import { mmkvStorage } from './mmkv';
import { Sale, CreateSaleInput, UpdateSaleInput, QuickSaleItem, STORAGE_KEYS } from '../types';

// Get all sales
export const getAllSales = (): Sale[] => {
  const sales = mmkvStorage.getJSON<Sale[]>(STORAGE_KEYS.SALES);
  return sales || [];
};

// Get sales for specific event
export const getSalesByEventId = (eventId: string): Sale[] => {
  const sales = getAllSales();
  return sales.filter(sale => sale.eventId === eventId);
};

// Get single sale by ID
export const getSaleById = (id: string): Sale | null => {
  const sales = getAllSales();
  return sales.find(sale => sale.id === id) || null;
};

// Create new sale
export const createSale = (input: CreateSaleInput): Sale => {
  const sales = getAllSales();
  const now = new Date().toISOString();

  const newSale: Sale = {
    id: uuidv4(),
    eventId: input.eventId,
    itemName: input.itemName,
    quantity: input.quantity,
    salePrice: input.salePrice,
    costPerItem: input.costPerItem,
    createdAt: now,
    updatedAt: now,
  };

  sales.push(newSale);
  mmkvStorage.setJSON(STORAGE_KEYS.SALES, sales);

  return newSale;
};

// Quick create sale (optimized for fast entry)
export const quickCreateSale = (
  eventId: string,
  itemName: string,
  salePrice: number,
  costPerItem: number,
  quantity: number = 1
): Sale => {
  return createSale({
    eventId,
    itemName,
    quantity,
    salePrice,
    costPerItem,
  });
};

// Update existing sale
export const updateSale = (input: UpdateSaleInput): Sale | null => {
  const sales = getAllSales();
  const index = sales.findIndex(sale => sale.id === input.id);

  if (index === -1) {
    return null;
  }

  const updatedSale: Sale = {
    ...sales[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  sales[index] = updatedSale;
  mmkvStorage.setJSON(STORAGE_KEYS.SALES, sales);

  return updatedSale;
};

// Delete sale
export const deleteSale = (id: string): boolean => {
  const sales = getAllSales();
  const filteredSales = sales.filter(sale => sale.id !== id);

  if (filteredSales.length === sales.length) {
    return false;
  }

  mmkvStorage.setJSON(STORAGE_KEYS.SALES, filteredSales);
  return true;
};

// Delete all sales for an event
export const deleteAllSalesForEvent = (eventId: string): number => {
  const sales = getAllSales();
  const filteredSales = sales.filter(sale => sale.eventId !== eventId);
  const deletedCount = sales.length - filteredSales.length;

  mmkvStorage.setJSON(STORAGE_KEYS.SALES, filteredSales);
  return deletedCount;
};

// Quick Sale Items Management
export const getQuickSaleItems = (): QuickSaleItem[] => {
  const items = mmkvStorage.getJSON<QuickSaleItem[]>(STORAGE_KEYS.QUICK_ITEMS);
  return items || [];
};

export const addQuickSaleItem = (item: Omit<QuickSaleItem, 'id'>): QuickSaleItem => {
  const items = getQuickSaleItems();
  const newItem: QuickSaleItem = {
    id: uuidv4(),
    ...item,
  };

  items.push(newItem);
  mmkvStorage.setJSON(STORAGE_KEYS.QUICK_ITEMS, items);

  return newItem;
};

export const deleteQuickSaleItem = (id: string): boolean => {
  const items = getQuickSaleItems();
  const filteredItems = items.filter(item => item.id !== id);

  if (filteredItems.length === items.length) {
    return false;
  }

  mmkvStorage.setJSON(STORAGE_KEYS.QUICK_ITEMS, filteredItems);
  return true;
};

// Get sales count for event
export const getSalesCountForEvent = (eventId: string): number => {
  return getSalesByEventId(eventId).length;
};
