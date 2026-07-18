import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon: Icon, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div className="flex items-start gap-4 min-w-0">
        {Icon && (
          <div className="w-12 h-12 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
            <Icon className="text-navy" size={24} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-2">{title}</h1>
          {subtitle && <p className="text-muted font-body">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
