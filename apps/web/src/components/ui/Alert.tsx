import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Consolidates 15+ inline feedback blocks that existed in three different
 * shapes: a `p-3 bg-ember bg-opacity-10` banner, a `<Card className="bg-ember
 * bg-opacity-10">`, and a bare `<p className="text-sm text-ember">`.
 */
const alert = cva('flex items-start gap-3 rounded-button border font-body', {
  variants: {
    tone: {
      info: 'bg-navy-900/[0.04] border-navy-900/10 text-navy-800',
      success: 'bg-success-50 border-success-100 text-success-700',
      warning: 'bg-warning-50 border-warning-100 text-warning-700',
      error: 'bg-danger-50 border-danger-100 text-danger-700',
      brand: 'bg-brass-50 border-brass-300/50 text-brass-700',
    },
    size: {
      sm: 'p-3 text-body-sm',
      md: 'p-4 text-body-sm',
    },
  },
  defaultVariants: { tone: 'info', size: 'md' },
});

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  brand: Info,
} as const;

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alert> {
  title?: React.ReactNode;
  onDismiss?: () => void;
  icon?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  tone = 'info',
  size,
  title,
  children,
  onDismiss,
  icon = true,
  className,
  ...props
}) => {
  const Icon = icons[tone ?? 'info'];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(alert({ tone, size }), className)}
      {...props}
    >
      {icon && <Icon size={18} className="flex-shrink-0 mt-0.5" aria-hidden />}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className={cn(title && 'opacity-90')}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
