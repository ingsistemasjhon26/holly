// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - CART DRAWER COMPONENT (Premium)
// ═══════════════════════════════════════════════════════════════
 
import { useState } from 'react';
import { Minus, Plus, Trash2, Receipt, Calculator, ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
 
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (table: string, payAmount: number) => void;
}
 
export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
}: CartDrawerProps) {
  const [table, setTable] = useState('');
  const [payAmount, setPayAmount] = useState('');
 
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const payValue = parseFloat(payAmount) || 0;
  const change = payValue - cartTotal;
 
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };
 
  const handleSubmit = () => {
    if (cart.length === 0) return;
    onSubmitOrder(table || 'Sin Mesa', payValue);
    setTable('');
    setPayAmount('');
    onClose();
  };
 
  const isValidPayment = payValue >= cartTotal;
 
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md bg-black/95 border-l border-white/10 backdrop-blur-xl p-0"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b border-white/10 pb-4 px-6 pt-6">
            <SheetTitle className="text-white flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-gradient">Pedido Actual</span>
            </SheetTitle>
          </SheetHeader>
 
          <div className="flex-1 overflow-hidden flex flex-col">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <ShoppingCart className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-xl font-semibold text-white mb-2">Tu pedido está vacío</p>
                <p className="text-sm text-gray-400">Agrega productos del menú</p>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 glass-card rounded-xl"
                      >
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{formatPrice(item.price)} c/u</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 hover:shadow-[0_0_10px_rgba(0,212,255,0.5)] flex items-center justify-center transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-right min-w-[70px]">
                          <p className="text-sm font-bold text-gradient">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
 
                {/* Order Details - Fixed at bottom */}
                <div className="border-t border-white/10 px-6 py-4 space-y-4 bg-black/50">
                  {/* Table Input */}
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Mesa / Cliente <span className="text-gray-600 text-xs">(opcional)</span>
                    </Label>
                    <Input
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      placeholder="Ej: Mesa 3"
                      className="input-glass"
                    />
                  </div>
 
                  {/* Payment Input */}
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-cyan-400" />
                      Paga con
                    </Label>
                    <Input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0"
                      className="input-glass text-lg font-bold"
                    />
                  </div>
 
                  {/* Change Display */}
                  {payValue > 0 && (
                    <div className={`p-4 rounded-xl border ${
                      isValidPayment 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold ${isValidPayment ? 'text-green-400' : 'text-red-400'}`}>
                          {isValidPayment ? 'Cambio' : 'Falta'}
                        </span>
                        <span className={`text-2xl font-bold ${
                          isValidPayment ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPrice(Math.abs(change))}
                        </span>
                      </div>
                    </div>
                  )}
 
                  {/* Total */}
                  <div className="flex justify-between items-center py-2 border-t border-white/10">
                    <span className="text-gray-400 text-lg">Total</span>
                    <span className="text-3xl font-bold text-gradient">{formatPrice(cartTotal)}</span>
                  </div>
 
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClearCart}
                      className="flex-1 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white hover:border-red-400/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={cart.length === 0}
                      className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50 transition-all"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Registrar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
 
export default CartDrawer;