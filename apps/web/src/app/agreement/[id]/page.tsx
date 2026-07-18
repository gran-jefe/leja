'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { FileDown, CheckCircle2, CheckCircle, FileText, Copy, Check } from 'lucide-react';
import { useAgreement } from '@/hooks/useAgreements';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  formatDate,
  formatNaira,
  getAgreementStatusLabel,
  getAgreementStatusVariant,
  getErrorMessage,
  getLawyerReviewStatusVariant,
} from '@/lib/utils';

function AgreementContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { agreement, loading, error, refetch } = useAgreement(id);
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const justCreated = searchParams.get('created') === '1';
  const justPaid = searchParams.get('payment') === 'success';

  const isGeneratingPdf = agreement?.status === 'ACTIVE' && !agreement?.pdf_url;
  const isPendingPayment = agreement?.status === 'PENDING_PAYMENT';

  useEffect(() => {
    if (!isGeneratingPdf && !isPendingPayment) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [isGeneratingPdf, isPendingPayment, refetch]);

  const handleRequestLawyerReview = async () => {
    setRequestingReview(true);
    setReviewError('');
    try {
      await api.post(`/agreements/${id}/request-lawyer-review`);
      await refetch();
    } catch (err) {
      setReviewError(getErrorMessage(err, 'Failed to request lawyer review'));
    } finally {
      setRequestingReview(false);
    }
  };

  const handleCopyInviteLink = async () => {
    const link = `${window.location.origin}/agreement/${id}/review`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const downloadLabel = agreement?.pdf_url
    ? 'Download Agreement PDF'
    : agreement?.status === 'ACTIVE'
      ? 'Generating your PDF...'
      : 'PDF available after payment';

  const isLandlordView = user?.role === 'LANDLORD';

  return (
    <div className="max-w-2xl mx-auto">
      {loading ? (
        <Card>
          <Skeleton height="1.5rem" className="mb-4" width="50%" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" width="40%" />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !agreement ? (
        <ErrorState message="Agreement not found" />
      ) : (
        <>
          {justCreated && (
            <div className="mb-6 p-4 bg-forest bg-opacity-10 border border-forest rounded-button font-body text-sm text-forest">
              Agreement created! Your tenant will receive a notification to review and accept it.
            </div>
          )}
          {justPaid && agreement.status !== 'ACTIVE' && (
            <div className="mb-6 p-4 bg-forest bg-opacity-10 border border-forest rounded-button font-body text-sm text-forest">
              Payment received — confirming with Flutterwave now. This page will update automatically.
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-3 min-w-0">
              <div className="w-12 h-12 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
                <FileText className="text-navy" size={24} />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy break-words min-w-0">
                {agreement.property?.address || 'Agreement'}
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={getAgreementStatusVariant(agreement.status)}>
                {agreement.status === 'DRAFT'
                  ? 'Awaiting Tenant Acceptance'
                  : getAgreementStatusLabel(agreement.status)}
              </Badge>
              <Badge variant={getLawyerReviewStatusVariant(agreement.lawyer_review_status)}>
                Lawyer Review: {agreement.lawyer_review_status}
              </Badge>
            </div>
          </div>

          {/* DRAFT — landlord view */}
          {agreement.status === 'DRAFT' && isLandlordView && (
            <Card className="mb-6">
              <h3 className="font-display text-lg font-semibold text-navy mb-2">
                Waiting for tenant to accept
              </h3>
              <p className="font-body text-sm text-charcoal mb-1">
                Tenant: {agreement.tenant?.name} ({agreement.tenant?.email})
              </p>
              <p className="font-body text-sm text-muted mb-4">
                We'll notify {agreement.tenant?.name || 'your tenant'} to review this agreement.
              </p>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleCopyInviteLink}
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                {linkCopied ? 'Copied!' : 'Copy tenant invite link'}
              </Button>
            </Card>
          )}

          {/* DRAFT — tenant view */}
          {agreement.status === 'DRAFT' && !isLandlordView && (
            <Card className="mb-6 bg-navy">
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                You have a new tenancy agreement to review
              </h3>
              <p className="font-body text-sm text-white text-opacity-70 mb-4">
                From {agreement.landlord?.name || 'your landlord'} — review the terms and accept
                when you're ready.
              </p>
              <Link href={`/agreement/${id}/review`}>
                <Button variant="primary">Review &amp; Accept Agreement</Button>
              </Link>
            </Card>
          )}

          {/* PENDING_PAYMENT */}
          {isPendingPayment && (
            <Card className="mb-6 flex items-center gap-4">
              <Spinner size="md" />
              <div>
                <p className="font-body font-semibold text-charcoal">Payment in progress...</p>
                <p className="font-body text-sm text-muted">
                  This page will update automatically once your payment is confirmed.
                </p>
              </div>
            </Card>
          )}

          <Card title="Agreement Details">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted font-body">Property</label>
                <p className="text-charcoal font-body">
                  {agreement.property
                    ? `${agreement.property.address}, ${agreement.property.city}, ${agreement.property.state}`
                    : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted font-body">Landlord</label>
                <p className="text-charcoal font-body">{agreement.landlord?.name || '—'}</p>
              </div>
              <div>
                <label className="text-sm text-muted font-body">Tenant</label>
                <p className="text-charcoal font-body">{agreement.tenant?.name || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted font-body">Start Date</label>
                  <p className="text-charcoal font-body">{formatDate(agreement.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted font-body">End Date</label>
                  <p className="text-charcoal font-body">{formatDate(agreement.end_date)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted font-body">Monthly Rent</label>
                  <p className="text-charcoal font-body">{formatNaira(agreement.monthly_rent)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted font-body">Annual Rent</label>
                  <p className="text-charcoal font-body">{formatNaira(agreement.annual_rent)}</p>
                </div>
              </div>
            </div>
          </Card>

          {reviewError && (
            <div className="mt-4 p-3 bg-ember bg-opacity-10 text-ember rounded-button text-sm font-body">
              {reviewError}
            </div>
          )}

          {/* ACTIVE — existing PDF / lawyer review actions */}
          {agreement.status === 'ACTIVE' && (
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                disabled={!agreement.pdf_url}
                onClick={() => window.open(agreement.pdf_url, '_blank')}
              >
                <FileDown size={18} />
                {downloadLabel}
              </Button>
              {isGeneratingPdf && <Spinner size="sm" />}
              {agreement.pdf_url && <CheckCircle size={20} className="text-forest" />}
              {agreement.lawyer_review_status === 'NOT_REQUESTED' && (
                <Button
                  variant="primary"
                  className="flex items-center gap-2"
                  loading={requestingReview}
                  onClick={handleRequestLawyerReview}
                >
                  <CheckCircle2 size={18} />
                  Request Lawyer Review
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AgreementPage() {
  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <Suspense
          fallback={
            <div className="max-w-2xl mx-auto flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          }
        >
          <AgreementContent />
        </Suspense>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
