import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** `sm` for inside a card or panel; `md` for a whole-page empty result. */
  size?: 'sm' | 'md';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className,
}) => (
  <div
    className={cn(
      'border border-dashed border-ink-200 rounded-card text-center bg-ink-50/60',
      size === 'md' ? 'p-12' : 'p-8',
      className
    )}
  >
    <Icon
      className={cn('text-ink-300 mx-auto mb-4', size === 'md' ? 'w-12 h-12' : 'w-9 h-9')}
      aria-hidden
    />
    <h3
      className={cn(
        'font-display font-semibold text-navy-900 mb-1.5',
        size === 'md' ? 'text-title' : 'text-body-lg'
      )}
    >
      {title}
    </h3>
    {description && (
      <p className="font-body text-body-sm text-ink-500 max-w-sm mx-auto">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
