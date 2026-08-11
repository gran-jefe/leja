'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Field, FieldGroup } from '@/components/ui/Field';
import { IconTile } from '@/components/ui/IconTile';
import { CopyButton } from '@/components/ui/CopyButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { FileDown, CheckCircle2, CheckCircle, FileText, Copy, Check, Gavel, Shield } from 'lucide-react';
import { useAgreement } from '@/hooks/useAgreements';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { getStatus } from '@/lib/status';
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
  const [legalJob, setLegalJob] = useState<any>(null);
  const [insuranceJob, setInsuranceJob] = useState<any>(null);

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

  useEffect(() => {
    if (agreement?.status !== 'ACTIVE') return;

    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const [legalRes, insuranceRes] = await Promise.all([
          api.get(`/marketplace/jobs/by-agreement/${id}`, { params: { category: 'LEGAL' } }),
          api.get(`/marketplace/jobs/by-agreement/${id}`, { params: { category: 'INSURANCE' } }),
        ]);
        if (!cancelled) {
          setLegalJob(legalRes.data.data);
          setInsuranceJob(insuranceRes.data.data);
        }
      } catch {
        // Non-critical — the marketplace status is a nice-to-have on this page.
      }
    };

    fetchJobs();
    const anyOpen = legalJob?.status === 'OPEN' || insuranceJob?.status === 'OPEN';
    const interval = anyOpen ? setInterval(fetchJobs, 8000) : undefined;
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [agreement?.status, id, legalJob?.status, insuranceJob?.status]);

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

  // Derived from this agreement, not from a global role: the same person can
  // be the landlord on one agreement and the tenant on another.
  const isLandlordView = !!agreement && agreement.landlord_id === user?.id;
  const agreementStatus = getStatus('agreement', agreement?.status);
  const reviewStatus = getStatus('lawyerReview', agreement?.lawyer_review_status);

  return (
    <div className="max-w-content mx-auto">
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
            <Alert tone="success" title="Agreement created" className="mb-6">
              Your tenant will be notified to review and accept it.
            </Alert>
          )}
          {justPaid && agreement.status !== 'ACTIVE' && (
            <Alert tone="info" title="Payment received" className="mb-6">
              Confirming now — this page will update automatically.
            </Alert>
          )}

          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4 min-w-0">
              <IconTile icon={FileText} tone="navy" />
              <h1 className="font-display text-display-sm sm:text-display-md font-semibold text-navy-900 break-words min-w-0">
                {agreement.property?.address || 'Agreement'}
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge tone={agreementStatus.tone} dot>
                {agreementStatus.label}
              </Badge>
              <Badge tone={reviewStatus.tone} dot>
                Lawyer review: {reviewStatus.label}
              </Badge>
            </div>
          </div>

          {/* DRAFT — landlord view */}
          {agreement.status === 'DRAFT' && isLandlordView && (
            <Card
              className="mb-6"
              title="Waiting for your tenant"
              subtitle={`${agreement.tenant?.name ?? 'Your tenant'} (${agreement.tenant?.email ?? '—'}) has been notified.`}
            >
              <CopyButton
                label="Copy tenant invite link"
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/agreement/${id}/review`
                    : ''
                }
                className="border border-ink-200 rounded-button px-3 py-2"
              />
            </Card>
          )}

          {/* DRAFT — tenant view */}
          {agreement.status === 'DRAFT' && !isLandlordView && (
            <Card tone="dark" className="mb-6 grain-overlay">
              <h3 className="font-display text-title font-semibold text-on-dark mb-2">
                You have an agreement to review
              </h3>
              <p className="font-body text-body-sm text-on-dark-muted mb-5">
                From {agreement.landlord?.name || 'your landlord'}. Review the terms and accept
                when you&apos;re ready — it&apos;s free.
              </p>
              <Link href={`/agreement/${id}/review`}>
                <Button>Review &amp; accept</Button>
              </Link>
            </Card>
          )}

          {/* PENDING_PAYMENT */}
          {isPendingPayment && (
            <Card className="mb-6">
              <div className="flex items-center gap-4">
                <Spinner size="md" />
                <div>
                  <p className="font-body font-semibold text-ink-800">Payment in progress</p>
                  <p className="font-body text-body-sm text-ink-500">
                    This page updates automatically once your payment is confirmed.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Was ~10 <label> elements used as display text for non-inputs. */}
          <Card title="Agreement details">
            <FieldGroup columns={2}>
              <Field label="Property" className="sm:col-span-2">
                {agreement.property
                  ? `${agreement.property.address}, ${agreement.property.city}, ${agreement.property.state}`
                  : '—'}
              </Field>
              <Field label="Landlord">{agreement.landlord?.name || '—'}</Field>
              <Field label="Tenant">{agreement.tenant?.name || '—'}</Field>
              <Field label="Start date" mono>
                {formatDate(agreement.start_date)}
              </Field>
              <Field label="End date" mono>
                {formatDate(agreement.end_date)}
              </Field>
              <Field label="Monthly rent" mono>
                {formatNaira(agreement.monthly_rent)}
              </Field>
              <Field label="Annual rent" mono>
                {formatNaira(agreement.annual_rent)}
              </Field>
            </FieldGroup>
          </Card>

          {reviewError && (
            <Alert tone="error" className="mt-4">
              {reviewError}
            </Alert>
          )}

          {/* ACTIVE — in-house lawyer review assignment status */}
          {agreement.status === 'ACTIVE' && legalJob && (
            <Card className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <Gavel className="text-forest flex-shrink-0" size={20} />
                <h3 className="font-display text-base font-semibold text-navy">
                  Lawyer Review
                </h3>
              </div>
              {legalJob.status === 'OPEN' ? (
                <p className="font-body text-sm text-muted">
                  Assigning your agreement to a member of our in-house legal team — typically
                  within a few hours. This page updates automatically.
                </p>
              ) : legalJob.status === 'AWARDED' || legalJob.status === 'COMPLETED' ? (
                <p className="font-body text-sm text-charcoal">
                  Assigned to a member of our in-house legal team for review.
                </p>
              ) : (
                <p className="font-body text-sm text-muted">
                  No lawyer has been assigned yet — our team will follow up if this takes longer
                  than expected.
                </p>
              )}
            </Card>
          )}

          {/* ACTIVE — insurance bid marketplace status */}
          {agreement.status === 'ACTIVE' && insuranceJob && (
            <Card className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <Shield className="text-forest flex-shrink-0" size={20} />
                <h3 className="font-display text-base font-semibold text-navy">
                  Rent-Protection Insurance
                </h3>
              </div>
              {insuranceJob.status === 'OPEN' ? (
                <p className="font-body text-sm text-muted">
                  Posted to our licensed insurer network — bidding is open now. This page updates
                  automatically once an insurer is matched.
                </p>
              ) : insuranceJob.status === 'AWARDED' || insuranceJob.status === 'COMPLETED' ? (
                <p className="font-body text-sm text-charcoal">
                  Matched with a licensed insurer
                  {insuranceJob.winning_bid ? ` — quoted ${formatNaira(insuranceJob.winning_bid.price)}` : ''}.
                  They'll be in touch to finalize the policy.
                </p>
              ) : (
                <p className="font-body text-sm text-muted">
                  No insurer bid before the window closed — our team will follow up directly.
                </p>
              )}
            </Card>
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
