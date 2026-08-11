import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  /**
   * The old component was fixed at `p-12`, which is why a failed fetch inside
   * a dashboard stat tile blew the card's height apart. Match the scale to the
   * container: `inline` for tiles, `card` for panels, `page` for whole routes.
   */
  size?: 'inline' | 'card' | 'page';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  size = 'card',
  className,
}) => {
  if (size === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-danger-600', className)}>
        <AlertTriangle size={16} className="flex-shrink-0" />
        <span className="font-body text-body-sm">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="font-body text-body-sm font-semibold underline underline-offset-2 hover:text-danger-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const page = size === 'page';

  return (
    <div
      role="alert"
      className={cn(
        'border border-ink-200 rounded-card text-center bg-white',
        page ? 'p-12 sm:p-16' : 'p-8',
        className
      )}
    >
      <AlertTriangle
        className={cn('text-danger-600 mx-auto mb-4', page ? 'w-12 h-12' : 'w-8 h-8')}
        aria-hidden
      />
      <p className={cn('text-ink-700 font-body mb-6', page && 'text-body-lg')}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size={page ? 'md' : 'sm'} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
