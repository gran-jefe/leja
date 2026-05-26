import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy mb-2">{title}</h1>
        {subtitle && <p className="text-muted font-body">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
