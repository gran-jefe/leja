import React from 'react';
import { cn } from '@/lib/utils';

/**
 * There is not a single <table> anywhere in the app — every admin list is a
 * vertical stack of Cards, which is why they can't be scanned or compared.
 * This renders a real table on desktop and falls back to stacked rows on
 * mobile, where a table would force horizontal scrolling.
 */
export interface Column<T> {
  /** Header label. */
  header: string;
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode;
  /** Right-align — use for amounts and dates. */
  align?: 'left' | 'right';
  /** Hide below `lg`, for secondary columns. */
  secondary?: boolean;
  /** Rendered as the row title in the mobile stacked view. */
  primary?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  caption?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  caption,
  className,
}: DataTableProps<T>) {
  return (
    <>
      {/* Desktop */}
      <div
        className={cn(
          'hidden md:block bg-white border border-ink-200 rounded-card overflow-hidden',
          className
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50">
                {columns.map((col) => (
                  <th
                    key={col.header}
                    scope="col"
                    className={cn(
                      'px-4 py-3 font-mono text-label uppercase text-ink-500 whitespace-nowrap',
                      col.align === 'right' && 'text-right',
                      col.secondary && 'hidden lg:table-cell'
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-ink-100 last:border-0 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-ink-50'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={cn(
                        'px-4 py-3.5 font-body text-body-sm text-ink-700 align-middle',
                        col.align === 'right' && 'text-right',
                        col.secondary && 'hidden lg:table-cell',
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile — a table here would force horizontal scrolling. */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => {
          const primary = columns.find((c) => c.primary) ?? columns[0];
          const rest = columns.filter((c) => c !== primary && !c.secondary);
          return (
            <div
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'bg-white border border-ink-200 rounded-card p-4',
                onRowClick && 'cursor-pointer active:bg-ink-50'
              )}
            >
              <div className="font-body font-semibold text-ink-800 mb-2">{primary.cell(row)}</div>
              <dl className="space-y-1.5">
                {rest.map((col) => (
                  <div key={col.header} className="flex justify-between gap-3">
                    <dt className="font-mono text-label uppercase text-ink-400">{col.header}</dt>
                    <dd className="font-body text-body-sm text-ink-700 text-right">
                      {col.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Filter chip row — duplicated verbatim in admin/agreements and admin/payments. */
export function FilterChips({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label="Filter">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'px-3.5 min-h-[36px] rounded-button border font-body text-body-sm transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
            value === opt.value
              ? 'bg-navy-900 text-on-dark border-navy-900'
              : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
