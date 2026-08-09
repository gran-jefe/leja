'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { UserRole } from '@beyond/shared';
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mt-3">
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
      <Button type="submit" variant="primary" loading={submitting}>
        Submit bid
      </Button>
      {error && <p className="text-sm text-ember font-body w-full">{error}</p>}
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
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-navy">Open jobs</h1>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as 'LEGAL' | 'INSURANCE')}
          className="px-4 py-2 font-body border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
        >
          <option value="LEGAL">Legal</option>
          <option value="INSURANCE">Insurance</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobs} />
      ) : jobs.length === 0 ? (
        <Card>
          <p className="font-body text-sm text-muted text-center py-6">
            No open jobs right now. Check back soon, or verify your provider status hasn't been
            suspended.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="info">{job.category}</Badge>
                <span className="text-xs text-muted font-body">
                  Bidding closes {new Date(job.bid_window_closes_at).toLocaleString()}
                </span>
              </div>
              <p className="font-body text-sm text-charcoal">
                Allowed range: {job.min_price ? formatNaira(job.min_price) : '—'} –{' '}
                {job.max_price ? formatNaira(job.max_price) : '—'}
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
    <ProtectedPageWrapper requiredRole={UserRole.PROVIDER}>
      <DashboardShell>
        <ProviderJobsContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
