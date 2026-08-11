import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconTile } from './IconTile';

/**
 * The icon-tile + title + meta + trailing-badge row, hand-rolled in seven
 * places: dashboard, agreements, rental-history, admin/{users,agreements,
 * payments} and provider/dashboard.
 */
export interface ListRowProps {
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  iconTone?: React.ComponentProps<typeof IconTile>['tone'];
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  icon,
  iconTone = 'navy',
  title,
  meta,
  trailing,
  href,
  onClick,
  className,
}) => {
  const interactive = Boolean(href || onClick);

  const content = (
    <>
      {icon && <IconTile icon={icon} tone={iconTone} size="sm" />}
      <span className="flex-1 min-w-0">
        <span className="block font-body font-semibold text-ink-800 truncate">{title}</span>
        {meta && (
          <span className="block font-body text-body-sm text-ink-500 truncate mt-0.5">{meta}</span>
        )}
      </span>
      {trailing && <span className="flex-shrink-0">{trailing}</span>}
      {interactive && (
        <ChevronRight size={16} className="flex-shrink-0 text-ink-400" aria-hidden />
      )}
    </>
  );

  const classes = cn(
    'flex items-center gap-3 p-3 rounded-button border border-ink-200 bg-white',
    interactive &&
      'transition-colors duration-fast hover:bg-ink-50 hover:border-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, 'w-full text-left')}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
};
