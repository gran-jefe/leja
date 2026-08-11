import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

/**
 * NOTE ON CONTRAST — do not "fix" primary to white text.
 * White on brass-500 is 3.24:1 and fails WCAG AA. ink-950 on brass-500 is
 * 5.67:1 and passes. The dark label is deliberate, not an oversight.
 */
const button = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-body font-semibold rounded-button',
    'transition-all duration-fast ease-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
    'active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-brass-500 text-ink-950 shadow-xs hover:bg-brass-600 hover:shadow-brass',
        secondary: 'border border-ink-300 text-ink-800 bg-transparent hover:bg-ink-100 hover:border-ink-400',
        tertiary: 'bg-navy-900 !text-white hover:bg-navy-800 shadow-xs hover:shadow-navy-900',
        danger: 'bg-danger-600 text-white shadow-xs hover:bg-danger-700',
        ghost: 'bg-transparent text-current hover:bg-ink-900/5',
        link: 'bg-transparent text-brass-700 underline underline-offset-4 hover:text-brass-600 px-0 py-0 h-auto',
      },
      /** Use on navy/dark surfaces, where the light-mode borders disappear. */
      onDark: { true: '', false: '' },
      size: {
        sm: 'text-body-sm px-3.5 min-h-[40px]',
        md: 'text-body px-5 min-h-[44px]',
        lg: 'text-body-lg px-7 min-h-[52px]',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      {
        onDark: true,
        variant: 'secondary',
        class: 'border-white/25 text-on-dark hover:bg-white/10 hover:border-white/40',
      },
      { onDark: true, variant: 'ghost', class: 'text-on-dark hover:bg-white/10' },
      { onDark: true, variant: 'link', class: 'text-brass-300 hover:text-brass-100' },
      { onDark: true, class: 'focus-visible:ring-offset-navy-900' },
      { variant: 'link', size: 'sm', class: 'min-h-0 px-0' },
      { variant: 'link', size: 'md', class: 'min-h-0 px-0' },
      { variant: 'link', size: 'lg', class: 'min-h-0 px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      onDark: false,
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof button> {
  loading?: boolean;
  /** Rendered before the label. Hidden while loading so width stays stable. */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      onDark,
      loading = false,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(button({ variant, size, fullWidth, onDark }), className)}
      {...props}
    >
      {/* The label stays mounted while loading so the button keeps its width —
          the old implementation swapped children for the string '...'. */}
      {loading ? (
        <Spinner size="sm" className="border-current border-t-transparent" />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  )
);

Button.displayName = 'Button';
