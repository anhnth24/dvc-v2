import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import './toast-provider.css';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  position = 'top-right'
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration ?? defaultDuration
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev];
      return newToasts.slice(0, maxToasts);
    });

    // Auto remove after duration (unless persistent)
    if (!toast.persistent && toast.duration! > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [defaultDuration, maxToasts, removeToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}

      <div className={`toast-container toast-container--${position}`}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="toast-content">
              <div className="toast-header">
                <div className="toast-icon">
                  {getToastIcon(toast.type)}
                </div>
                <div className="toast-text">
                  {toast.title && (
                    <div className="toast-title">{toast.title}</div>
                  )}
                  <div className="toast-message">{toast.message}</div>
                </div>
                <button
                  className="toast-close"
                  onClick={() => removeToast(toast.id)}
                >
                  ×
                </button>
              </div>

              {toast.actions && toast.actions.length > 0 && (
                <div className="toast-actions">
                  {toast.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      className="toast-action-btn"
                      onClick={() => {
                        action.onClick();
                        removeToast(toast.id);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!toast.persistent && toast.duration! > 0 && (
              <div
                className="toast-progress"
                style={{
                  animationDuration: `${toast.duration}ms`
                }}
              />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Convenience hooks for different toast types
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    toast: {
      success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
        addToast({ type: 'success', message, ...options }),

      error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
        addToast({ type: 'error', message, ...options }),

      warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
        addToast({ type: 'warning', message, ...options }),

      info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
        addToast({ type: 'info', message, ...options }),

      custom: (toast: Omit<Toast, 'id'>) => addToast(toast)
    }
  };
}