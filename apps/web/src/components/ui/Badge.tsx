import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * `warning` and `danger` previously both rendered `bg-ember text-white`, so
 * "Awaiting Payment" and "Disputed" were indistinguishable. They are now
 * separate hues (ember 18° vs crimson 358°).
 *
 * `soft` is the default appearance: on a page that also carries a solid brass
 * CTA, solid badges compete with it for attention. Reserve `solid` for the one
 * status you actively want someone to look at.
 */
const badge = cva(
  'inline-flex items-center gap-1.5 font-body font-semibold rounded-full whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        brand: '',
      },
      appearance: { soft: 'border', solid: '', outline: 'border bg-transparent' },
      size: {
        sm: 'px-2 py-0.5 text-[0.6875rem]',
        md: 'px-3 py-1 text-xs',
      },
    },
    compoundVariants: [
      // soft
      { appearance: 'soft', tone: 'neutral', class: 'bg-ink-100 border-ink-200 text-ink-700' },
      { appearance: 'soft', tone: 'success', class: 'bg-success-50 border-success-100 text-success-700' },
      { appearance: 'soft', tone: 'warning', class: 'bg-warning-50 border-warning-100 text-warning-700' },
      { appearance: 'soft', tone: 'danger', class: 'bg-danger-50 border-danger-100 text-danger-700' },
      { appearance: 'soft', tone: 'info', class: 'bg-navy-900/5 border-navy-900/10 text-navy-700' },
      { appearance: 'soft', tone: 'brand', class: 'bg-brass-50 border-brass-100 text-brass-700' },
      // solid — brand takes dark text, same contrast rule as Button
      { appearance: 'solid', tone: 'neutral', class: 'bg-ink-500 text-white' },
      { appearance: 'solid', tone: 'success', class: 'bg-success-600 text-white' },
      { appearance: 'solid', tone: 'warning', class: 'bg-warning-600 text-white' },
      { appearance: 'solid', tone: 'danger', class: 'bg-danger-600 text-white' },
      { appearance: 'solid', tone: 'info', class: 'bg-navy-900 text-white' },
      { appearance: 'solid', tone: 'brand', class: 'bg-brass-500 text-ink-950' },
      // outline
      { appearance: 'outline', tone: 'neutral', class: 'border-ink-300 text-ink-600' },
      { appearance: 'outline', tone: 'success', class: 'border-success-500 text-success-700' },
      { appearance: 'outline', tone: 'warning', class: 'border-warning-500 text-warning-700' },
      { appearance: 'outline', tone: 'danger', class: 'border-danger-500 text-danger-700' },
      { appearance: 'outline', tone: 'info', class: 'border-navy-600 text-navy-700' },
      { appearance: 'outline', tone: 'brand', class: 'border-brass-500 text-brass-700' },
    ],
    defaultVariants: { tone: 'neutral', appearance: 'soft', size: 'md' },
  }
);

type BadgeTone = NonNullable<VariantProps<typeof badge>['tone']>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {
  /** Small leading dot. Gives status a non-colour cue for colour-blind users. */
  dot?: boolean;
  /**
   * @deprecated Use `tone`. Kept so existing call sites (and the status
   * helpers in lib/utils) keep compiling during the migration.
   */
  variant?: BadgeTone | 'default';
}

const dotTone: Record<string, string> = {
  neutral: 'bg-ink-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-navy-600',
  brand: 'bg-brass-500',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, variant, appearance, size, dot, children, ...props }, ref) => {
    const resolved: BadgeTone =
      tone ?? (variant === 'default' ? 'neutral' : (variant as BadgeTone)) ?? 'neutral';

    return (
      <span
        ref={ref}
        className={cn(badge({ tone: resolved, appearance, size }), className)}
        {...props}
      >
        {dot && (
          <span
            aria-hidden
            className={cn(
              'w-1.5 h-1.5 rounded-full flex-shrink-0',
              appearance === 'solid' ? 'bg-current opacity-80' : dotTone[resolved]
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
