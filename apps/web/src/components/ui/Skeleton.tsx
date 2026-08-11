import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, circle, style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'skeleton-shimmer',
        circle ? 'rounded-full' : 'rounded-sm',
        !width && 'w-full',
        className
      )}
      style={{ width, height: height ?? '1rem', ...style }}
      {...props}
    />
  )
);

Skeleton.displayName = 'Skeleton';

/** Card-shaped placeholder. Every list screen was hand-composing its own. */
export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('bg-white border border-ink-200 rounded-card p-6 space-y-3', className)}>
      <Skeleton height="1.25rem" width="45%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="0.875rem" width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonList({
  count = 3,
  lines = 2,
  className,
}: {
  count?: number;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}
