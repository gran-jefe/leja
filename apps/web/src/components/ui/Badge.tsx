import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-muted text-white',
      success: 'bg-forest text-white',
      warning: 'bg-ember text-white',
      danger: 'bg-ember text-white',
      info: 'bg-navy text-white',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-block px-3 py-1 text-xs font-semibold rounded-full',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
