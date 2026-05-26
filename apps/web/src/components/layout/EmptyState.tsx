import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="border-2 border-dashed border-border rounded-card p-12 text-center">
      <Icon className="w-16 h-16 text-muted mx-auto mb-4" />
      <h3 className="font-display text-xl font-semibold text-navy mb-2">{title}</h3>
      <p className="text-muted font-body mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
