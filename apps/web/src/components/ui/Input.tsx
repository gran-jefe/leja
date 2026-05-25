import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
          {label}
        </label>
      )}
      <input
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

Input.displayName = 'Input';
