// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - ORDERS VIEW COMPONENT (Premium)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Receipt
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OrdersViewProps {
  orders: Order[];
  onRetryOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrderItem: (orderId: string, itemIndex: number) => void;
}

type FilterStatus = 'all' | 'pending' | 'paid' | 'cancelled';

export function OrdersView({
  orders,
  onRetryOrder,
  onDeleteOrder,
  onUpdateStatus,
  onDeleteOrderItem,
}: OrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ orderId: string; itemIndex: number } | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // Group orders by table
  const ordersByTable = useMemo(() => {
    const grouped = new Map<string, Order[]>();
    filteredOrders.forEach((order) => {
      const existing = grouped.get(order.table) || [];
      grouped.set(order.table, [...existing, order]);
    });
    return grouped;
  }, [filteredOrders]);

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="status-badge pending flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'paid':
        return (
          <span className="status-badge paid flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />
            Pagado
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-400 flex items-center gap-1.5">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-effect border-b border-white/10 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por mesa o producto..."
            className="pl-11 input-glass"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['all', 'pending', 'paid', 'cancelled'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`filter-pill whitespace-nowrap ${filterStatus === status ? 'active' : ''}`}
            >
              {status === 'all' && 'Todos'}
              {status === 'pending' && 'Pendientes'}
              {status === 'paid' && 'Pagados'}
              {status === 'cancelled' && 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
        {Array.from(ordersByTable.entries()).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Receipt className="w-12 h-12 opacity-50" />
            </div>
            <p className="text-xl font-semibold text-white mb-2">No hay pedidos</p>
            <p className="text-sm text-gray-400">Los pedidos aparecerán aquí</p>
          </div>
        ) : (
          Array.from(ordersByTable.entries()).map(([table, tableOrders]) => (
            <div key={table} className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <span className="text-lg font-bold text-gradient">{table.charAt(0).toUpperCase()}</span>
                  </div>
                  <span>{table}</span>
                </h3>
                <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                  {tableOrders.length} pedido{tableOrders.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Orders for this table */}
              <div className="space-y-3">
                {tableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="order-card overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusBadge(order.status)}
                            <span className="text-xs text-gray-500">
                              {order.date} · {order.time}
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-gradient">
                            {formatPrice(order.total)}
                          </p>
                          {order.payAmount > 0 && (
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-500">
                                Pagó: <span className="text-gray-300">{formatPrice(order.payAmount)}</span>
                              </span>
                              <span className={order.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {order.change >= 0 ? 'Cambio:' : 'Falta:'} {formatPrice(Math.abs(order.change))}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/95 border-white/10 backdrop-blur-xl">
                            <DropdownMenuItem
                              onClick={() => onRetryOrder(order.id)}
                              className="text-white hover:bg-cyan-500/20 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4 mr-2 text-cyan-400" />
                              Reintentar pedido
                            </DropdownMenuItem>
                            {order.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => onUpdateStatus(order.id, 'paid')}
                                className="text-green-400 hover:bg-green-500/20 cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar como pagado
                              </DropdownMenuItem>
                            )}
                            {order.status === 'paid' && (
                              <DropdownMenuItem
                                onClick={() => onUpdateStatus(order.id, 'pending')}
                                className="text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Marcar como pendiente
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setOrderToDelete(order.id)}
                              className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar pedido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Expandable Items */}
                    <button
                      onClick={() => toggleExpanded(order.id)}
                      className="w-full px-4 py-3 bg-white/5 flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors border-t border-white/5"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                      </span>
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {expandedOrders.has(order.id) && (
                      <div className="px-4 py-3 space-y-2 border-t border-white/5">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-cyan-400 font-bold">{item.quantity}x</span>
                              <span className="text-sm text-white">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-400">
                                {formatPrice(item.subtotal)}
                              </span>
                              <button
                                onClick={() => setItemToDelete({ orderId: order.id, itemIndex: index })}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors group"
                              >
                                <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Order Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent className="bg-black/95 border-white/10 backdrop-blur-xl text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              ¿Eliminar pedido?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. El pedido se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToDelete) {
                  onDeleteOrder(orderToDelete);
                  setOrderToDelete(null);
                }
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent className="bg-black/95 border-white/10 backdrop-blur-xl text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Este producto se eliminará del pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  onDeleteOrderItem(itemToDelete.orderId, itemToDelete.itemIndex);
                  setItemToDelete(null);
                }
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default OrdersView;
