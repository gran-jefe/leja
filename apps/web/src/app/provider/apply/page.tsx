'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

function ProviderApplyContent() {
  const router = useRouter();
  // Legal review is staffed in-house (salaried), not an open application —
  // this form is for external bid-marketplace categories only, currently
  // just insurance. The backend rejects category: 'LEGAL' here regardless.
  const category = 'INSURANCE' as const;
  const [licenseNumber, setLicenseNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/marketplace/providers/apply', { category, licenseNumber });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit application'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center">
          <div className="w-14 h-14 rounded-full bg-forest bg-opacity-10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-forest" size={28} />
          </div>
          <h2 className="font-display text-xl font-bold text-navy mb-2">Application submitted</h2>
          <p className="font-body text-sm text-muted mb-6">
            We'll verify your license and activate your provider account. Once you get a
            confirmation, log out and back in — that refreshes your account to unlock the
            provider dashboard — then you'll see live insurance jobs to bid on.
          </p>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold text-navy mb-2">Become a provider</h1>
      <p className="font-body text-sm text-muted mb-6">
        Join the bid pool for rent-protection insurance jobs. Vetted, licensed insurers compete
        on price and turnaround — no cold outreach, jobs come to you.
      </p>
      <p className="font-body text-xs text-muted mb-6">
        Looking for legal work? Our legal review is handled by an in-house, salaried team rather
        than an open bid — check our careers page for openings instead.
      </p>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="NAICOM license number"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. NAICOM123456"
            required
          />
          {error && <p className="text-sm text-ember font-body">{error}</p>}
          <Button type="submit" variant="primary" loading={submitting} className="w-full">
            Submit application
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function ProviderApplyPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <ProviderApplyContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
