// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - MENU VIEW COMPONENT (Con Imágenes)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/types';
import type { Product, CartItem } from '@/types';

interface MenuViewProps {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onOpenCart: () => void;
}

export function MenuView({
  cart,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart,
}: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getItemQuantity = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    return item?.quantity || 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Filter */}
      <div className="sticky top-0 z-10 glass-effect border-b border-white/10">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-pill whitespace-nowrap ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            Todos
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-pill whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === cat.id ? 'active' : ''
              }`}
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {selectedCategory === 'all' ? (
          // Show products grouped by category
          PRODUCT_CATEGORIES.map((category) => {
            const categoryProducts = PRODUCTS.filter(p => p.category === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-gradient">{category.name}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={getItemQuantity(product.id)}
                      onAdd={() => onAddToCart(product)}
                      onUpdateQuantity={(delta) => onUpdateQuantity(product.id, delta)}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Show filtered products
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getItemQuantity(product.id)}
                onAdd={() => onAddToCart(product)}
                onUpdateQuantity={(delta) => onUpdateQuantity(product.id, delta)}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button
          onClick={onOpenCart}
          className="fixed bottom-28 right-4 z-40 cart-fab flex items-center gap-3 touch-feedback"
        >
          <ShoppingCart className="w-5 h-5" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium opacity-80">{cartCount} items</span>
            <span className="text-sm font-bold">{formatPrice(cartTotal)}</span>
          </div>
        </button>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (delta: number) => void;
  formatPrice: (price: number) => string;
}

function ProductCard({ product, quantity, onAdd, onUpdateQuantity, formatPrice }: ProductCardProps) {
  return (
    <div className="product-card group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg animate-pulse">
            {quantity}
          </div>
        )}
        
        {/* Add Button Overlay */}
        <button
          onClick={onAdd}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:scale-110"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 relative">
        <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h4>
        <p className="text-lg font-bold text-gradient">{formatPrice(product.price)}</p>
        
        {/* Quantity Controls */}
        {quantity > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(-1);
              }}
              className="qty-btn minus"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-bold text-white min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(1);
              }}
              className="qty-btn plus"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuView;
