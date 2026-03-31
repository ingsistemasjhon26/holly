// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - NAVIGATION COMPONENT (Premium)
// ═══════════════════════════════════════════════════════════════

import { UtensilsCrossed, ClipboardList, BarChart3 } from 'lucide-react';

export type ViewType = 'menu' | 'orders' | 'sales';

interface NavigationProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export function Navigation({ currentView, onChangeView }: NavigationProps) {
  const navItems: { id: ViewType; label: string; icon: typeof UtensilsCrossed }[] = [
    { id: 'menu', label: 'Menú', icon: UtensilsCrossed },
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'sales', label: 'Ventas', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`nav-item flex-1 ${isActive ? 'active' : ''}`}
            >
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-400/20 to-purple-500/20 shadow-[0_0_15px_rgba(0,212,255,0.3)]' 
                  : 'hover:bg-white/5'
              }`}>
                <Icon className={`w-6 h-6 transition-all duration-300 ${
                  isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : 'text-gray-400'
                }`} />
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${
                isActive ? 'text-cyan-400' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Navigation;
