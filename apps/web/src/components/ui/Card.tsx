import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white border border-border rounded-card shadow-sm p-6',
        className
      )}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="font-display text-xl font-semibold text-navy">{title}</h3>
          {subtitle && <p className="text-muted font-body text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
);

Card.displayName = 'Card';
