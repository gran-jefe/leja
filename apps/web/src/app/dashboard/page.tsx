'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAgreements } from '@/hooks/useAgreements';
import { useProperties } from '@/hooks/useProperties';
import { useRentalHistory } from '@/hooks/useRentalHistory';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { formatDate, getAgreementStatusVariant } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isLandlord, isTenant } = useAuth();
  const { agreements, loading: agreementsLoading, error: agreementsError, refetch: refetchAgreements } = useAgreements();
  const { properties, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useProperties();
  const { history, loading: historyLoading } = useRentalHistory();

  const activeAgreements = agreements.filter((a) => a.status === 'ACTIVE');
  const recentAgreements = agreements.slice(0, 3);

  return (
    <ProtectedPageWrapper>
      <div>
        <h1 className="font-display text-3xl font-bold text-navy mb-8">
          Welcome back, {user?.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {isLandlord && (
            <>
              <Card title="Properties" subtitle="Manage your listings">
                {propertiesLoading ? (
                  <Skeleton height="4rem" />
                ) : propertiesError ? (
                  <ErrorState message={propertiesError} onRetry={refetchProperties} />
                ) : (
                  <div className="h-24 bg-cream rounded-button flex items-center justify-center text-2xl font-display font-bold text-navy">
                    {properties.length}
                  </div>
                )}
              </Card>
              <Card title="Active Agreements" subtitle="Tenancy agreements">
                {agreementsLoading ? (
                  <Skeleton height="4rem" />
                ) : agreementsError ? (
                  <ErrorState message={agreementsError} onRetry={refetchAgreements} />
                ) : (
                  <div className="h-24 bg-cream rounded-button flex items-center justify-center text-2xl font-display font-bold text-navy">
                    {activeAgreements.length}
                  </div>
                )}
              </Card>
            </>
          )}

          {isTenant && (
            <>
              <Card title="My Agreements" subtitle="Your tenancy agreements">
                {agreementsLoading ? (
                  <Skeleton height="4rem" />
                ) : agreementsError ? (
                  <ErrorState message={agreementsError} onRetry={refetchAgreements} />
                ) : (
                  <div className="h-24 bg-cream rounded-button flex items-center justify-center text-2xl font-display font-bold text-navy">
                    {activeAgreements.length}
                  </div>
                )}
              </Card>
              <Card title="Rental History" subtitle="Your rental record">
                {historyLoading ? (
                  <Skeleton height="4rem" />
                ) : (
                  <div className="h-24 bg-cream rounded-button flex items-center justify-center text-2xl font-display font-bold text-navy">
                    {history.length}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        <div className="mb-6 flex gap-4">
          {isLandlord && (
            <>
              <Link href="/agreement/new">
                <Button variant="primary">New Agreement</Button>
              </Link>
              <Link href="/properties/new">
                <Button variant="secondary">Add Property</Button>
              </Link>
            </>
          )}

          {isTenant && (
            <Link href="/rental-history">
              <Button variant="primary">View Rental History</Button>
            </Link>
          )}
        </div>

        <Card title="Recent Activity">
          {agreementsLoading ? (
            <div className="space-y-3">
              <Skeleton height="3rem" />
              <Skeleton height="3rem" />
              <Skeleton height="3rem" />
            </div>
          ) : agreementsError ? (
            <ErrorState message={agreementsError} onRetry={refetchAgreements} />
          ) : recentAgreements.length === 0 ? (
            <p className="text-muted font-body text-sm">No agreements yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAgreements.map((agreement) => (
                <Link
                  key={agreement.id}
                  href={`/agreement/${agreement.id}`}
                  className="flex items-center justify-between p-3 rounded-button border border-border hover:bg-cream transition-colors"
                >
                  <div>
                    <p className="font-body font-semibold text-charcoal text-sm">
                      {agreement.property?.address || 'Unknown property'}
                    </p>
                    <p className="font-body text-muted text-xs">
                      {isLandlord
                        ? agreement.tenant?.name || 'Unknown tenant'
                        : agreement.landlord?.name || 'Unknown landlord'}
                      {' · '}
                      {formatDate(agreement.created_at)}
                    </p>
                  </div>
                  <Badge variant={getAgreementStatusVariant(agreement.status)}>
                    {agreement.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedPageWrapper>
  );
}
