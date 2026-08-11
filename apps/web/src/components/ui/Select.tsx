import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldShell, fieldControl, useFieldIds, type FieldOwnProps } from './FieldShell';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'required'>,
    FieldOwnProps {
  options?: SelectOption[];
  placeholder?: string;
}

/**
 * Replaces six copies of a duplicated 96-character class string across
 * properties/new, properties/[id]/edit, properties/browse, provider/jobs and
 * admin/providers — none of which rendered validation errors, so zod enum
 * failures on `state` and `propertyType` were silently invisible.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, required, hideLabel, options, placeholder, children, id: idProp, ...props },
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
          <select
            ref={ref}
            required={required}
            className={fieldControl(error, cn('appearance-none pr-11 cursor-pointer', className))}
            {...ariaProps}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            size={18}
            aria-hidden
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
        </div>
      </FieldShell>
    );
  }
);

Select.displayName = 'Select';
