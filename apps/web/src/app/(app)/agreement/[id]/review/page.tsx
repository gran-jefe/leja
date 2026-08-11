'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, PiggyBank, Shield } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Field, FieldGroup } from '@/components/ui/Field';
import { IconTile } from '@/components/ui/IconTile';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { useAgreementPreview, useAcceptAgreement, useDeclineAgreement } from '@/hooks/useAgreements';

import { formatNaira, formatDate } from '@/lib/utils';

function monthsBetween(start?: string, end?: string) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  return months > 0 ? months : null;
}

function ReviewContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { preview, loading, error, refetch } = useAgreementPreview(id);
  const { acceptAgreement, loading: accepting, error: acceptError } = useAcceptAgreement();
  const { declineAgreement, loading: declining } = useDeclineAgreement();
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  if (loading) {
    return (
      <div className="max-w-content mx-auto">
        <Card>
          <Skeleton height="1.5rem" className="mb-4" width="60%" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" width="40%" />
        </Card>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="max-w-content mx-auto">
        <ErrorState message={error || 'Agreement not found'} onRetry={refetch} />
      </div>
    );
  }

  const { agreement, pricing } = preview;

  if (agreement.tenant_id !== user?.id) {
    return (
      <div className="max-w-content mx-auto">
        <Card>
          <p className="font-body text-ink-700">This agreement isn\u2019t addressed to you.</p>
        </Card>
      </div>
    );
  }

  const duration = monthsBetween(agreement.start_date, agreement.end_date);

  const handleAccept = async () => {
    const result = await acceptAgreement(id);
    if (!result) return;

    // Base acceptance is free — only send the tenant to a payment step if
    // they opted into the paid lawyer-review add-on. What that step looks
    // like depends on the active payment provider: a redirect link (hosted
    // checkout) or account-transfer instructions (eTranzact) — see the
    // /pay page, which reads `mode` to decide.
    if (result.payment?.mode === 'redirect') {
      window.location.href = result.payment.paymentLink;
    } else if (result.payment?.mode === 'account_transfer') {
      const p = result.payment;
      const params = new URLSearchParams({
        reference: p.reference,
        accountNumber: p.accountNumber,
        accountName: p.accountName,
        bankName: p.bankName,
        amount: String(p.amount),
        ...(p.expiresAt ? { expiresAt: p.expiresAt } : {}),
      });
      router.push(`/agreement/${id}/pay?${params.toString()}`);
    } else {
      router.push(`/agreement/${id}?created=1`);
    }
  };

  const handleDecline = async () => {
    const updated = await declineAgreement(id);
    setShowDeclineConfirm(false);
    if (updated) {
      router.push(`/agreement/${id}`);
    }
  };

  return (
    <div className="max-w-content mx-auto space-y-6">
      <PageHeader
        eyebrow="Step 1 of 1"
        title="Review your tenancy agreement"
        subtitle="Read it carefully. Accepting is free and takes effect immediately."
        className="mb-0"
      />

      <Card title="Agreement summary">
        <FieldGroup columns={2}>
          <Field label="Property">{agreement.property?.address}</Field>
          <Field label="Location">
            {agreement.property?.city}, {agreement.property?.state}
          </Field>
          <Field label="Landlord">{agreement.landlord?.name}</Field>
          <Field label="Tenancy period" mono>
            {formatDate(agreement.start_date)} → {formatDate(agreement.end_date)}
            {duration ? ` (${duration} month${duration === 1 ? '' : 's'})` : ''}
          </Field>
          <Field label="Monthly rent" mono>
            {formatNaira(agreement.monthly_rent)}
          </Field>
          <Field label="Annual rent" mono>
            {formatNaira(agreement.annual_rent)}
          </Field>
        </FieldGroup>
      </Card>

      <Card tone="dark" className="grain-overlay">
        <p className="font-mono text-label uppercase text-on-dark-muted mb-4">
          What you&apos;ll pay today
        </p>
        <dl className="space-y-2.5 font-body text-on-dark">
          <div className="flex justify-between gap-4">
            <dt>Connecting &amp; standardized agreement</dt>
            <dd className="font-mono text-success-500 font-semibold">Free</dd>
          </div>
          {pricing.lawyerReviewFee > 0 && (
            <div className="flex justify-between gap-4">
              <dt>Lawyer review (optional, requested by your landlord)</dt>
              <dd className="font-mono">{formatNaira(pricing.lawyerReviewFee)}</dd>
            </div>
          )}
          <div className="border-t border-white/20 pt-3 flex justify-between gap-4 items-baseline">
            <dt className="font-semibold">Total due now</dt>
            <dd className="font-mono tabular-nums text-display-sm font-medium text-brass-500">
              {formatNaira(pricing.total)}
            </dd>
          </div>
        </dl>
        {pricing.lawyerReviewFee > 0 && (
          <p className="font-body text-body-sm text-on-dark-muted mt-3">
            Reviewed by our in-house legal team — a flat, fixed fee, not a marketplace bid.
          </p>
        )}
      </Card>

      {/* Was a bg-forest card headed with a literal 💰 emoji. */}
      <Card tone="accent">
        <div className="flex items-start gap-4">
          <IconTile icon={PiggyBank} tone="brass" />
          <div className="min-w-0">
            <p className="font-display text-title font-semibold text-navy-900 mb-3">
              You keep {formatNaira(pricing.savings.totalSavings)} by not using an agent
            </p>
            <dl className="font-body text-body-sm text-ink-600 space-y-1.5">
              <div className="flex justify-between gap-4">
                <dt>Typical agent fee</dt>
                <dd className="font-mono line-through">{formatNaira(pricing.savings.vsAgentFee)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Typical legal fee</dt>
                <dd className="font-mono line-through">{formatNaira(pricing.savings.vsLegalFee)}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-1.5 border-t border-brass-300/50 font-semibold text-ink-800">
                <dt>BeyondAgency base fee</dt>
                <dd className="font-mono">₦0</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {agreement.property?.requires_insurance && (
        <Alert tone="info" title="Rent-protection insurance required for this property">
          Your landlord requires this as a condition of tenancy. It&apos;s underwritten by a
          licensed insurer and paid by your landlord — not you. We&apos;ll post it to our insurer
          network as soon as you accept.
        </Alert>
      )}

      <Card>
        <h3 className="font-display text-title font-semibold text-navy-900 mb-3">Agreement terms</h3>
        <div className="max-h-64 overflow-y-auto space-y-2.5 font-body text-body-sm text-ink-700 pr-2">
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-brass-600 flex-shrink-0 mt-0.5" aria-hidden />
            Tenancy period: {formatDate(agreement.start_date)} to {formatDate(agreement.end_date)}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-brass-600 flex-shrink-0 mt-0.5" aria-hidden />
            Monthly rent: {formatNaira(agreement.monthly_rent)}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-brass-600 flex-shrink-0 mt-0.5" aria-hidden />
            Governed by {agreement.property?.state || 'applicable'} Tenancy Law
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-brass-600 flex-shrink-0 mt-0.5" aria-hidden />
            Dispute resolution through the BeyondAgency platform
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-brass-600 flex-shrink-0 mt-0.5" aria-hidden />
            1 month notice required for termination
          </p>
        </div>
      </Card>

      {acceptError && <Alert tone="error">{acceptError}</Alert>}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="secondary" fullWidth onClick={() => setShowDeclineConfirm(true)}>
          Decline agreement
        </Button>
        <Button fullWidth size="lg" loading={accepting} onClick={handleAccept}>
          {pricing.total > 0 ? `Accept & pay ${formatNaira(pricing.total)}` : 'Accept — free'}
        </Button>
      </div>

      {/* Was an inline fixed-position div: no portal, no focus trap, no
          Escape, no scroll lock, no dialog role. */}
      <Modal
        open={showDeclineConfirm}
        onClose={() => setShowDeclineConfirm(false)}
        title="Decline this agreement?"
        description="Your landlord will be notified. This can't be undone from your side."
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeclineConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={declining} onClick={handleDecline}>
              Decline agreement
            </Button>
          </>
        }
      />
    </div>
  );
}

// GRANT POINT — no capability gate. Accepting your first agreement is
// what makes you a tenant. Authorisation is the tenant_id check on the
// agreement itself, enforced server-side.
export default function AgreementReviewPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <ReviewContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
