'use client';

import Link from 'next/link';
import { Home, Building2, Bed, Bath } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperties } from '@/hooks/useProperties';
import { UserRole } from '@leja/shared';
import { formatNaira } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';

export default function PropertiesPage() {
  const { properties, loading, error, refetch } = useProperties();

  return (
    <ProtectedPageWrapper requiredRole={UserRole.LANDLORD}>
      <DashboardShell>
        <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Properties"
              subtitle="Manage your listings and track availability"
              icon={Building2}
              action={
                <Link href="/properties/new">
                  <Button variant="primary">Add Property</Button>
                </Link>
              }
            />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <Skeleton height="1.5rem" className="mb-3" />
                    <Skeleton height="1rem" className="mb-2" width="70%" />
                    <Skeleton height="1rem" width="50%" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : properties.length === 0 ? (
              <EmptyState
                icon={Home}
                title="No properties yet"
                description="Add your first property to get started"
                action={
                  <Link href="/properties/new">
                    <Button variant="primary">Add Property</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <Link key={property.id} href={`/properties/${property.id}`}>
                    <Card className="h-full hover:shadow-md hover:border-forest transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-display text-lg font-semibold text-navy">
                          {property.address}
                        </h3>
                        <Badge variant={property.is_available ? 'success' : 'default'}>
                          {property.is_available ? 'Available' : 'Occupied'}
                        </Badge>
                      </div>
                      <p className="font-body text-sm text-muted mb-3">
                        {property.city}, {property.state}
                      </p>
                      <div className="flex items-center gap-4 font-body text-sm text-charcoal mb-3">
                        <span>
                          {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
                        </span>
                        <span className="flex items-center gap-1 text-muted">
                          <Bed size={14} />
                          {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1 text-muted">
                          <Bath size={14} />
                          {property.bathrooms}
                        </span>
                      </div>
                      <p className="font-display text-lg font-bold text-forest">
                        {formatNaira(property.monthly_rent)}
                        <span className="text-sm font-body text-muted">/month</span>
                      </p>
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
