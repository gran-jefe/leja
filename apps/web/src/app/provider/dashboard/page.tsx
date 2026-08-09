'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { UserRole, BEYOND_PRICING } from '@beyond/shared';
import api from '@/lib/api';
import { formatNaira, getErrorMessage } from '@/lib/utils';

interface ServiceBid {
  id: string;
  job_id: string;
  price: number;
  turnaround_hours: number;
  status: 'SUBMITTED' | 'WON' | 'LOST' | 'WITHDRAWN';
  created_at: string;
}

const statusVariant: Record<ServiceBid['status'], 'default' | 'success' | 'warning' | 'danger'> = {
  SUBMITTED: 'default',
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
      window.location.href = res.data.data.paymentLink;
    } catch (err) {
      setSubscribeError(getErrorMessage(err, 'Failed to start subscription'));
      setSubscribing(false);
    }
  };

  const won = bids.filter((b) => b.status === 'WON').length;
  const isPriority = profile?.effective_subscription_tier === 'PRIORITY';

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">Your bids</h1>
        <Link href="/provider/jobs">
          <Button variant="primary">Browse open jobs</Button>
        </Link>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
          <Card>
            <p className="text-sm text-muted font-body">Total bids</p>
            <p className="font-display text-2xl font-bold text-navy">{bids.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted font-body">Jobs won</p>
            <p className="font-display text-2xl font-bold text-forest">{won}</p>
          </Card>
        </div>
      )}

      {!loading && !error && profile && profile.employment_type === 'EXTERNAL' && (
        <Card className={isPriority ? 'mb-6 border-2 border-forest' : 'mb-6 border-2 border-ember'}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-body font-semibold text-charcoal">
                {isPriority ? 'Priority tier active' : 'Standard tier'}
              </p>
              <p className="font-body text-sm text-muted">
                {isPriority
                  ? `You see jobs immediately, before standard-tier providers. Renews ${profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : ''}.`
                  : 'You see jobs after a short delay. Upgrade for immediate visibility on every new job.'}
              </p>
            </div>
            {!isPriority && (
              <Button variant="primary" loading={subscribing} onClick={handleSubscribe}>
                Upgrade — {formatNaira(BEYOND_PRICING.PROVIDER_PRIORITY_SUBSCRIPTION)}/mo
              </Button>
            )}
          </div>
          {subscribeError && (
            <p className="text-sm text-ember font-body mt-2">{subscribeError}</p>
          )}
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBids} />
      ) : bids.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-muted text-center py-6">
            You haven't bid on any jobs yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-body font-semibold text-charcoal">
                    {formatNaira(bid.price)} · {bid.turnaround_hours}h turnaround
                  </p>
                  <p className="text-xs text-muted font-body">
                    Submitted {new Date(bid.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusVariant[bid.status]}>{bid.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.PROVIDER}>
      <DashboardShell>
        <ProviderDashboardContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
