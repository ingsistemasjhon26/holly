// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - GESTIÓN DE PEDIDOS
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from 'react';
import type { Order, OrderStatus, CartItem, OrderItem } from '@/types';
import { useLocalStorage } from './useLocalStorage';

interface UseOrdersReturn {
  orders: Order[];
  pendingOrders: Order[];
  paidOrders: Order[];
  cancelledOrders: Order[];
  ordersByTable: Map<string, Order[]>;
  addOrder: (table: string, items: CartItem[], payAmount: number) => Order;
  retryOrder: (orderId: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  deleteOrderItem: (orderId: string, itemIndex: number) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByTable: (table: string) => Order[];
  clearAllOrders: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useLocalStorage<Order[]>('holly-club-orders', []);

  const pendingOrders = useMemo(() => 
    orders.filter(o => o.status === 'pending'), 
    [orders]
  );

  const paidOrders = useMemo(() => 
    orders.filter(o => o.status === 'paid'), 
    [orders]
  );

  const cancelledOrders = useMemo(() => 
    orders.filter(o => o.status === 'cancelled'), 
    [orders]
  );

  const ordersByTable = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach(order => {
      const existing = map.get(order.table) || [];
      map.set(order.table, [...existing, order]);
    });
    return map;
  }, [orders]);

  const generateOrderId = (): string => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatDate = (): { date: string; time: string } => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const addOrder = useCallback((table: string, items: CartItem[], payAmount: number): Order => {
    const { date, time } = formatDate();
    const total = calculateTotal(items);
    
    const orderItems: OrderItem[] = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const newOrder: Order = {
      id: generateOrderId(),
      table: table.trim() || 'Sin Mesa',
      items: orderItems,
      total,
      payAmount,
      change: payAmount - total,
      status: 'pending',
      date,
      time,
      timestamp: Date.now(),
      synced: false,
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [setOrders]);

  const retryOrder = useCallback((orderId: string): Order | null => {
    const originalOrder = orders.find(o => o.id === orderId);
    if (!originalOrder) return null;

    const { date, time } = formatDate();
    const retriedOrder: Order = {
      ...originalOrder,
      id: generateOrderId(),
      date,
      time,
      timestamp: Date.now(),
      status: 'pending',
      synced: false,
    };

    setOrders(prev => [retriedOrder, ...prev]);
    return retriedOrder;
  }, [orders, setOrders]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status, synced: false } : order
    ));
  }, [setOrders]);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  }, [setOrders]);

  const deleteOrderItem = useCallback((orderId: string, itemIndex: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const newItems = order.items.filter((_, idx) => idx !== itemIndex);
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      return {
        ...order,
        items: newItems,
        total: newTotal,
        change: order.payAmount - newTotal,
        synced: false,
      };
    }));
  }, [setOrders]);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find(o => o.id === orderId);
  }, [orders]);

  const getOrdersByTable = useCallback((table: string) => {
    return orders.filter(o => o.table.toLowerCase() === table.toLowerCase());
  }, [orders]);

  const clearAllOrders = useCallback(() => {
    setOrders([]);
  }, [setOrders]);

  return {
    orders,
    pendingOrders,
    paidOrders,
    cancelledOrders,
    ordersByTable,
    addOrder,
    retryOrder,
    updateOrderStatus,
    deleteOrder,
    deleteOrderItem,
    getOrderById,
    getOrdersByTable,
    clearAllOrders,
  };
}

export default useOrders;
