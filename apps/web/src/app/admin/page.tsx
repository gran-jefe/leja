'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface PendingProvider {
  id: string;
  category: string;
  license_number: string;
  created_at: string;
  applicant: { name: string; email: string } | null;
}

function VerifyProvidersSection() {
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketplace/providers/pending');
      setProviders(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load pending providers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      await api.post(`/marketplace/providers/${id}/verify`);
      await fetchPending();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to verify provider'));
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold text-navy mb-1">
        Pending provider applications
      </h2>
      <p className="font-body text-sm text-muted mb-4">
        External providers (currently insurance) waiting on license verification.
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <p className="text-sm text-ember font-body">{error}</p>
      ) : providers.length === 0 ? (
        <p className="font-body text-sm text-muted">Nothing pending.</p>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 flex-wrap border border-border rounded-button p-3"
            >
              <div>
                <p className="font-body font-semibold text-charcoal">
                  {p.applicant?.name || 'Unknown'}{' '}
                  <span className="text-muted font-normal">({p.applicant?.email})</span>
                </p>
                <p className="text-xs text-muted font-body">
                  {p.category} · License {p.license_number} · Applied{' '}
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                loading={verifyingId === p.id}
                onClick={() => handleVerify(p.id)}
              >
                Verify &amp; activate
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function OnboardInternalSection() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'LEGAL' | 'INSURANCE'>('LEGAL');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/marketplace/providers/internal', {
        email,
        category,
        licenseNumber,
      });
      setSuccess(`${res.data.data.category} staff onboarded and active.`);
      setEmail('');
      setLicenseNumber('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to onboard'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold text-navy mb-1">
        Onboard salaried staff
      </h2>
      <p className="font-body text-sm text-muted mb-4">
        Hire an in-house lawyer (or future internal category) directly — bypasses the external
        apply/verify flow, goes straight to active.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Input
          label="Their BeyondAgency account email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="lawyer@beyondagency.ng"
          required
        />
        <p className="text-xs text-muted font-body -mt-2">
          They need to have signed up already — this links to their existing account.
        </p>
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'LEGAL' | 'INSURANCE')}
            className="w-full px-4 py-2 font-body border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="LEGAL">Legal</option>
            <option value="INSURANCE">Insurance</option>
          </select>
        </div>
        <Input
          label="License / registration number"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="e.g. SCN123456"
          required
        />
        {error && <p className="text-sm text-ember font-body">{error}</p>}
        {success && <p className="text-sm text-forest font-body">{success}</p>}
        <Button type="submit" variant="primary" loading={submitting}>
          Onboard as internal staff
        </Button>
      </form>
    </Card>
  );
}

function AdminContent() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api
      .get('/marketplace/admin/whoami')
      .then((res) => setIsAdmin(!!res.data.data?.isAdmin))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <ShieldAlert className="text-ember mx-auto mb-3" size={32} />
        <h2 className="font-display text-lg font-semibold text-navy mb-2">Admin access only</h2>
        <p className="font-body text-sm text-muted">
          Your account isn't on the admin allowlist. Ask whoever manages{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded">ADMIN_EMAILS</code> to add you.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-forest" size={24} />
        <h1 className="font-display text-2xl font-bold text-navy">Admin</h1>
      </div>
      <VerifyProvidersSection />
      <OnboardInternalSection />
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <AdminContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
