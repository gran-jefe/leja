'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { AdminGate } from '@/components/admin/AdminGate';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import api from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'LANDLORD' | 'TENANT' | 'PROVIDER';
  is_verified: boolean;
  created_at: string;
}

const roleVariant: Record<AdminUser['role'], 'default' | 'success' | 'info'> = {
  LANDLORD: 'info',
  TENANT: 'default',
  PROVIDER: 'success',
};

const PAGE_SIZE = 50;

function UsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async (searchValue: string, offsetValue: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users', {
        params: { search: searchValue || undefined, limit: PAGE_SIZE, offset: offsetValue },
      });
      setUsers(res.data.data.users || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search, offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchUsers(search, 0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchUsers(search, offset)} />
      ) : users.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-muted text-center py-6">No users found.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u.id}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-body font-semibold text-charcoal">{u.name}</p>
                    <p className="text-xs text-muted font-body">
                      {u.email} {u.phone ? `· ${u.phone}` : ''} · Joined {formatDate(u.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.is_verified && <Badge variant="success">Verified</Badge>}
                    <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between font-body text-sm text-muted">
            <span>
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <AdminGate>
          <UsersContent />
        </AdminGate>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
