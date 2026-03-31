// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - HEADER COMPONENT (Premium)
// ═══════════════════════════════════════════════════════════════

import { Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { SyncConfig } from '@/types';

interface HeaderProps {
  syncConfig: SyncConfig;
  isSyncing: boolean;
  onOpenSettings: () => void;
  onSync: () => void;
}

export function Header({ syncConfig, isSyncing, onOpenSettings, onSync }: HeaderProps) {
  const getSyncStatus = () => {
    if (isSyncing) return { icon: RefreshCw, text: 'Sincronizando...', className: 'animate-spin text-cyan-400' };
    if (!syncConfig.enabled) return { icon: WifiOff, text: 'Sin conexión', className: 'text-gray-500' };
    if (syncConfig.status === 'error') return { icon: WifiOff, text: 'Error', className: 'text-red-400' };
    if (syncConfig.status === 'synced') return { icon: Wifi, text: 'Conectado', className: 'text-green-400' };
    return { icon: Wifi, text: 'Listo', className: 'text-gray-400' };
  };

  const status = getSyncStatus();
  const StatusIcon = status.icon;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-glass">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo-holly-club.png" 
            alt="Holly Club" 
            className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]"
          />
        </div>

        {/* Sync Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Sync Pill */}
          <button
            onClick={onSync}
            disabled={isSyncing || !syncConfig.enabled}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:border-cyan-400/50 transition-all duration-300 disabled:opacity-50"
          >
            <StatusIcon className={`w-4 h-4 ${status.className}`} />
            <span className="text-xs text-gray-300 hidden sm:inline font-medium">{status.text}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all duration-300 touch-feedback"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
