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
import {
  formatDate,
  formatNaira,
  getAgreementStatusLabel,
  getAgreementStatusVariant,
  getErrorMessage,
} from '@/lib/utils';

interface AdminAgreement {
  id: string;
  status: string;
  monthly_rent: number;
  annual_rent: number;
  created_at: string;
  landlord: { name: string; email: string } | null;
  tenant: { name: string; email: string } | null;
}

const STATUSES = ['', 'DRAFT', 'ACTIVE', 'PENDING_PAYMENT', 'EXPIRED', 'DISPUTED', 'TERMINATED'];
const PAGE_SIZE = 50;

function AgreementsContent() {
  const [agreements, setAgreements] = useState<AdminAgreement[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAgreements = async (statusValue: string, offsetValue: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/agreements', {
        params: { status: statusValue || undefined, limit: PAGE_SIZE, offset: offsetValue },
      });
      setAgreements(res.data.data.agreements || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load agreements'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements(status, offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, offset]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">Agreements</h1>

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
            {s ? getAgreementStatusLabel(s) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAgreements(status, offset)} />
      ) : agreements.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-muted text-center py-6">No agreements found.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {agreements.map((a) => (
              <Card key={a.id}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-body font-semibold text-charcoal">
                      {a.landlord?.name || 'Unknown landlord'} → {a.tenant?.name || 'Unknown tenant'}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {formatNaira(a.monthly_rent)}/mo · Created {formatDate(a.created_at)}
                    </p>
                  </div>
                  <Badge variant={getAgreementStatusVariant(a.status)}>
                    {getAgreementStatusLabel(a.status)}
                  </Badge>
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

export default function AdminAgreementsPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <AdminGate>
          <AgreementsContent />
        </AdminGate>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
