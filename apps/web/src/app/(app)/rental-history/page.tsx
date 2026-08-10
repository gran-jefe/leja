'use client';

import { useState } from 'react';
import { FileText, History, Star } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useRentalHistory } from '@/hooks/useRentalHistory';
import { UserRole, BEYOND_PRICING } from '@beyond/shared';
import { formatDate, formatNaira } from '@/lib/utils';

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
  const { history, loading, error, refetch } = useRentalHistory();
  const [exportError, setExportError] = useState('');

  // This export flow predates the eTranzact integration and was never
  // fully wired to a real payment call (the backend endpoint it hit only
  // ever returned a placeholder). Rather than pretend it works with the new
  // rail, it's disabled here pending a real implementation against
  // /lib/payments — same account-transfer pattern as the agreement and
  // provider-subscription payment flows.

  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT}>
      <DashboardShell>
        <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Rental History"
              subtitle="Your verified tenancy record"
              icon={History}
              action={
                <Button variant="primary" disabled title="Coming soon">
                  {`Export Verified Report — ${formatNaira(BEYOND_PRICING.RENTAL_HISTORY_EXPORT)}`}
                </Button>
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
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
