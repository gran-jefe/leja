import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { IconTile } from './IconTile';
import { Skeleton } from './Skeleton';
import { ErrorState } from './ErrorState';

/**
 * Canonical stat tile. Two different components previously shared this name —
 * one in dashboard/page.tsx, one in admin/page.tsx — with different layouts and
 * incompatible icon prop types (the admin one caused 8 type errors).
 *
 * `error`/`onRetry` are optional here; the dashboard version required them, so
 * call sites passed `error=""` and `onRetry={() => {}}` to satisfy it.
 */
export interface StatCardProps {
  label: string;
  value?: React.ReactNode;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  iconTone?: React.ComponentProps<typeof IconTile>['tone'];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  iconTone = 'brass',
  loading,
  error,
  onRetry,
  className,
}) => (
  <Card className={cn('flex flex-col', className)}>
    <div className="flex items-start gap-3 mb-4">
      {icon && <IconTile icon={icon} tone={iconTone} size="sm" />}
      <div className="min-w-0">
        <p className="font-body font-semibold text-ink-800 text-body-sm">{label}</p>
        {subtitle && <p className="font-body text-body-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>

    {loading ? (
      <Skeleton height="2.25rem" width="4.5rem" />
    ) : error ? (
      // `inline`, not the old fixed p-12 block that blew the tile's height apart.
      <ErrorState message={error} onRetry={onRetry} size="inline" />
    ) : (
      <p className="font-display text-display-sm sm:text-[2rem] leading-none font-semibold text-navy-900 tabular-nums">
        {value}
      </p>
    )}
  </Card>
);
