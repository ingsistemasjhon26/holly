// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - APLICACIÓN PRINCIPAL (Con Fondo Discoteca)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Header, Navigation, Toast, MenuView, CartDrawer, OrdersView, SalesView, ConfigModal, type ViewType, type ToastType } from '@/components';
import { useOrders, useSync } from '@/hooks';
import type { Product, CartItem, OrderStatus } from '@/types';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

function App() {
  // State
  const [currentView, setCurrentView] = useState<ViewType>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hooks
  const {
    orders,
    addOrder,
    retryOrder,
    updateOrderStatus,
    deleteOrder,
    deleteOrderItem,
  } = useOrders();

  const {
    config: syncConfig,
    setConfig: setSyncConfig,
    isSyncing,
    addOrder: syncAddOrder,
    updateOrderStatus: syncUpdateStatus,
    deleteOrder: syncDeleteOrder,
    testConnection,
  } = useSync();

  // Toast helpers
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cart actions
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (!item) return prev;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter((i) => i.id !== productId);
      }

      return prev.map((i) =>
        i.id === productId ? { ...i, quantity: newQuantity } : i
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Order submission
  const submitOrder = useCallback(
    async (table: string, payAmount: number) => {
      const cartItems = [...cart];
      if (cartItems.length === 0) return;

      // Create order locally
      const newOrder = addOrder(table, cartItems, payAmount);

      // Sync with Google Sheets if enabled
      if (syncConfig.enabled) {
        const success = await syncAddOrder(newOrder);
        if (success) {
          showToast('Pedido sincronizado con Google Sheets', 'success');
        } else {
          showToast('Pedido guardado localmente. Error al sincronizar.', 'warning');
        }
      } else {
        showToast('Pedido registrado correctamente', 'success');
      }

      // Clear cart
      clearCart();
      setIsCartOpen(false);
    },
    [cart, addOrder, syncConfig.enabled, syncAddOrder, clearCart, showToast]
  );

  // Order actions
  const handleRetryOrder = useCallback(
    async (orderId: string) => {
      const retriedOrder = retryOrder(orderId);
      if (retriedOrder) {
        if (syncConfig.enabled) {
          await syncAddOrder(retriedOrder);
        }
        showToast('Pedido reintentado', 'success');
      }
    },
    [retryOrder, syncConfig.enabled, syncAddOrder, showToast]
  );

  const handleDeleteOrder = useCallback(
    async (orderId: string) => {
      deleteOrder(orderId);
      if (syncConfig.enabled) {
        await syncDeleteOrder(orderId);
      }
      showToast('Pedido eliminado', 'success');
    },
    [deleteOrder, syncConfig.enabled, syncDeleteOrder, showToast]
  );

  const handleUpdateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      updateOrderStatus(orderId, status);
      if (syncConfig.enabled) {
        await syncUpdateStatus(orderId, status);
      }
      showToast(
        status === 'paid' ? 'Pedido marcado como pagado' : 'Pedido marcado como pendiente',
        'success'
      );
    },
    [updateOrderStatus, syncConfig.enabled, syncUpdateStatus, showToast]
  );

  const handleDeleteOrderItem = useCallback(
    (orderId: string, itemIndex: number) => {
      deleteOrderItem(orderId, itemIndex);
      showToast('Producto eliminado del pedido', 'success');
    },
    [deleteOrderItem, showToast]
  );

  // Sync action
  const handleSync = useCallback(async () => {
    if (!syncConfig.enabled) {
      showToast('Sincronización no configurada', 'error');
      return;
    }

    const success = await testConnection();
    if (success) {
      showToast('Conexión exitosa', 'success');
    } else {
      showToast('Error de conexión', 'error');
    }
  }, [syncConfig.enabled, testConnection, showToast]);

  // Config actions
  const handleSaveConfig = useCallback(
    (newConfig: typeof syncConfig) => {
      setSyncConfig(newConfig);
      showToast('Configuración guardada', 'success');
    },
    [setSyncConfig, showToast]
  );

  return (
    <div className="min-h-screen text-white relative">
      {/* Fondo de Discoteca */}
      <div className="discoteca-bg" />
      
      {/* Header */}
      <Header
        syncConfig={syncConfig}
        isSyncing={isSyncing}
        onOpenSettings={() => setIsConfigOpen(true)}
        onSync={handleSync}
      />

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24 overflow-hidden relative z-10">
        {currentView === 'menu' && (
          <MenuView
            cart={cart}
            onAddToCart={addToCart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            orders={orders}
            onRetryOrder={handleRetryOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrderItem={handleDeleteOrderItem}
          />
        )}

        {currentView === 'sales' && (
          <SalesView orders={orders} />
        )}
      </main>

      {/* Navigation */}
      <Navigation currentView={currentView} onChangeView={setCurrentView} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onSubmitOrder={submitOrder}
      />

      {/* Config Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={syncConfig}
        onSave={handleSaveConfig}
        onTest={testConnection}
        isTesting={isSyncing}
      />

      {/* Toasts */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
