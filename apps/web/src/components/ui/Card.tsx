import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const card = cva('rounded-card relative', {
  variants: {
    tone: {
      /** Default surface — white on the warm paper ground. */
      paper: 'bg-white border border-ink-200 shadow-sm text-ink-700',
      /** Inverted panel. Replaces the six ad-hoc `<Card className="bg-navy">`. */
      dark: 'bg-navy-900 border border-white/10 text-on-dark shadow-md',
      /** Brass-tinted, for the one thing on a screen that matters most. */
      accent: 'bg-brass-50 border border-brass-300/60 text-ink-800',
      /** Recessed, for nested groupings inside another card. */
      sunken: 'bg-ink-50 border border-ink-200 text-ink-700',
      /** Structure only — no fill, no border. */
      plain: 'bg-transparent',
    },
    padding: {
      none: 'p-0 overflow-hidden',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    interactive: {
      true: 'transition-all duration-base ease-standard hover:shadow-md hover:-translate-y-0.5 focus-within:shadow-md',
      false: '',
    },
  },
  defaultVariants: { tone: 'paper', padding: 'md', interactive: false },
});

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof card> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Edge-to-edge slot above the padded body (images, charts, maps). */
  media?: React.ReactNode;
  action?: React.ReactNode;
  as?: 'div' | 'article' | 'section' | 'li';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      tone,
      padding,
      interactive,
      title,
      subtitle,
      media,
      action,
      children,
      as = 'div',
      ...props
    },
    ref
  ) => {
    // Widened to ElementType: the prop bag is typed for a div, and TS will not
    // narrow it against every intrinsic element in the union.
    const Tag = as as React.ElementType;
    const dark = tone === 'dark';
    // With a media slot the outer element owns no padding; the body re-applies it.
    const hasMedia = Boolean(media);

    const body = (
      <>
        {(title || action) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h3
                  className={cn(
                    'font-display text-title font-semibold',
                    dark ? 'text-on-dark' : 'text-navy-900'
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    'font-body text-body-sm mt-1',
                    dark ? 'text-on-dark-muted' : 'text-ink-500'
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </>
    );

    return (
      <Tag
        ref={ref as never}
        className={cn(
          card({ tone, padding: hasMedia ? 'none' : padding, interactive }),
          className
        )}
        {...props}
      >
        {media}
        {hasMedia ? (
          <div className={cn(card({ padding, tone: 'plain' }))}>{body}</div>
        ) : (
          body
        )}
      </Tag>
    );
  }
);

Card.displayName = 'Card';
