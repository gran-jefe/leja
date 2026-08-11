'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  FileText,
  History,
  Home,
  PlusCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAgreements, usePendingAgreements } from '@/hooks/useAgreements';
import { useProperties } from '@/hooks/useProperties';
import { useRentalHistory } from '@/hooks/useRentalHistory';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { ListRow } from '@/components/ui/ListRow';
import { CopyButton } from '@/components/ui/CopyButton';
import { IconTile } from '@/components/ui/IconTile';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/layout/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatDate } from '@/lib/utils';
import { getStatus } from '@/lib/status';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLandlord, isTenant, isProvider, isNewUser } = useAuth();

  const {
    agreements,
    loading: agreementsLoading,
    error: agreementsError,
    refetch: refetchAgreements,
  } = useAgreements();
  const { agreements: pendingAgreements, loading: pendingLoading } = usePendingAgreements();
  const {
    properties,
    pagination: propertiesPagination,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useProperties();
  const {
    history,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useRentalHistory();

  // A provider with no other capability belongs on their own dashboard. One
  // who is *also* a landlord or tenant stays here and simply sees a provider
  // card alongside the rest — capabilities are additive now.
  const providerOnly = isProvider && !isLandlord && !isTenant;
  useEffect(() => {
    if (providerOnly) router.replace('/provider/dashboard');
  }, [providerOnly, router]);

  if (providerOnly) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Redirecting to your provider dashboard" />
      </div>
    );
  }

  const activeAgreements = agreements.filter((a) => a.status === 'ACTIVE');
  const recentAgreements = agreements.slice(0, 3);
  const availableCount = propertiesPagination?.total ?? properties.length;

  return (
    <div className="max-w-wide mx-auto">
      <PageHeader eyebrow="Your overview" title={`${isNewUser ? 'Welcome' : 'Welcome back'}, ${user?.name ?? ''}`.trim()}
        subtitle={isNewUser ? 'One account. Rent a home, list a property, or both.' : undefined} />

      {/* Nothing earned yet. Rather than making someone declare a role at
          signup, the two starting points are simply offered here — and taking
          either one grants the matching capability. */}
      {isNewUser && (
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <Card tone="dark" className="grain-overlay" padding="lg">
            <IconTile icon={Search} tone="onDark" className="mb-4" />
            <h2 className="font-display text-title font-semibold text-on-dark mb-2">
              Find a home
            </h2>
            <p className="font-body text-body-sm text-on-dark-muted mb-5">
              Browse verified listings and deal directly with the landlord — no agent, no agent
              fee.
            </p>
            <Link href="/properties/browse">
              <Button trailingIcon={<ArrowRight size={17} />}>Browse properties</Button>
            </Link>
          </Card>

          <Card tone="accent" padding="lg">
            <IconTile icon={Building2} tone="brass" className="mb-4" />
            <h2 className="font-display text-title font-semibold text-navy-900 mb-2">
              List a property
            </h2>
            <p className="font-body text-body-sm text-ink-600 mb-5">
              Put your property in front of verified tenants and generate a proper tenancy
              agreement — free.
            </p>
            <Link href="/properties/new">
              <Button variant="tertiary" trailingIcon={<ArrowRight size={17} />}>
                Add a property
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Tenant: agreements waiting on them — the highest-priority thing on
          the page, so it sits above the stats. */}
      {isTenant && !pendingLoading && pendingAgreements.length > 0 && (
        <Card title="Agreements to review" className="mb-6">
          <div className="space-y-3">
            {pendingAgreements.map((agreement) => (
              <div
                key={agreement.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-button border border-warning-100 bg-warning-50"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-warning-500 mt-2 flex-shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-ink-800 text-body-sm">
                      New agreement from {agreement.landlord?.name || 'your landlord'}
                    </p>
                    <p className="font-body text-ink-500 text-body-sm truncate">
                      {agreement.property?.address || 'Property'}
                    </p>
                  </div>
                </div>
                <Link href={`/agreement/${agreement.id}/review`} className="flex-shrink-0">
                  <Button size="sm">Review &amp; accept</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isTenant && (
        <Card tone="dark" className="mb-6 grain-overlay overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <IconTile icon={Home} tone="onDark" />
              <div>
                <p className="font-display text-title font-semibold text-on-dark">
                  Browse available properties
                </p>
                <p className="font-body text-body-sm text-on-dark-muted">
                  {propertiesLoading
                    ? 'Loading available properties…'
                    : `${availableCount} ${availableCount === 1 ? 'property' : 'properties'} available`}
                </p>
              </div>
            </div>
            <Link href="/properties/browse" className="flex-shrink-0">
              <Button leadingIcon={<Search size={17} />}>Browse</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {isLandlord && (
          <>
            <StatCard
              icon={Building2}
              label="Properties"
              subtitle="Your listings"
              value={properties.length}
              loading={propertiesLoading}
              error={propertiesError}
              onRetry={refetchProperties}
            />
            <StatCard
              icon={FileText}
              label="Active agreements"
              subtitle="Currently running"
              value={activeAgreements.length}
              loading={agreementsLoading}
              error={agreementsError}
              onRetry={refetchAgreements}
            />
            <StatCard
              icon={FileText}
              label="Pending acceptance"
              subtitle="Awaiting your tenant"
              value={pendingAgreements.length}
              loading={pendingLoading}
            />
          </>
        )}

        {isTenant && (
          <>
            <StatCard
              icon={FileText}
              label="My agreements"
              subtitle="Active tenancies"
              value={activeAgreements.length}
              loading={agreementsLoading}
              error={agreementsError}
              onRetry={refetchAgreements}
            />
            <StatCard
              icon={History}
              label="Rental history"
              subtitle="Tenancies on record"
              value={history.length}
              loading={historyLoading}
              error={historyError}
              onRetry={refetchHistory}
            />
          </>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {isLandlord && (
          <>
            <Link href="/agreement/new">
              <Button leadingIcon={<PlusCircle size={17} />}>New agreement</Button>
            </Link>
            <Link href="/properties/new">
              <Button variant="secondary" leadingIcon={<PlusCircle size={17} />}>
                Add property
              </Button>
            </Link>
          </>
        )}
        {isTenant && (
          <Link href="/rental-history">
            <Button variant="secondary" leadingIcon={<History size={17} />}>
              View rental history
            </Button>
          </Link>
        )}
      </div>

      {isLandlord && !pendingLoading && pendingAgreements.length > 0 && (
        <Card title="Pending acceptance" subtitle="Share the link to nudge your tenant" className="mb-6">
          <div className="space-y-3">
            {pendingAgreements.map((agreement) => (
              <div
                key={agreement.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-button border border-ink-200"
              >
                <div className="min-w-0">
                  <p className="font-body font-semibold text-ink-800 text-body-sm truncate">
                    {agreement.property?.address || 'Property'}
                  </p>
                  <p className="font-body text-ink-500 text-body-sm">
                    Awaiting {agreement.tenant?.email || 'tenant'}
                  </p>
                </div>
                <CopyButton
                  label="Copy invite link"
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/agreement/${agreement.id}/review`
                      : ''
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card
        title="Recent activity"
        action={
          agreements.length > 0 ? (
            <Link href="/agreements">
              <Button variant="link" size="sm" trailingIcon={<ArrowRight size={15} />}>
                View all
              </Button>
            </Link>
          ) : undefined
        }
      >
        {agreementsLoading ? (
          <SkeletonList count={3} lines={1} />
        ) : agreementsError ? (
          <ErrorState message={agreementsError} onRetry={refetchAgreements} />
        ) : recentAgreements.length === 0 ? (
          <EmptyState
            size="sm"
            icon={FileText}
            title="No agreements yet"
            description={
              isLandlord
                ? 'Create your first agreement once you have a property listed.'
                : 'Agreements your landlord sends will appear here.'
            }
          />
        ) : (
          <div className="space-y-3">
            {recentAgreements.map((agreement) => {
              const status = getStatus('agreement', agreement.status);
              return (
                <ListRow
                  key={agreement.id}
                  href={`/agreement/${agreement.id}`}
                  icon={FileText}
                  title={agreement.property?.address || 'Unknown property'}
                  meta={`${
                    isLandlord
                      ? agreement.tenant?.name || 'Unknown tenant'
                      : agreement.landlord?.name || 'Unknown landlord'
                  } · ${formatDate(agreement.created_at)}`}
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
      </Card>
    </div>
  );
}
