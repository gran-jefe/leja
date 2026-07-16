'use client';

import { useParams, useRouter } from 'next/navigation';
import { Building2, FilePlus, Pencil } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperty } from '@/hooks/useProperties';
import { formatNaira } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { property, loading, error, refetch } = useProperty(id);

  const handleCreateAgreement = () => {
    if (property?.address) {
      sessionStorage.setItem('leja_draft_property', property.address);
    }
    router.push('/agreement/new');
  };

  return (
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
                <Building2 className="text-navy" size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold text-navy">Property Details</h1>
            </div>

            {loading ? (
              <Card>
                <Skeleton height="1.5rem" className="mb-4" width="60%" />
                <Skeleton height="1rem" className="mb-2" />
                <Skeleton height="1rem" className="mb-2" />
                <Skeleton height="1rem" width="40%" />
              </Card>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : !property ? (
              <ErrorState message="Property not found" />
            ) : (
              <>
                <Card title="Property Information">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <label className="text-sm text-muted font-body">Address</label>
                        <p className="text-charcoal font-body font-semibold">{property.address}</p>
                      </div>
                      <Badge variant={property.is_available ? 'success' : 'default'}>
                        {property.is_available ? 'Available' : 'Occupied'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted font-body">City</label>
                        <p className="text-charcoal font-body">{property.city}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted font-body">State</label>
                        <p className="text-charcoal font-body">{property.state}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted font-body">Property Type</label>
                      <p className="text-charcoal font-body">
                        {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted font-body">Bedrooms</label>
                        <p className="text-charcoal font-body">{property.bedrooms}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted font-body">Bathrooms</label>
                        <p className="text-charcoal font-body">{property.bathrooms}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted font-body">Monthly Rent</label>
                        <p className="text-charcoal font-body font-semibold">
                          {formatNaira(property.monthly_rent)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted font-body">Annual Rent</label>
                        <p className="text-charcoal font-body font-semibold">
                          {formatNaira(property.annual_rent)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={handleCreateAgreement}
                  >
                    <FilePlus size={18} />
                    Create Agreement
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => router.push(`/properties/${id}/edit`)}
                  >
                    <Pencil size={18} />
                    Edit Property
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
