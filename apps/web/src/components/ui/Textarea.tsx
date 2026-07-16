import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-2 font-body border border-border rounded-button',
          'focus:outline-none focus:ring-2 focus:ring-forest',
          error && 'border-ember focus:ring-ember',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-ember mt-1 font-body">{error}</p>}
    </div>
  )
);

Textarea.displayName = 'Textarea';
