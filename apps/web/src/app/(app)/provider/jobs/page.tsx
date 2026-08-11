'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Select';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Capability } from '@beyond/shared';
import api from '@/lib/api';
import { formatNaira, getErrorMessage } from '@/lib/utils';

interface ServiceJob {
  id: string;
  category: string;
  min_price: number | null;
  max_price: number | null;
  bid_window_closes_at: string;
  created_at: string;
}

function BidForm({ job, onBid }: { job: ServiceJob; onBid: () => void }) {
  const [price, setPrice] = useState('');
  const [turnaround, setTurnaround] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/marketplace/jobs/${job.id}/bids`, {
        price: Number(price),
        turnaroundHours: Number(turnaround),
      });
      setDone(true);
      onBid();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit bid'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <p className="font-body text-sm text-forest">Bid submitted.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-3 mt-4 pt-4 border-t border-ink-200">
      <Input
        label="Your price (₦)"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        min={job.min_price ?? undefined}
        max={job.max_price ?? undefined}
        required
      />
      <Input
        label="Turnaround (hours)"
        type="number"
        value={turnaround}
        onChange={(e) => setTurnaround(e.target.value)}
        min={1}
        required
      />
      <Button type="submit" loading={submitting} className="flex-shrink-0">
        Submit bid
      </Button>
      {error && (
        <Alert tone="error" size="sm" className="w-full">
          {error}
        </Alert>
      )}
    </form>
  );
}

function ProviderJobsContent() {
  // Defaults to INSURANCE — the only category with a real open bid pool.
  // LEGAL jobs are auto-assigned to in-house staff and only ever appear
  // here in the fallback case where no internal lawyer was available.
  const [category, setCategory] = useState<'LEGAL' | 'INSURANCE'>('INSURANCE');
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketplace/jobs/open', { params: { category } });
      setJobs(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load open jobs'));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="max-w-wide mx-auto">
      <PageHeader
        title="Open jobs"
        subtitle="Bid on work posted by tenants and landlords."
        icon={Briefcase}
        action={
          <Select
            label="Category"
            hideLabel
            value={category}
            onChange={(e) => setCategory(e.target.value as 'LEGAL' | 'INSURANCE')}
            options={[
              { value: 'INSURANCE', label: 'Insurance' },
              { value: 'LEGAL', label: 'Legal' },
            ]}
          />
        }
      />

      {loading ? (
        <SkeletonList count={3} lines={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} size="page" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open jobs right now"
          description="Check back shortly. If this persists, confirm your provider status hasn't been suspended."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <Badge tone="info">{job.category}</Badge>
                <span className="font-mono text-body-sm text-ink-400">
                  Closes {new Date(job.bid_window_closes_at).toLocaleString()}
                </span>
              </div>
              <p className="font-body text-body-sm text-ink-600">
                Allowed range{' '}
                <span className="font-mono text-ink-800">
                  {job.min_price ? formatNaira(job.min_price) : '—'} –{' '}
                  {job.max_price ? formatNaira(job.max_price) : '—'}
                </span>
              </p>
              <BidForm job={job} onBid={fetchJobs} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProviderJobsPage() {
  return (
    <ProtectedPageWrapper requiredCapability={Capability.PROVIDER}>
      <ProviderJobsContent />
    </ProtectedPageWrapper>
  );
}
