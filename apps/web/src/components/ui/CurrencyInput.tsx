'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FieldShell, fieldControl, useFieldIds, type FieldOwnProps } from './FieldShell';

interface CurrencyInputProps extends FieldOwnProps {
  value: number | undefined;
  onValueChange?: (value: number) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  id?: string;
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
  required,
  hideLabel,
  className,
  id: idProp,
}) => {
  const [display, setDisplay] = useState(value ? value.toLocaleString('en-NG') : '');
  const [focused, setFocused] = useState(false);
  const { id, errorId, helpId, ariaProps } = useFieldIds(error, helperText, idProp);

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
    <FieldShell
      id={id}
      errorId={errorId}
      helpId={helpId}
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      hideLabel={hideLabel}
    >
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-mono pointer-events-none"
        >
          ₦
        </span>
        <input
          type="text"
          inputMode="numeric"
          readOnly={readOnly}
          required={required}
          value={display}
          onChange={readOnly ? undefined : handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={fieldControl(
            error,
            cn(
              'pl-9 font-mono tabular-nums',
              readOnly && 'bg-ink-50 text-ink-500 cursor-not-allowed',
              className
            )
          )}
          {...ariaProps}
        />
      </div>
    </FieldShell>
  );
};
