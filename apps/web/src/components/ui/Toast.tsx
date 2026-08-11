'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * The app had no toast layer at all — feedback was inline banners, `setTimeout`
 * string swaps, full-page state replacement, and `?created=1` query params.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const tones: Record<ToastTone, string> = {
  success: 'border-l-success-500',
  error: 'border-l-danger-500',
  warning: 'border-l-warning-500',
  info: 'border-l-navy-600',
};

const iconTones: Record<ToastTone, string> = {
  success: 'text-success-600',
  error: 'text-danger-600',
  warning: 'text-warning-600',
  info: 'text-navy-600',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = nextId.current++;
      setItems((prev) => [...prev, { ...t, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), t.tone === 'error' ? 7000 : 4500)
      );
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ tone: 'success', title, description }),
      error: (title, description) => toast({ tone: 'error', title, description }),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="false"
            className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
          >
            <AnimatePresence initial={false}>
              {items.map((t) => {
                const Icon = icons[t.tone];
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-card shadow-lg',
                      'border border-ink-200 border-l-4',
                      tones[t.tone]
                    )}
                  >
                    <Icon size={18} className={cn('flex-shrink-0 mt-0.5', iconTones[t.tone])} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-body-sm text-ink-800">{t.title}</p>
                      {t.description && (
                        <p className="font-body text-body-sm text-ink-500 mt-0.5">{t.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(t.id)}
                      aria-label="Dismiss notification"
                      className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-sm text-ink-400 hover:text-ink-700 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
