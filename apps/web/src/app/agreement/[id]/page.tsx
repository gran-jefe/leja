'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { FileDown, CheckCircle2 } from 'lucide-react';
import { useAgreement } from '@/hooks/useAgreements';
import api from '@/lib/api';
import {
  formatDate,
  formatNaira,
  getAgreementStatusVariant,
  getErrorMessage,
  getLawyerReviewStatusVariant,
} from '@/lib/utils';

export default function AgreementPage() {
  const params = useParams();
  const id = params.id as string;
  const { agreement, loading, error, refetch } = useAgreement(id);
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

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

  return (
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
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
                <div className="mb-6">
                  <h1 className="font-display text-3xl font-bold text-navy mb-2">
                    {agreement.property?.address || 'Agreement'}
                  </h1>
                  <div className="flex gap-2">
                    <Badge variant={getAgreementStatusVariant(agreement.status)}>
                      {agreement.status}
                    </Badge>
                    <Badge variant={getLawyerReviewStatusVariant(agreement.lawyer_review_status)}>
                      Lawyer Review: {agreement.lawyer_review_status}
                    </Badge>
                  </div>
                </div>

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

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    disabled={!agreement.pdf_url}
                    onClick={() => window.open(agreement.pdf_url, '_blank')}
                  >
                    <FileDown size={18} />
                    Download PDF
                  </Button>
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
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
