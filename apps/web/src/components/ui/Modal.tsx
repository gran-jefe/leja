'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Set false for destructive confirmations you want deliberately acknowledged. */
  dismissOnBackdrop?: boolean;
}

/**
 * The app's only modal (agreement decline confirm) was an inline
 * `fixed inset-0` div: no portal, no focus trap, no Escape key, no scroll
 * lock, and no dialog semantics. This provides all five.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'sm',
  dismissOnBackdrop = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descId = React.useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement;

    // Scroll lock without layout shift from the disappearing scrollbar.
    const { body } = document;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    document.addEventListener('keydown', handleKeyDown);

    const raf = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panelRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      restoreFocusTo.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={dismissOnBackdrop ? onClose : undefined}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full bg-white shadow-xl outline-none',
              // Bottom sheet on mobile, centred dialog from sm up.
              'rounded-t-2xl sm:rounded-card max-h-[90vh] overflow-y-auto',
              width
            )}
          >
            <div className="p-6">
              {(title || dismissOnBackdrop) && (
                <div className="flex items-start justify-between gap-4 mb-3">
                  {title && (
                    <h2
                      id={titleId}
                      className="font-display text-title font-semibold text-navy-900"
                    >
                      {title}
                    </h2>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="-mr-2 -mt-1 p-2 rounded-sm text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {description && (
                <p id={descId} className="font-body text-body-sm text-ink-500 mb-4">
                  {description}
                </p>
              )}
              {children}
              {footer && <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">{footer}</div>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
