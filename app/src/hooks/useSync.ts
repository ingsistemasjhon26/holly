// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - SINCRONIZACIÓN CON GOOGLE SHEETS
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import type { Order, SyncConfig } from '@/types';
import { useLocalStorage } from './useLocalStorage';

interface SyncActions {
  addOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  syncAll: (orders: Order[]) => Promise<{ success: number; failed: number }>;
}

interface UseSyncReturn extends SyncActions {
  config: SyncConfig;
  setConfig: (config: SyncConfig | ((prev: SyncConfig) => SyncConfig)) => void;
  isSyncing: boolean;
  lastError: string | null;
  testConnection: () => Promise<boolean>;
}

export function useSync(): UseSyncReturn {
  const [config, setConfig] = useLocalStorage<SyncConfig>('holly-club-sync-config', {
    scriptUrl: '',
    enabled: false,
    lastSync: null,
    status: 'idle',
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const updateStatus = useCallback((newStatus: SyncConfig['status']) => {
    setConfig(function(prev) {
      if (typeof prev === 'function') {
        return prev;
      }
      return { ...prev, status: newStatus };
    });
  }, [setConfig]);

  const makeRequest = useCallback(async (action: string, data: unknown): Promise<boolean> => {
    if (!config.scriptUrl || !config.enabled) {
      setLastError('Sincronización no configurada');
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(config.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Sync error:', error);
      setLastError(error instanceof Error ? error.message : 'Error de sincronización');
      return false;
    }
  }, [config.scriptUrl, config.enabled]);

  const addOrder = useCallback(async (order: Order): Promise<boolean> => {
    setIsSyncing(true);
    updateStatus('syncing');
    
    const success = await makeRequest('addOrder', {
      order: {
        id: order.id,
        table: order.table,
        items: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        total: order.total,
        pay: order.payAmount,
        change: order.change,
        date: order.date,
        time: order.time,
        status: order.status,
      },
    });

    setIsSyncing(false);
    updateStatus(success ? 'synced' : 'error');
    
    if (success) {
      setConfig(function(prev) {
        if (typeof prev === 'function') {
          return prev;
        }
        return { ...prev, lastSync: Date.now() };
      });
    }
    
    return success;
  }, [makeRequest, updateStatus, setConfig]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string): Promise<boolean> => {
    setIsSyncing(true);
    updateStatus('syncing');
    
    const success = await makeRequest('updateStatus', { id: orderId, status });
    
    setIsSyncing(false);
    updateStatus(success ? 'synced' : 'error');
    
    return success;
  }, [makeRequest, updateStatus]);

  const deleteOrder = useCallback(async (orderId: string): Promise<boolean> => {
    setIsSyncing(true);
    updateStatus('syncing');
    
    const success = await makeRequest('deleteOrder', { id: orderId });
    
    setIsSyncing(false);
    updateStatus(success ? 'synced' : 'error');
    
    return success;
  }, [makeRequest, updateStatus]);

  const syncAll = useCallback(async (orders: Order[]): Promise<{ success: number; failed: number }> => {
    setIsSyncing(true);
    updateStatus('syncing');
    setLastError(null);

    let successCount = 0;
    let failedCount = 0;

    const unsyncedOrders = orders.filter(o => !o.synced);

    for (const order of unsyncedOrders) {
      const result = await addOrder(order);
      if (result) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    setIsSyncing(false);
    updateStatus(failedCount === 0 ? 'synced' : 'error');
    
    if (failedCount > 0) {
      setLastError(`${failedCount} pedidos no pudieron sincronizarse`);
    }

    return { success: successCount, failed: failedCount };
  }, [addOrder, updateStatus]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!config.scriptUrl) return false;
    
    try {
      const response = await fetch(config.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      
      const result = await response.json();
      return result.success === true;
    } catch {
      return false;
    }
  }, [config.scriptUrl]);

  return {
    config,
    setConfig,
    isSyncing,
    lastError,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    syncAll,
    testConnection,
  };
}

export default useSync;
