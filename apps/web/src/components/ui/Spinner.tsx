import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', label = 'Loading', ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-2',
      lg: 'w-12 h-12 border-[3px]',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(
          'animate-spin rounded-full border-ink-200 border-t-brass-500',
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
