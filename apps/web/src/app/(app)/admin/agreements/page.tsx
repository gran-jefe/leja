'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollText } from 'lucide-react';
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

interface AdminAgreement {
  id: string;
  status: string;
  monthly_rent: number;
  annual_rent: number;
  created_at: string;
  landlord: { name: string; email: string } | null;
  tenant: { name: string; email: string } | null;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_PAYMENT', label: 'Awaiting payment' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'DISPUTED', label: 'Disputed' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const columns: Column<AdminAgreement>[] = [
  {
    header: 'Landlord',
    primary: true,
    cell: (a) => (
      <span className="min-w-0 block">
        <span className="block truncate">{a.landlord?.name || 'Unknown'}</span>
        <span className="block font-mono text-body-sm text-ink-400 truncate">
          {a.landlord?.email}
        </span>
      </span>
    ),
  },
  {
    header: 'Tenant',
    cell: (a) => (
      <span className="min-w-0 block">
        <span className="block truncate">{a.tenant?.name || 'Unknown'}</span>
        <span className="block font-mono text-body-sm text-ink-400 truncate">
          {a.tenant?.email}
        </span>
      </span>
    ),
  },
  {
    header: 'Annual rent',
    align: 'right',
    cell: (a) => <span className="font-mono tabular-nums">{formatNaira(a.annual_rent)}</span>,
  },
  {
    header: 'Monthly',
    align: 'right',
    secondary: true,
    cell: (a) => <span className="font-mono tabular-nums">{formatNaira(a.monthly_rent)}</span>,
  },
  {
    header: 'Status',
    cell: (a) => {
      const s = getStatus('agreement', a.status);
      return (
        <Badge tone={s.tone} dot>
          {s.label}
        </Badge>
      );
    },
  },
  {
    header: 'Created',
    align: 'right',
    cell: (a) => <span className="font-mono whitespace-nowrap">{formatDate(a.created_at)}</span>,
  },
];

function AgreementsContent() {
  const router = useRouter();
  const [status, setStatus] = useState('');

  const { items, total, page, setPage, loading, error, refetch } = useAdminList<AdminAgreement>(
    '/admin/agreements',
    'agreements',
    { status: status || undefined }
  );

  return (
    <div className="max-w-wide mx-auto space-y-6">
      <PageHeader title="Agreements" subtitle={`${total} on record`} icon={ScrollText} />

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {loading ? (
        <SkeletonList count={5} lines={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No agreements found"
          description={status ? 'Try a different status filter.' : 'Agreements will appear here.'}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(a) => a.id}
            caption="Agreements"
            onRowClick={(a) => router.push(`/agreement/${a.id}`)}
          />
          <Pagination page={page} pageSize={ADMIN_PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminAgreementsPage() {
  return (
    <AdminGate>
      <AgreementsContent />
    </AdminGate>
  );
}
