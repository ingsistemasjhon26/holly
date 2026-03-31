// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - DASHBOARD DE VENTAS
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from 'react';
import type { Order, DashboardStats, FilterOptions, DateRange } from '@/types';

interface UseSalesReturn {
  stats: DashboardStats;
  filteredOrders: Order[];
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  applyDateRange: (range: DateRange, startDate?: string, endDate?: string) => void;
  exportToExcel: () => { data: unknown[][]; sheetName: string };
}

export function useSales(orders: Order[]): UseSalesReturn {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    range: 'today',
  });

  const getDateRange = useCallback((range: DateRange, customStart?: string, customEnd?: string): { start: Date; end: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000) };
      
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date(weekStart.getTime() + 7 * 86400000) };
      }
      
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      }
      
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
        return { start: yearStart, end: yearEnd };
      }
      
      case 'custom':
        if (customStart && customEnd) {
          return {
            start: new Date(customStart),
            end: new Date(new Date(customEnd).getTime() + 86400000),
          };
        }
        return { start: today, end: new Date(today.getTime() + 86400000) };
      
      default:
        return { start: today, end: new Date(today.getTime() + 86400000) };
    }
  }, []);

  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange(filterOptions.range, filterOptions.startDate, filterOptions.endDate);
    
    return orders.filter(order => {
      if (order.status !== 'paid') return false;
      
      const orderDate = new Date(order.timestamp);
      const inRange = orderDate >= start && orderDate < end;
      
      if (filterOptions.table && filterOptions.table !== 'all') {
        return inRange && order.table === filterOptions.table;
      }
      
      return inRange;
    });
  }, [orders, filterOptions, getDateRange]);

  const stats = useMemo((): DashboardStats => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Productos más vendidos
    const productMap = new Map<string, { quantity: number; total: number }>();
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productMap.get(item.name) || { quantity: 0, total: 0 };
        productMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          total: existing.total + item.subtotal,
        });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Ventas por fecha
    const salesByDateMap = new Map<string, { total: number; orders: number; items: number }>();
    filteredOrders.forEach(order => {
      const existing = salesByDateMap.get(order.date) || { total: 0, orders: 0, items: 0 };
      salesByDateMap.set(order.date, {
        total: existing.total + order.total,
        orders: existing.orders + 1,
        items: existing.items + order.items.reduce((sum, item) => sum + item.quantity, 0),
      });
    });

    const salesByDate = Array.from(salesByDateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Ventas por mesa
    const salesByTableMap = new Map<string, { total: number; orders: number }>();
    filteredOrders.forEach(order => {
      const existing = salesByTableMap.get(order.table) || { total: 0, orders: 0 };
      salesByTableMap.set(order.table, {
        total: existing.total + order.total,
        orders: existing.orders + 1,
      });
    });

    const salesByTable = Array.from(salesByTableMap.entries())
      .map(([table, data]) => ({ table, ...data }))
      .sort((a, b) => b.total - a.total);

    return {
      totalSales,
      totalOrders,
      averageTicket,
      topProducts,
      salesByDate,
      salesByTable,
    };
  }, [filteredOrders]);

  const applyDateRange = useCallback((range: DateRange, startDate?: string, endDate?: string) => {
    setFilterOptions(prev => ({
      ...prev,
      range,
      startDate,
      endDate,
    }));
  }, []);

  const exportToExcel = useCallback(() => {
    const headers = ['Fecha', 'Hora', 'Mesa', 'Productos', 'Total', 'Pago', 'Cambio', 'Estado'];
    
    const data = filteredOrders.map(order => [
      order.date,
      order.time,
      order.table,
      order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      order.total,
      order.payAmount,
      order.change,
      order.status === 'paid' ? 'PAGADO' : order.status === 'pending' ? 'PENDIENTE' : 'CANCELADO',
    ]);

    const sheetName = filterOptions.range === 'today' ? 'Ventas Hoy' :
                      filterOptions.range === 'week' ? 'Ventas Semana' :
                      filterOptions.range === 'month' ? 'Ventas Mes' :
                      filterOptions.range === 'year' ? 'Ventas Año' : 'Ventas Personalizado';

    return { data: [headers, ...data], sheetName };
  }, [filteredOrders, filterOptions.range]);

  return {
    stats,
    filteredOrders,
    filterOptions,
    setFilterOptions,
    applyDateRange,
    exportToExcel,
  };
}

export default useSales;
