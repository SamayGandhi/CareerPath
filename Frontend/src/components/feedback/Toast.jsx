/**
 * Toast.jsx
 * -----------------------------------------
 * Minimal, dependency-free toast notification system.
 * BATCH 1 UPDATE (visual only): icons now sit in a soft colored
 * circle for a more polished look, and the card gains a slightly
 * stronger shadow. ALL logic is unchanged: auto-dismiss timing
 * (4000ms), max-visible-stack behavior (slice(-2)), ToastProvider/
 * useToast exported API, dismissToast/showToast signatures.
 */

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { classNames } from '../../utils';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLOR_CLASSES = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
};

const BG_CLASSES = {
  success: 'bg-success/10',
  error: 'bg-danger/10',
  info: 'bg-info/10',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={classNames(
                'flex items-start gap-3 rounded-lg border border-border-subtle bg-surface',
                'min-w-[280px] max-w-sm px-4 py-3 shadow-lg animate-toast-in'
              )}
            >
              <div
                className={classNames(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  BG_CLASSES[toast.type]
                )}
              >
                <Icon className={classNames('h-4 w-4', COLOR_CLASSES[toast.type])} />
              </div>
              <p className="flex-1 pt-1 text-sm text-text-primary">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="mt-1 text-text-tertiary transition-colors duration-150 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}