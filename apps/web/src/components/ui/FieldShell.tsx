import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface FieldOwnProps {
  label?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
}

/**
 * Generates the id wiring that every field needs. The previous Input rendered
 * a bare <label> with no htmlFor, so clicking a label focused nothing and
 * screen readers announced the input unlabelled.
 */
export function useFieldIds(error?: string, helperText?: React.ReactNode, idProp?: string) {
  const generated = useId();
  const id = idProp ?? `field-${generated}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const describedBy =
    [error ? errorId : null, helperText ? helpId : null].filter(Boolean).join(' ') || undefined;

  return {
    id,
    errorId,
    helpId,
    ariaProps: {
      id,
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': describedBy,
      'aria-errormessage': error ? errorId : undefined,
    },
  };
}

/** Shared input chrome. Keep every control's border/focus story in one place. */
export const fieldControl = (error?: string, className?: string) =>
  cn(
    'w-full px-4 min-h-[44px] py-2.5 font-body text-body bg-white',
    'border rounded-button text-ink-800 placeholder:text-ink-400',
    'transition-colors duration-fast ease-standard',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-500/30'
      : 'border-ink-200 hover:border-ink-300 focus:border-brass-500 focus:ring-brass-500/30',
    'disabled:bg-ink-50 disabled:text-ink-400 disabled:cursor-not-allowed disabled:border-ink-200',
    className
  );

interface FieldShellProps extends FieldOwnProps {
  id: string;
  errorId: string;
  helpId: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldShell({
  id,
  errorId,
  helpId,
  label,
  error,
  helperText,
  required,
  hideLabel,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block font-body text-body-sm font-semibold text-ink-800 mb-2',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {required && (
            <span className="text-danger-600 ml-0.5" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p id={helpId} className="mt-1.5 font-body text-body-sm text-ink-500">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 font-body text-body-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
