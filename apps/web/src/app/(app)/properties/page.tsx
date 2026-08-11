'use client';

import Link from 'next/link';
import { Home, Building2, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperties } from '@/hooks/useProperties';
import { Capability } from '@beyond/shared';

function PropertiesContent() {
  const { properties, loading, error, refetch } = useProperties();

  const addButton = (
    <Link href="/properties/new">
      <Button leadingIcon={<PlusCircle size={17} />}>Add property</Button>
    </Link>
  );

  return (
    <div className="max-w-wide mx-auto">
      <PageHeader
        title="My properties"
        subtitle="Manage your listings and track availability."
        icon={Building2}
        action={addButton}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties yet"
          description="Add your first property to start connecting with tenants."
          action={addButton}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property, i) => (
            <PropertyCard
              key={property.id}
              href={`/properties/${property.id}`}
              address={property.address}
              city={property.city}
              state={property.state}
              propertyType={property.property_type}
              annualRent={property.annual_rent}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              imageUrl={property.images?.[0]}
              aspect="video"
              priority={i < 3}
              status={{
                label: property.is_available ? 'Available' : 'Occupied',
                tone: property.is_available ? 'success' : 'neutral',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <ProtectedPageWrapper requiredCapability={Capability.LANDLORD}>
      <PropertiesContent />
    </ProtectedPageWrapper>
  );
}
