// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - TOAST NOTIFICATIONS (Premium)
// ═══════════════════════════════════════════════════════════════

import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-500/20 border-green-500/40 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    error: 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    warning: 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    info: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.3)]',
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${styles[type]}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-semibold whitespace-nowrap">{message}</span>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}

export default Toast;
