import React from 'react';
import { cn } from '@/lib/utils';
import { FieldShell, fieldControl, useFieldIds, type FieldOwnProps } from './FieldShell';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'>,
    FieldOwnProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, required, hideLabel, id: idProp, rows = 4, ...props }, ref) => {
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
        <textarea
          ref={ref}
          rows={rows}
          required={required}
          className={fieldControl(error, cn('resize-y leading-relaxed', className))}
          {...ariaProps}
          {...props}
        />
      </FieldShell>
    );
  }
);

Textarea.displayName = 'Textarea';
