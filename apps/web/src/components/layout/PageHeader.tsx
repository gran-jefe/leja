import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconTile } from '@/components/ui/IconTile';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

/**
 * The single page header. Previously used on 5 of ~25 screens, with two other
 * spellings hand-rolled elsewhere: a copy of this markup in agreement/new,
 * agreement/[id], properties/new, properties/[id], properties/[id]/edit and
 * profile, and a naked `<h1 className="font-display text-2xl">` on all five
 * admin pages plus both provider pages.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8',
      className
    )}
  >
    <div className="flex items-start gap-4 min-w-0">
      {Icon && <IconTile icon={Icon} tone="navy" size="md" />}
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-mono text-label uppercase text-brass-700 mb-1.5">{eyebrow}</p>
        )}
        <h1 className="font-display text-display-sm sm:text-display-md font-semibold text-navy-900 break-words">
          {title}
        </h1>
        {subtitle && <p className="font-body text-ink-500 mt-2">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
