'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Copy, Check, FileText, History, Home, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAgreements, usePendingAgreements } from '@/hooks/useAgreements';
import { useProperties } from '@/hooks/useProperties';
import { useRentalHistory } from '@/hooks/useRentalHistory';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { formatDate, getAgreementStatusVariant } from '@/lib/utils';

function CopyInviteLinkButton({ agreementId }: { agreementId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/agreement/${agreementId}/review`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={handleCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy invite link'}
    </Button>
  );
}

function StatCard({
  icon: Icon,
  label,
  subtitle,
  value,
  loading,
  error,
  onRetry,
}: {
  icon: React.ElementType;
  label: string;
  subtitle: string;
  value: number;
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-button bg-forest bg-opacity-10 flex items-center justify-center flex-shrink-0">
          <Icon className="text-forest" size={22} />
        </div>
        <div>
          <p className="font-body font-semibold text-charcoal">{label}</p>
          <p className="font-body text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      {loading ? (
        <Skeleton height="2.5rem" width="4rem" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <p className="font-display text-4xl font-bold text-ember">{value}</p>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLandlord, isTenant } = useAuth();
  const { agreements, loading: agreementsLoading, error: agreementsError, refetch: refetchAgreements } = useAgreements();
  const { agreements: pendingAgreements, loading: pendingLoading } = usePendingAgreements();
  const { properties, pagination: propertiesPagination, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useProperties();
  const { history, loading: historyLoading, error: historyError, refetch: refetchHistory } = useRentalHistory();

  const activeAgreements = agreements.filter((a) => a.status === 'ACTIVE');
  const recentAgreements = agreements.slice(0, 3);

  return (
    <ProtectedPageWrapper>
      <div>
        <p className="font-body text-xs uppercase tracking-wider text-muted mb-2">
          Your overview
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-8 break-words">
          Welcome back, {user?.name}!
        </h1>

        {isTenant && !pendingLoading && pendingAgreements.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-display text-lg font-semibold text-navy mb-4">
              Agreements to Review
            </h3>
            <div className="space-y-3">
              {pendingAgreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-button border border-border"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-ember mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-charcoal text-sm">
                        New agreement from {agreement.landlord?.name || 'your landlord'}
                      </p>
                      <p className="font-body text-muted text-xs truncate">
                        {agreement.property?.address || 'Property'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/agreement/${agreement.id}/review`}>
                    <Button variant="primary" size="sm" className="whitespace-nowrap">
                      Review &amp; Accept
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {isTenant && (
          <Card className="mb-6 bg-navy">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-button bg-white bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Home className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-white">
                    Browse Available Properties
                  </p>
                  <p className="font-body text-sm text-white text-opacity-70">
                    {propertiesLoading
                      ? 'Loading available properties…'
                      : `${propertiesPagination?.total ?? properties.length} ${
                          (propertiesPagination?.total ?? properties.length) === 1
                            ? 'property'
                            : 'properties'
                        } available`}
                  </p>
                </div>
              </div>
              <Link href="/properties/browse">
                <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
                  <Search size={18} />
                  Browse Properties
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {isLandlord && (
            <>
              <StatCard
                icon={Building2}
                label="Properties"
                subtitle="Manage your listings"
                value={properties.length}
                loading={propertiesLoading}
                error={propertiesError}
                onRetry={refetchProperties}
              />
              <StatCard
                icon={FileText}
                label="Active Agreements"
                subtitle="Tenancy agreements"
                value={activeAgreements.length}
                loading={agreementsLoading}
                error={agreementsError}
                onRetry={refetchAgreements}
              />
              <StatCard
                icon={FileText}
                label="Pending Acceptance"
                subtitle="Drafts awaiting your tenant"
                value={pendingAgreements.length}
                loading={pendingLoading}
                error=""
                onRetry={() => {}}
              />
            </>
          )}

          {isTenant && (
            <>
              <StatCard
                icon={FileText}
                label="My Agreements"
                subtitle="Your tenancy agreements"
                value={activeAgreements.length}
                loading={agreementsLoading}
                error={agreementsError}
                onRetry={refetchAgreements}
              />
              <StatCard
                icon={History}
                label="Rental History"
                subtitle="Your rental record"
                value={history.length}
                loading={historyLoading}
                error={historyError}
                onRetry={refetchHistory}
              />
            </>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          {isLandlord && (
            <>
              <Link href="/agreement/new">
                <Button variant="primary" className="flex items-center gap-2">
                  <PlusCircle size={18} />
                  New Agreement
                </Button>
              </Link>
              <Link href="/properties/new">
                <Button variant="secondary" className="flex items-center gap-2">
                  <PlusCircle size={18} />
                  Add Property
                </Button>
              </Link>
            </>
          )}

          {isTenant && (
            <Link href="/rental-history">
              <Button variant="primary" className="flex items-center gap-2">
                <History size={18} />
                View Rental History
              </Button>
            </Link>
          )}
        </div>

        {isLandlord && !pendingLoading && pendingAgreements.length > 0 && (
          <Card title="Pending Acceptance" className="mb-6">
            <div className="space-y-3">
              {pendingAgreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-button border border-border"
                >
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-charcoal text-sm truncate">
                      {agreement.property?.address || 'Property'}
                    </p>
                    <p className="font-body text-muted text-xs">
                      Awaiting tenant · {agreement.tenant?.email || 'Unknown tenant'}
                    </p>
                  </div>
                  <CopyInviteLinkButton agreementId={agreement.id} />
                </div>
              ))}
            </div>
          </Card>
        )}

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
                  className="flex items-center justify-between p-3 rounded-button border border-border hover:bg-cream hover:border-forest transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
                      <FileText className="text-navy" size={16} />
                    </div>
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
