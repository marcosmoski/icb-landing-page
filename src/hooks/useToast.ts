import { useCallback } from 'react';

// Tipos para toast
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Evento customizado para comunicação entre componentes
const TOAST_EVENT = 'toast-notification';

export const useToast = () => {
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const toastWithId: Toast = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      duration: 5000, // 5 segundos por padrão
      ...toast,
    };

    // Dispara evento customizado
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toastWithId }));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
};

// Hook para ouvir toasts (usado pelo componente ToastContainer)
export const useToastListener = (callback: (toast: Toast) => void) => {
  const handleToast = useCallback((event: CustomEvent<Toast>) => {
    callback(event.detail);
  }, [callback]);

  return {
    listen: () => {
      window.addEventListener(TOAST_EVENT, handleToast as EventListener);
      return () => window.removeEventListener(TOAST_EVENT, handleToast as EventListener);
    }
  };
};
