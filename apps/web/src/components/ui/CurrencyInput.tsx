'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  label?: string;
  error?: string;
  value: number | undefined;
  onValueChange?: (value: number) => void;
  placeholder?: string;
  readOnly?: boolean;
  helperText?: string;
  className?: string;
}

const formatDigits = (digits: string) => (digits ? Number(digits).toLocaleString('en-NG') : '');

// A plain type="number" input can't show thousand separators while typing
// (that's what "the amount formatter" was asking for) — landlords entering
// e.g. 2,400,000 in annual rent need to see it formatted as they type, not
// squint at a raw "2400000". Stores/emits the underlying number; only the
// display string carries the commas.
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  error,
  value,
  onValueChange,
  placeholder,
  readOnly,
  helperText,
  className,
}) => {
  const [display, setDisplay] = useState(value ? value.toLocaleString('en-NG') : '');
  const [focused, setFocused] = useState(false);

  // Don't stomp on what the user is actively typing — only resync the
  // display from the external value when the field isn't focused (e.g. a
  // computed read-only field, or the value was reset programmatically).
  useEffect(() => {
    if (!focused) {
      setDisplay(value ? value.toLocaleString('en-NG') : '');
    }
  }, [value, focused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setDisplay(formatDigits(digits));
    onValueChange?.(digits ? Number(digits) : 0);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal mb-2 font-body">{label}</label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-body pointer-events-none">
          ₦
        </span>
        <input
          type="text"
          inputMode="numeric"
          readOnly={readOnly}
          value={display}
          onChange={readOnly ? undefined : handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-8 pr-4 py-2 font-body border border-border rounded-button',
            'focus:outline-none focus:ring-2 focus:ring-forest',
            readOnly && 'bg-cream text-muted cursor-not-allowed',
            error && 'border-ember focus:ring-ember',
            className
          )}
        />
      </div>
      {helperText && !error && <p className="text-xs text-muted mt-1 font-body">{helperText}</p>}
      {error && <p className="text-sm text-ember mt-1 font-body">{error}</p>}
    </div>
  );
};
