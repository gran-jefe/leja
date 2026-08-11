'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { AdminGate } from '@/components/admin/AdminGate';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ADMIN_PAGE_SIZE, useAdminList } from '@/hooks/useAdminList';
import { formatDate } from '@/lib/utils';
import type { StatusTone } from '@/lib/status';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'LANDLORD' | 'TENANT' | 'PROVIDER';
  is_verified: boolean;
  created_at: string;
}

const roleTone: Record<AdminUser['role'], StatusTone> = {
  LANDLORD: 'info',
  TENANT: 'neutral',
  PROVIDER: 'brand',
};

const columns: Column<AdminUser>[] = [
  { header: 'Name', primary: true, cell: (u) => u.name },
  { header: 'Email', cell: (u) => <span className="font-mono text-body-sm">{u.email}</span> },
  { header: 'Phone', secondary: true, cell: (u) => u.phone || '—' },
  {
    header: 'Role',
    cell: (u) => (
      <span className="inline-flex gap-1.5">
        <Badge tone={roleTone[u.role]}>{u.role}</Badge>
        {u.is_verified && <Badge tone="success">Verified</Badge>}
      </span>
    ),
  },
  {
    header: 'Joined',
    align: 'right',
    cell: (u) => <span className="font-mono whitespace-nowrap">{formatDate(u.created_at)}</span>,
  },
];

function UsersContent() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { items, total, page, setPage, loading, error, refetch } = useAdminList<AdminUser>(
    '/admin/users',
    'users',
    { search: search || undefined }
  );

  return (
    <div className="max-w-wide mx-auto space-y-6">
      <PageHeader title="Users" subtitle={`${total} registered`} icon={Users} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
        className="flex gap-2 max-w-md"
      >
        <Input
          label="Search"
          hideLabel
          placeholder="Search by name or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {loading ? (
        <SkeletonList count={5} lines={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search." />
      ) : (
        <>
          <DataTable columns={columns} rows={items} rowKey={(u) => u.id} caption="Registered users" />
          <Pagination page={page} pageSize={ADMIN_PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGate>
      <UsersContent />
    </AdminGate>
  );
}
