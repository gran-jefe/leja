'use client';

import { useMemo, useState } from 'react';
import { FileText, History, Star } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { PayButton } from '@/components/shared/PayButton';
import { useAuth } from '@/hooks/useAuth';
import { useRentalHistory } from '@/hooks/useRentalHistory';
import api from '@/lib/api';
import { UserRole } from '@leja/shared';
import { formatDate, formatNaira, getErrorMessage } from '@/lib/utils';

const historyStatusVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'TERMINATED_EARLY':
      return 'danger' as const;
    default:
      return 'default' as const;
  }
};

export default function RentalHistoryPage() {
  const { user } = useAuth();
  const { history, loading, error, refetch } = useRentalHistory();
  const [exportError, setExportError] = useState('');
  const reference = useMemo(() => `LEJA_RHX_${Date.now()}`, []);

  const handleExportSuccess = async (response: any) => {
    setExportError('');
    try {
      const { data } = await api.post('/rental-history/export', {
        flutterwaveReference: response.tx_ref,
        transactionId: response.transaction_id,
      });

      const downloadUrl = data?.data?.downloadUrl;
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'rental-history.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setExportError(getErrorMessage(err, 'Payment succeeded but we could not generate your report. Please contact support.'));
    }
  };

  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Rental History"
              subtitle="Your verified tenancy record"
              icon={History}
              action={
                <PayButton
                  amount={5000}
                  email={user?.email || ''}
                  name={user?.name || ''}
                  reference={reference}
                  description="Rental History Export"
                  label={`Export Verified Report — ${formatNaira(5000)}`}
                  onSuccess={handleExportSuccess}
                  disabled={history.length === 0}
                />
              }
            />

            {exportError && (
              <Card className="bg-ember bg-opacity-10 border border-ember mb-6">
                <p className="font-body text-sm text-ember">{exportError}</p>
              </Card>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <Skeleton height="1.25rem" className="mb-2" width="50%" />
                    <Skeleton height="1rem" width="30%" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : history.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No rental history yet"
                description="Your verified rental record will appear here after your first tenancy."
              />
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <Card key={record.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-button bg-forest bg-opacity-10 flex items-center justify-center flex-shrink-0">
                          <FileText className="text-forest" size={18} />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold text-navy mb-1">
                            {record.property_address}
                          </h3>
                          <p className="font-body text-sm text-muted mb-2">
                            {formatDate(record.start_date)} —{' '}
                            {record.status === 'ACTIVE' ? 'Current' : formatDate(record.end_date)}
                          </p>
                          {record.landlord_rating ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i <= record.landlord_rating
                                      ? 'fill-ember text-ember'
                                      : 'text-border'
                                  }
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="font-body text-xs text-muted">Not yet rated</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={historyStatusVariant(record.status)}>{record.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
