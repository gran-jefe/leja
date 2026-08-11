import React from 'react';
import { cn } from '@/lib/utils';
import { FieldShell, fieldControl, useFieldIds, type FieldOwnProps } from './FieldShell';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'required'>,
    FieldOwnProps {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, required, hideLabel, leadingIcon, trailingIcon, id: idProp, ...props },
    ref
  ) => {
    const { id, errorId, helpId, ariaProps } = useFieldIds(error, helperText, idProp);

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
          {leadingIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            required={required}
            className={fieldControl(
              error,
              cn(leadingIcon && 'pl-11', trailingIcon && 'pr-11', className)
            )}
            {...ariaProps}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {trailingIcon}
            </span>
          )}
        </div>
      </FieldShell>
    );
  }
);

Input.displayName = 'Input';
