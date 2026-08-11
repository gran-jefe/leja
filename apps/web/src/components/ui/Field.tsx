import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Read-only label/value pair for detail screens.
 *
 * Replaces ~30 sites across agreement/[id], properties/[id] and
 * properties/browse/[id] that used `<label>` as a display element for
 * non-inputs — semantically wrong, and it made every value sound like a form
 * control to a screen reader. This renders a proper <dl>.
 */
export interface FieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  /** Render the value in DM Mono — for amounts, references, dates, IDs. */
  mono?: boolean;
  className?: string;
  onDark?: boolean;
}

export const Field: React.FC<FieldProps> = ({ label, children, mono, className, onDark }) => (
  <div className={cn('min-w-0', className)}>
    <dt
      className={cn(
        'font-body text-body-sm mb-1',
        onDark ? 'text-on-dark-muted' : 'text-ink-500'
      )}
    >
      {label}
    </dt>
    <dd
      className={cn(
        'font-body break-words',
        mono && 'font-mono tabular-nums',
        onDark ? 'text-on-dark' : 'text-ink-800'
      )}
    >
      {children}
    </dd>
  </div>
);

/** Grid wrapper. Always breakpointed — the old detail grids were bare
 *  `grid-cols-2`, which squeezed labelled values to ~140px at 375px. */
export const FieldGroup: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}> = ({ children, columns = 2, className }) => (
  <dl
    className={cn(
      'grid gap-x-6 gap-y-5',
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-1 sm:grid-cols-2',
      columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      className
    )}
  >
    {children}
  </dl>
);
