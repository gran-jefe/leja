import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, ...props }, ref) => {
    const baseStyles = 'font-body font-semibold rounded-button transition-colors';

    const variantStyles = {
      primary: 'bg-forest text-white hover:bg-opacity-90',
      secondary: 'border-2 border-navy text-navy hover:bg-cream',
      danger: 'bg-ember text-white hover:bg-opacity-90',
      ghost: 'bg-transparent text-current hover:bg-white hover:bg-opacity-10',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          loading && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading ? '...' : props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
