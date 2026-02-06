import { useState, useCallback, useEffect } from 'react';
import { 
  getAllSales,
  getSalesByEventId,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  quickCreateSale,
} from '../storage';
import { Sale, CreateSaleInput, UpdateSaleInput } from '../types';

/**
 * Hook for managing sales
 */
export const useSales = (eventId?: string) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(() => {
    setLoading(true);
    const salesData = eventId ? getSalesByEventId(eventId) : getAllSales();
    setSales(salesData);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const addSale = useCallback((input: CreateSaleInput) => {
    const sale = createSale(input);
    loadSales();
    return sale;
  }, [loadSales]);

  const addQuickSale = useCallback((
    eventId: string,
    itemName: string,
    salePrice: number,
    costPerItem: number,
    quantity?: number
  ) => {
    const sale = quickCreateSale(eventId, itemName, salePrice, costPerItem, quantity);
    loadSales();
    return sale;
  }, [loadSales]);

  const editSale = useCallback((input: UpdateSaleInput) => {
    const sale = updateSale(input);
    loadSales();
    return sale;
  }, [loadSales]);

  const removeSale = useCallback((id: string) => {
    const success = deleteSale(id);
    loadSales();
    return success;
  }, [loadSales]);

  const getSale = useCallback((id: string) => {
    return getSaleById(id);
  }, []);

  return {
    sales,
    loading,
    loadSales,
    addSale,
    addQuickSale,
    editSale,
    removeSale,
    getSale,
    salesCount: sales.length,
  };
};
