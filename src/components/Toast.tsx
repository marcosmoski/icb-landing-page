import React, { useEffect, useState } from 'react';
import { useToastListener } from '../hooks/useToast';
import type { Toast } from '../hooks/useToast';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Aparecer com animação
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-remover após duração
    const duration = toast.duration || 5000;
    const removeTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300); // Tempo da animação de saída
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'error':
        return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'warning':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 'info':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div
      className={`
        w-full max-w-sm
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'}
        ${isExiting ? '-translate-y-full opacity-0 scale-95' : ''}
      `}
    >
      <div className={`
        bg-gradient-to-r ${getColors()} backdrop-blur-md
        border rounded-xl p-4 shadow-xl
        ring-1 ring-white/10
      `}>
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="flex-shrink-0 text-2xl">
            {getIcon()}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm leading-tight">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-white/90 text-sm mt-1 leading-relaxed">
                {toast.message}
              </p>
            )}

            {/* Ação opcional */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Botão fechar */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="mt-3 bg-white/20 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full bg-white/60 rounded-full transition-all duration-75 ease-linear ${
              isExiting ? 'w-0' : 'w-full'
            }`}
            style={{
              animation: !isExiting ? `shrink ${toast.duration || 5000}ms linear forwards` : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// CSS global para animações
const globalStyles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Injetar CSS global
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { listen } = useToastListener((toast) => {
    setToasts(prev => [...prev, toast]);
  });

  useEffect(() => {
    const cleanup = listen();
    return cleanup;
  }, [listen]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none px-4 md:px-0 md:left-auto md:right-4 md:top-4 md:w-auto">
      <div className="flex flex-col items-center md:items-end gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full md:w-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
export { ToastItem };
