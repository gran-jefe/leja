'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Bed, Bath, User, ArrowLeft } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperty } from '@/hooks/useProperties';
import { UserRole, PropertyType } from '@leja/shared';
import { formatNaira } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';

const bedroomEncodedTypes = [
  PropertyType.ONE_BEDROOM,
  PropertyType.TWO_BEDROOM,
  PropertyType.THREE_BEDROOM,
];

const propertyLabel = (property: any) => {
  if (bedroomEncodedTypes.includes(property.property_type)) {
    return PROPERTY_TYPE_LABELS[property.property_type] || property.property_type;
  }
  const typeLabel = PROPERTY_TYPE_LABELS[property.property_type] || property.property_type;
  return `${property.bedrooms} Bedroom ${typeLabel}`;
};

function PropertyDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { property, loading, error, refetch } = useProperty(id);

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/properties/browse"
          className="inline-flex items-center gap-1 text-sm font-body text-muted hover:text-navy mb-6"
        >
          <ArrowLeft size={16} />
          Back to listings
        </Link>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
                  <Home className="text-navy" size={24} />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
                    {propertyLabel(property)}
                  </h1>
                  <p className="font-body text-muted">
                    {property.address}, {property.city}, {property.state}
                  </p>
                </div>
              </div>

              <Card title="Details">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted font-body">Type</label>
                    <p className="text-charcoal font-body font-semibold">
                      {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted font-body flex items-center gap-1">
                      <Bed size={14} /> Bedrooms
                    </label>
                    <p className="text-charcoal font-body font-semibold">{property.bedrooms}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted font-body flex items-center gap-1">
                      <Bath size={14} /> Bathrooms
                    </label>
                    <p className="text-charcoal font-body font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
              </Card>

              <div className="bg-navy rounded-card p-6 flex flex-col sm:flex-row gap-6 sm:gap-12">
                <div>
                  <p className="text-white text-opacity-70 text-sm font-body mb-1">Monthly Rent</p>
                  <p className="font-display text-2xl font-bold text-white">
                    {formatNaira(property.monthly_rent)}
                  </p>
                </div>
                <div>
                  <p className="text-white text-opacity-70 text-sm font-body mb-1">Annual Rent</p>
                  <p className="font-display text-2xl font-bold text-white">
                    {formatNaira(property.annual_rent)}
                  </p>
                </div>
              </div>

              {property.landlord_name && (
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                      <User className="text-navy" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-muted font-body">Listed by</p>
                      <p className="text-charcoal font-body font-semibold">
                        {property.landlord_name}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-8">
                <h3 className="font-display text-lg font-semibold text-navy mb-2">
                  Interested in this property?
                </h3>
                <p className="font-body text-sm text-muted mb-4">
                  Contact the landlord directly and ask them to send you a tenancy agreement
                  through Leja. You'll pay a ₦15,000 move-in fee once you accept it — no agent
                  fees.
                </p>
                <div className="flex flex-col gap-3">
                  {property.landlord_email && (
                    <a href={`mailto:${property.landlord_email}?subject=${encodeURIComponent(`Interested in ${property.address}`)}`}>
                      <Button variant="primary" className="w-full">
                        Contact Landlord
                      </Button>
                    </a>
                  )}
                  <div className="relative group">
                    <Button variant="secondary" className="w-full" disabled>
                      Save for later
                    </Button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block whitespace-nowrap bg-navy text-white text-xs font-body px-2 py-1 rounded">
                      Coming soon
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function BrowsePropertyDetailPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT} redirectTo="/properties">
      <PropertyDetailContent />
    </ProtectedPageWrapper>
  );
}
