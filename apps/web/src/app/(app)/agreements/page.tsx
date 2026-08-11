'use client';

import Link from 'next/link';
import { FileText, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ListRow } from '@/components/ui/ListRow';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { useAgreements } from '@/hooks/useAgreements';
import { formatDate } from '@/lib/utils';
import { getStatus } from '@/lib/status';

export default function AgreementsPage() {
  const { user, isLandlord } = useAuth();
  const { agreements, loading, error, refetch } = useAgreements();

  const newAgreementButton = isLandlord ? (
    <Link href="/agreement/new">
      <Button leadingIcon={<PlusCircle size={17} />}>New agreement</Button>
    </Link>
  ) : undefined;

  return (
    <div className="max-w-wide mx-auto">
      <PageHeader
        title={isLandlord ? 'Agreements' : 'My agreements'}
        subtitle="Every tenancy agreement in one place."
        icon={FileText}
        action={newAgreementButton}
      />

      {loading ? (
        <SkeletonList count={4} lines={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : agreements.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No agreements yet"
          description={
            isLandlord
              ? 'Create your first tenancy agreement to get started.'
              : 'Agreements your landlord sends will appear here.'
          }
          action={newAgreementButton}
        />
      ) : (
        <div className="space-y-3">
          {agreements.map((agreement) => {
            const status = getStatus('agreement', agreement.status);
            return (
              <ListRow
                key={agreement.id}
                href={`/agreement/${agreement.id}`}
                icon={FileText}
                title={agreement.property?.address || 'Unknown property'}
                meta={`${
                  // Which side you're on is a fact about this agreement, not
                  // about your account — you may be landlord on one row and
                  // tenant on the next.
                  agreement.landlord_id === user?.id
                    ? agreement.tenant?.name || 'Unknown tenant'
                    : agreement.landlord?.name || 'Unknown landlord'
                } · ${formatDate(agreement.start_date)} – ${formatDate(agreement.end_date)}`}
                trailing={
                  <Badge tone={status.tone} dot>
                    {status.label}
                  </Badge>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
