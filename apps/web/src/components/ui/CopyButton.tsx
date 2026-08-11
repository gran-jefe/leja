'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  onDark?: boolean;
}

/** Consolidates the copy-and-reset dance repeated in dashboard,
 *  agreement/[id] and PaymentInstructions. */
export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label = 'Copy',
  className,
  onDark,
}) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // The originals never cleared their timeout, so copying then navigating away
  // set state on an unmounted component.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (insecure context) — leave the button idle */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm font-body text-body-sm font-medium',
        'transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
        onDark ? 'text-on-dark-muted hover:bg-white/10' : 'text-ink-500 hover:bg-ink-100',
        copied && (onDark ? 'text-success-500' : 'text-success-600'),
        className
      )}
    >
      {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
};
