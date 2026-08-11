'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { AdminGate } from '@/components/admin/AdminGate';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { DataTable, FilterChips, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ADMIN_PAGE_SIZE, useAdminList } from '@/hooks/useAdminList';
import { formatDate, formatNaira } from '@/lib/utils';
import { getStatus } from '@/lib/status';

interface AdminPayment {
  id: string;
  type: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  payment_reference: string;
  created_at: string;
  user: { name: string; email: string } | null;
}

const typeLabel = (type: string) =>
  type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUCCESS', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
];

const columns: Column<AdminPayment>[] = [
  {
    header: 'Amount',
    primary: true,
    cell: (p) => <span className="font-mono tabular-nums">{formatNaira(p.amount)}</span>,
  },
  { header: 'Type', cell: (p) => typeLabel(p.type) },
  {
    header: 'User',
    cell: (p) => (
      <span className="min-w-0 block">
        <span className="block truncate">{p.user?.name || 'Unknown'}</span>
        <span className="block font-mono text-body-sm text-ink-400 truncate">
          {p.user?.email}
        </span>
      </span>
    ),
  },
  {
    header: 'Reference',
    secondary: true,
    cell: (p) => <span className="font-mono text-body-sm">{p.payment_reference}</span>,
  },
  {
    header: 'Status',
    cell: (p) => {
      const s = getStatus('payment', p.status);
      return (
        <Badge tone={s.tone} dot>
          {s.label}
        </Badge>
      );
    },
  },
  {
    header: 'Date',
    align: 'right',
    cell: (p) => <span className="font-mono whitespace-nowrap">{formatDate(p.created_at)}</span>,
  },
];

function PaymentsContent() {
  const [status, setStatus] = useState('');

  const { items, total, page, setPage, loading, error, refetch } = useAdminList<AdminPayment>(
    '/admin/payments',
    'payments',
    { status: status || undefined }
  );

  return (
    <div className="max-w-wide mx-auto space-y-6">
      <PageHeader title="Payments" subtitle={`${total} recorded`} icon={Wallet} />

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {loading ? (
        <SkeletonList count={5} lines={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments found"
          description={status ? 'Try a different status filter.' : 'Payments will appear here.'}
        />
      ) : (
        <>
          <DataTable columns={columns} rows={items} rowKey={(p) => p.id} caption="Payments" />
          <Pagination page={page} pageSize={ADMIN_PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <AdminGate>
      <PaymentsContent />
    </AdminGate>
  );
}
