import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Identical markup existed three times: admin/users, admin/agreements, admin/payments. */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}) => {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

  if (total === 0) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between gap-4 flex-wrap', className)}
    >
      <p className="font-body text-body-sm text-ink-500">
        Showing <span className="font-mono tabular-nums text-ink-700">{from}–{to}</span> of{' '}
        <span className="font-mono tabular-nums text-ink-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          leadingIcon={<ChevronLeft size={15} />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          trailingIcon={<ChevronRight size={15} />}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
