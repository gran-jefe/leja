import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Brand mark — a verification seal enclosing an open doorway. The seal motif
 * recurs throughout the system (pricing ribbon, trust section, agreement
 * card), because a stamp is the closest visual shorthand for what the product
 * actually sells.
 *
 * Inline rather than an <img> so it inherits currentColor and never flashes.
 */
export const LogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className,
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    className={cn('flex-shrink-0', className)}
    aria-hidden
    focusable="false"
  >
    <circle cx="32" cy="32" r="29" className="fill-navy-900" />
    <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.55" />
    <circle cx="32" cy="32" r="18.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
    <path
      d="M20 33.5 L32 22.5 L44 33.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.5 33.5 V43 H39.5 V33.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.85"
    />
    <path d="M32 43 V36.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

interface LogoProps {
  onDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  markOnly?: boolean;
  className?: string;
}

const wordSize = {
  sm: 'text-body',
  md: 'text-title',
  lg: 'text-display-sm',
} as const;

const markSize = { sm: 26, md: 32, lg: 40 } as const;

export const Logo: React.FC<LogoProps> = ({ onDark, size = 'md', markOnly, className }) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <LogoMark size={markSize[size]} className="text-brass-500" />
    {!markOnly && (
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          wordSize[size],
          onDark ? 'text-on-dark' : 'text-navy-900'
        )}
      >
        Beyond<span className="text-brass-500">Agency</span>
      </span>
    )}
  </span>
);
