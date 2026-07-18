'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { useAgreements } from '@/hooks/useAgreements';
import { UserRole } from '@leja/shared';
import { formatDate, getAgreementStatusVariant } from '@/lib/utils';

export default function AgreementsPage() {
  const { user } = useAuth();
  const { agreements, loading, error, refetch } = useAgreements();
  const isLandlord = user?.role === UserRole.LANDLORD;

  return (
    <ProtectedPageWrapper>
      <DashboardShell>
        <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Agreements"
              subtitle="Track every tenancy agreement in one place"
              icon={FileText}
              action={
                isLandlord ? (
                  <Link href="/agreement/new">
                    <Button variant="primary">New Agreement</Button>
                  </Link>
                ) : undefined
              }
            />

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <Skeleton height="1.25rem" className="mb-2" width="50%" />
                    <Skeleton height="1rem" width="30%" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : agreements.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No agreements yet"
                description={
                  isLandlord
                    ? 'Create your first rental agreement to get started'
                    : 'Your rental agreements will appear here'
                }
                action={
                  isLandlord ? (
                    <Link href="/agreement/new">
                      <Button variant="primary">New Agreement</Button>
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {agreements.map((agreement) => (
                  <Link key={agreement.id} href={`/agreement/${agreement.id}`}>
                    <Card className="hover:shadow-md hover:border-forest transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
                            <FileText className="text-navy" size={18} />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-semibold text-navy mb-1">
                              {agreement.property?.address || 'Unknown property'}
                            </h3>
                            <p className="font-body text-sm text-muted">
                              {isLandlord
                                ? agreement.tenant?.name || 'Unknown tenant'
                                : agreement.landlord?.name || 'Unknown landlord'}
                              {' · '}
                              {formatDate(agreement.start_date)} – {formatDate(agreement.end_date)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getAgreementStatusVariant(agreement.status)}>
                          {agreement.status}
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
        </div>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
