import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Replaces ~14 hand-rolled `w-12 h-12 rounded-button bg-navy bg-opacity-5 …` blocks. */
const iconTile = cva(
  'inline-flex items-center justify-center flex-shrink-0 rounded-button',
  {
    variants: {
      tone: {
        navy: 'bg-navy-900/5 text-navy-900',
        brass: 'bg-brass-50 text-brass-700 ring-1 ring-brass-300/50',
        success: 'bg-success-50 text-success-700',
        warning: 'bg-warning-50 text-warning-700',
        danger: 'bg-danger-50 text-danger-700',
        neutral: 'bg-ink-100 text-ink-600',
        onDark: 'bg-white/10 text-on-dark',
      },
      size: {
        sm: 'w-9 h-9',
        md: 'w-12 h-12',
        lg: 'w-14 h-14',
      },
    },
    defaultVariants: { tone: 'navy', size: 'md' },
  }
);

const iconSize = { sm: 16, md: 22, lg: 26 } as const;

export interface IconTileProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof iconTile> {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

export const IconTile: React.FC<IconTileProps> = ({
  icon: Icon,
  tone,
  size = 'md',
  className,
  ...props
}) => (
  <span aria-hidden className={cn(iconTile({ tone, size }), className)} {...props}>
    <Icon size={iconSize[size ?? 'md']} />
  </span>
);
