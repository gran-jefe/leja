'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { useAgreementPreview, useAcceptAgreement, useDeclineAgreement } from '@/hooks/useAgreements';
import { UserRole } from '@leja/shared';
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
      <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
        <ErrorState message={error || 'Agreement not found'} onRetry={refetch} />
      </div>
    );
  }

  const { agreement, pricing } = preview;

  if (agreement.tenant_id !== user?.id) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <p className="font-body text-charcoal">This agreement is not for you.</p>
        </Card>
      </div>
    );
  }

  const duration = monthsBetween(agreement.start_date, agreement.end_date);

  const handleAccept = async () => {
    const result = await acceptAgreement(id);
    if (result?.paymentLink) {
      window.location.href = result.paymentLink;
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-2">
          Review Your Tenancy Agreement
        </h1>
        <p className="font-body text-muted">Read carefully before accepting.</p>
      </div>

      <Card title="Agreement Summary">
        <div className="space-y-3 text-sm font-body">
          <p>
            <span className="font-semibold">Property:</span> {agreement.property?.address}
          </p>
          <p>
            <span className="font-semibold">Location:</span> {agreement.property?.city},{' '}
            {agreement.property?.state}
          </p>
          <p>
            <span className="font-semibold">Landlord:</span> {agreement.landlord?.name}
          </p>
          <p>
            <span className="font-semibold">Tenancy period:</span> {formatDate(agreement.start_date)}{' '}
            → {formatDate(agreement.end_date)}
            {duration ? ` (${duration} month${duration === 1 ? '' : 's'})` : ''}
          </p>
          <p>
            <span className="font-semibold">Monthly Rent:</span> {formatNaira(agreement.monthly_rent)}
          </p>
          <p>
            <span className="font-semibold">Annual Rent:</span> {formatNaira(agreement.annual_rent)}
          </p>
        </div>
      </Card>

      <Card className="bg-navy">
        <p className="font-body text-sm text-white text-opacity-70 mb-3">What you'll pay today</p>
        <div className="space-y-2 font-body text-white">
          <div className="flex justify-between">
            <span>Move-in fee</span>
            <span>{formatNaira(pricing.moveInFee)}</span>
          </div>
          {pricing.lawyerReviewFee > 0 && (
            <div className="flex justify-between">
              <span>Lawyer review</span>
              <span>{formatNaira(pricing.lawyerReviewFee)}</span>
            </div>
          )}
          <div className="border-t border-white border-opacity-20 pt-2 flex justify-between font-display text-xl font-bold">
            <span>Total</span>
            <span>{formatNaira(pricing.total)}</span>
          </div>
        </div>
      </Card>

      <Card className="bg-forest">
        <p className="font-body text-white font-semibold mb-2">
          💰 You're saving {formatNaira(pricing.savings.totalSavings)} vs going through an agent
        </p>
        <div className="font-body text-sm text-white text-opacity-90 space-y-1">
          <p>Typical agent fee: {formatNaira(pricing.savings.vsAgentFee)}</p>
          <p>Typical legal fee: {formatNaira(pricing.savings.vsLegalFee)}</p>
          <p>Leja fee: {formatNaira(pricing.total)}</p>
          <p className="font-semibold">Your saving: {formatNaira(pricing.savings.totalSavings)}</p>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-navy mb-3">Agreement Terms</h3>
        <div className="max-h-56 overflow-y-auto space-y-2 font-body text-sm text-charcoal pr-2">
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-forest flex-shrink-0 mt-0.5" />
            Tenancy period: {formatDate(agreement.start_date)} to {formatDate(agreement.end_date)}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-forest flex-shrink-0 mt-0.5" />
            Monthly rent: {formatNaira(agreement.monthly_rent)}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-forest flex-shrink-0 mt-0.5" />
            Governed by {agreement.property?.state || 'applicable'} Tenancy Law
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-forest flex-shrink-0 mt-0.5" />
            Dispute resolution through the Leja platform
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-forest flex-shrink-0 mt-0.5" />
            1 month notice required for termination
          </p>
        </div>
      </Card>

      {acceptError && (
        <Card className="bg-ember bg-opacity-10 border border-ember">
          <p className="font-body text-sm text-ember">{acceptError}</p>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="ghost"
          className="text-ember flex-1"
          onClick={() => setShowDeclineConfirm(true)}
        >
          Decline Agreement
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          loading={accepting}
          onClick={handleAccept}
        >
          Accept &amp; Pay {formatNaira(pricing.total)}
        </Button>
      </div>

      {showDeclineConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-w-sm w-full">
            <h3 className="font-display text-lg font-semibold text-navy mb-2">
              Are you sure?
            </h3>
            <p className="font-body text-sm text-muted mb-6">
              The landlord will be notified that you declined this agreement.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeclineConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" loading={declining} onClick={handleDecline}>
                Decline
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AgreementReviewPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT}>
      <DashboardShell>
        <ReviewContent />
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
