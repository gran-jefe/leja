'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { AdminGate } from '@/components/admin/AdminGate';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import api from '@/lib/api';
import { formatDate, formatNaira, getErrorMessage } from '@/lib/utils';

interface AdminPayment {
  id: string;
  type: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  payment_reference: string;
  created_at: string;
  user: { name: string; email: string } | null;
}

const statusVariant: Record<AdminPayment['status'], 'default' | 'success' | 'danger'> = {
  PENDING: 'default',
  SUCCESS: 'success',
  FAILED: 'danger',
};

const typeLabel = (type: string) =>
  type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

const STATUSES = ['', 'PENDING', 'SUCCESS', 'FAILED'];
const PAGE_SIZE = 50;

function PaymentsContent() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async (statusValue: string, offsetValue: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/payments', {
        params: { status: statusValue || undefined, limit: PAGE_SIZE, offset: offsetValue },
      });
      setPayments(res.data.data.payments || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(status, offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, offset]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Payments</h1>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'ALL'}
            onClick={() => {
              setStatus(s);
              setOffset(0);
            }}
            className={`px-3 py-1.5 rounded-button text-sm font-body border ${
              status === s
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-charcoal border-border hover:bg-cream'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchPayments(status, offset)} />
      ) : payments.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-muted text-center py-6">No payments found.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {payments.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-body font-semibold text-charcoal">
                      {formatNaira(p.amount)} · {typeLabel(p.type)}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {p.user?.name || 'Unknown'} ({p.user?.email}) · {formatDate(p.created_at)}
                    </p>
                    <p className="text-xs text-muted font-body">Ref: {p.payment_reference}</p>
                  </div>
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
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

export default function AdminPaymentsPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <AdminGate>
          <PaymentsContent />
        </AdminGate>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
