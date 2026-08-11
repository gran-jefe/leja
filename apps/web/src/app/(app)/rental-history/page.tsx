'use client';

import { FileText, History, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconTile } from '@/components/ui/IconTile';
import { Alert } from '@/components/ui/Alert';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useRentalHistory } from '@/hooks/useRentalHistory';
import { Capability, BEYOND_PRICING } from '@beyond/shared';
import { cn, formatDate, formatNaira } from '@/lib/utils';
import { getStatus } from '@/lib/status';

function RentalHistoryContent() {
  const { history, loading, error, refetch } = useRentalHistory();

  // This export flow predates the eTranzact integration and was never fully
  // wired to a real payment call (the backend endpoint it hit only ever
  // returned a placeholder). Rather than pretend it works with the new rail,
  // it stays disabled pending a real implementation against /lib/payments —
  // same account-transfer pattern as the agreement and provider-subscription
  // payment flows.
  return (
    <div className="max-w-wide mx-auto">
      <PageHeader
        title="My rental history"
        subtitle="Your verified tenancy record, building automatically."
        icon={History}
        action={
          <Button variant="secondary" disabled title="Not available yet">
            Export report — {formatNaira(BEYOND_PRICING.RENTAL_HISTORY_EXPORT)}
          </Button>
        }
      />

      <Alert tone="info" className="mb-6">
        Building your record is free. A verified, exportable report costs{' '}
        {formatNaira(BEYOND_PRICING.RENTAL_HISTORY_EXPORT)} — coming shortly.
      </Alert>

      {loading ? (
        <SkeletonList count={3} lines={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : history.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No rental history yet"
          description="Your verified record will appear here after your first tenancy on BeyondAgency."
        />
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const status = getStatus('tenancy', record.status);
            return (
              <Card key={record.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <IconTile icon={FileText} tone="brass" size="sm" />
                    <div className="min-w-0">
                      <h3 className="font-display text-title font-semibold text-navy-900 mb-1">
                        {record.property_address}
                      </h3>
                      <p className="font-mono text-body-sm text-ink-500 mb-2.5">
                        {formatDate(record.start_date)} —{' '}
                        {record.status === 'ACTIVE' ? 'Current' : formatDate(record.end_date)}
                      </p>
                      {record.landlord_rating ? (
                        <div
                          className="flex items-center gap-0.5"
                          role="img"
                          aria-label={`Landlord rated ${record.landlord_rating} out of 5`}
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={15}
                              aria-hidden
                              className={cn(
                                i <= record.landlord_rating
                                  ? 'fill-brass-500 text-brass-500'
                                  : 'text-ink-200'
                              )}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="font-body text-body-sm text-ink-400">Not yet rated</p>
                      )}
                    </div>
                  </div>
                  <Badge tone={status.tone} dot className="flex-shrink-0">
                    {status.label}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RentalHistoryPage() {
  return (
    <ProtectedPageWrapper requiredCapability={Capability.TENANT}>
      <RentalHistoryContent />
    </ProtectedPageWrapper>
  );
}
