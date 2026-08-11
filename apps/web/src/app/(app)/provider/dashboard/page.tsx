'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Briefcase, Trophy } from 'lucide-react';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { StatCard } from '@/components/ui/StatCard';
import { ListRow } from '@/components/ui/ListRow';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Capability, BEYOND_PRICING } from '@beyond/shared';
import api from '@/lib/api';
import { formatDate, formatNaira, getErrorMessage } from '@/lib/utils';
import type { StatusTone } from '@/lib/status';

interface ServiceBid {
  id: string;
  job_id: string;
  price: number;
  turnaround_hours: number;
  status: 'SUBMITTED' | 'WON' | 'LOST' | 'WITHDRAWN';
  created_at: string;
}

const statusVariant: Record<ServiceBid['status'], StatusTone> = {
  SUBMITTED: 'neutral',
  WON: 'success',
  LOST: 'danger',
  WITHDRAWN: 'warning',
};

interface ProviderProfile {
  id: string;
  category: string;
  status: string;
  employment_type: 'INTERNAL' | 'EXTERNAL';
  effective_subscription_tier: 'STANDARD' | 'PRIORITY';
  subscription_expires_at: string | null;
}

function ProviderDashboardContent() {
  const router = useRouter();
  const [bids, setBids] = useState<ServiceBid[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const fetchBids = async () => {
    setLoading(true);
    setError('');
    try {
      const [bidsRes, profileRes] = await Promise.all([
        api.get('/marketplace/providers/me/bids'),
        api.get('/marketplace/providers/me'),
      ]);
      setBids(bidsRes.data.data || []);
      setProfile(profileRes.data.data || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your bids'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    setSubscribeError('');
    try {
      const res = await api.post('/marketplace/providers/subscribe');
      const payment = res.data.data.payment;
      if (payment?.mode === 'redirect') {
        window.location.href = payment.paymentLink;
        return;
      }
      // eTranzact (account_transfer) — send to the instructions page instead
      // of a hosted redirect. See lib/payments/types.ts for why this differs
      // by provider.
      const params = new URLSearchParams({
        reference: payment.reference,
        accountNumber: payment.accountNumber,
        accountName: payment.accountName,
        bankName: payment.bankName,
        amount: String(payment.amount),
      });
      router.push(`/provider/dashboard/pay?${params.toString()}`);
    } catch (err) {
      setSubscribeError(getErrorMessage(err, 'Failed to start subscription'));
      setSubscribing(false);
    }
  };

  const won = bids.filter((b) => b.status === 'WON').length;
  const isPriority = profile?.effective_subscription_tier === 'PRIORITY';

  return (
    <div className="max-w-wide mx-auto">
      <PageHeader
        title="Your bids"
        subtitle="Track what you've bid on and what you've won."
        icon={Briefcase}
        action={
          <Link href="/provider/jobs">
            <Button trailingIcon={<ArrowRight size={17} />}>Browse open jobs</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 max-w-lg">
        <StatCard icon={Briefcase} label="Total bids" value={bids.length} loading={loading} />
        <StatCard
          icon={Trophy}
          label="Jobs won"
          value={won}
          loading={loading}
          iconTone="success"
        />
      </div>

      {!loading && !error && profile && profile.employment_type === 'EXTERNAL' && (
        <Card tone={isPriority ? 'accent' : 'paper'} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-body font-semibold text-ink-800">
                  {isPriority ? 'Priority tier' : 'Standard tier'}
                </p>
                <Badge tone={isPriority ? 'brand' : 'neutral'} size="sm">
                  {isPriority ? 'Active' : 'Free'}
                </Badge>
              </div>
              <p className="font-body text-body-sm text-ink-500">
                {isPriority
                  ? `You see jobs immediately, before standard-tier providers. Renews ${profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : ''}.`
                  : 'You see jobs after a short delay. Upgrade for immediate visibility on every new job.'}
              </p>
            </div>
            {!isPriority && (
              <Button loading={subscribing} onClick={handleSubscribe} className="flex-shrink-0">
                Upgrade — {formatNaira(BEYOND_PRICING.PROVIDER_PRIORITY_SUBSCRIPTION)}/mo
              </Button>
            )}
          </div>
          {subscribeError && (
            <Alert tone="error" size="sm" className="mt-3">
              {subscribeError}
            </Alert>
          )}
        </Card>
      )}

      {loading ? (
        <SkeletonList count={3} lines={1} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBids} size="page" />
      ) : bids.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No bids yet"
          description="Bids you place on open jobs will be tracked here."
          action={
            <Link href="/provider/jobs">
              <Button>Browse open jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <ListRow
              key={bid.id}
              icon={Briefcase}
              title={`${formatNaira(bid.price)} · ${bid.turnaround_hours}h turnaround`}
              meta={`Submitted ${formatDate(bid.created_at)}`}
              trailing={
                <Badge tone={statusVariant[bid.status]} dot>
                  {bid.status}
                </Badge>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <ProtectedPageWrapper requiredCapability={Capability.PROVIDER}>
      <ProviderDashboardContent />
    </ProtectedPageWrapper>
  );
}
