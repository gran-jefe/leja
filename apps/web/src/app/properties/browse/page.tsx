'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Home, Bed, Bath } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperties } from '@/hooks/useProperties';
import { UserRole, PropertyType } from '@leja/shared';
import { formatNaira } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';

const STATES = ['Lagos', 'Abuja', 'Port Harcourt', 'Others'];

const BEDROOM_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4+', value: '4+' },
];

interface FilterState {
  city: string;
  state: string;
  propertyTypes: PropertyType[];
  minRent: string;
  maxRent: string;
  bedrooms: string;
}

const emptyFilters: FilterState = {
  city: '',
  state: '',
  propertyTypes: [],
  minRent: '',
  maxRent: '',
  bedrooms: '',
};

const propertyLabel = (property: any) => {
  const bedroomEncodedTypes = [
    PropertyType.ONE_BEDROOM,
    PropertyType.TWO_BEDROOM,
    PropertyType.THREE_BEDROOM,
  ];
  if (bedroomEncodedTypes.includes(property.property_type)) {
    return PROPERTY_TYPE_LABELS[property.property_type] || property.property_type;
  }
  const typeLabel = PROPERTY_TYPE_LABELS[property.property_type] || property.property_type;
  return `${property.bedrooms} Bedroom ${typeLabel}`;
};

function BrowsePropertiesContent() {
  const [draft, setDraft] = useState<FilterState>(emptyFilters);
  const [applied, setApplied] = useState<FilterState>(emptyFilters);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const queryFilters = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (applied.city) params.city = applied.city;
    if (applied.state) params.state = applied.state;
    if (applied.propertyTypes.length > 0) params.property_type = applied.propertyTypes.join(',');
    if (applied.minRent) params.min_rent = applied.minRent;
    if (applied.maxRent) params.max_rent = applied.maxRent;
    if (applied.bedrooms === '4+') {
      params.min_bedrooms = 4;
    } else if (applied.bedrooms) {
      params.bedrooms = applied.bedrooms;
    }
    if (appliedSearch) params.search = appliedSearch;
    return params;
  }, [applied, appliedSearch]);

  const { properties, loading, error, refetch } = useProperties(queryFilters);

  const toggleType = (type: PropertyType) => {
    setDraft((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const applyFilters = () => {
    setApplied(draft);
    setAppliedSearch(search);
  };

  const clearFilters = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setSearch('');
    setAppliedSearch('');
  };

  const hasActiveFilters =
    applied.city ||
    applied.state ||
    applied.propertyTypes.length > 0 ||
    applied.minRent ||
    applied.maxRent ||
    applied.bedrooms ||
    appliedSearch;

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Browse Properties"
          subtitle="Find your next home from verified listings"
          icon={Home}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72 flex-shrink-0">
            <Card>
              <h3 className="font-display text-lg font-semibold text-navy mb-4">Filters</h3>

              <div className="mb-4">
                <Input
                  label="City"
                  placeholder="e.g. Ikeja"
                  value={draft.city}
                  onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                  State
                </label>
                <select
                  value={draft.state}
                  onChange={(e) => setDraft((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2 font-body border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">Any</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                  Property Type
                </label>
                <div className="space-y-2">
                  {Object.values(PropertyType).map((type) => (
                    <label key={type} className="flex items-center gap-2 font-body text-sm text-charcoal">
                      <input
                        type="checkbox"
                        checked={draft.propertyTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="rounded border-border text-forest focus:ring-forest"
                      />
                      {PROPERTY_TYPE_LABELS[type] || type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2">
                <Input
                  label="Min Rent"
                  type="number"
                  placeholder="0"
                  value={draft.minRent}
                  onChange={(e) => setDraft((prev) => ({ ...prev, minRent: e.target.value }))}
                />
                <Input
                  label="Max Rent"
                  type="number"
                  placeholder="Any"
                  value={draft.maxRent}
                  onChange={(e) => setDraft((prev) => ({ ...prev, maxRent: e.target.value }))}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                  Bedrooms
                </label>
                <div className="flex flex-wrap gap-2">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <label
                      key={opt.label}
                      className={`px-3 py-1.5 rounded-button border text-sm font-body cursor-pointer ${
                        draft.bedrooms === opt.value
                          ? 'bg-navy text-white border-navy'
                          : 'border-border text-charcoal'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bedrooms"
                        value={opt.value}
                        checked={draft.bedrooms === opt.value}
                        onChange={(e) => setDraft((prev) => ({ ...prev, bedrooms: e.target.value }))}
                        className="hidden"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="primary" onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
                <Button variant="ghost" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </Card>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search by address or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full pl-11 pr-4 py-3 font-body border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            {!loading && !error && (
              <p className="font-body text-sm text-muted mb-4">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <Skeleton height="1.25rem" className="mb-3" width="60%" />
                    <Skeleton height="1rem" className="mb-2" />
                    <Skeleton height="1rem" className="mb-4" width="50%" />
                    <Skeleton height="2rem" width="70%" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : properties.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No properties found"
                description="Try adjusting your filters or search terms to find more listings."
                action={
                  hasActiveFilters ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display text-lg font-semibold text-navy">
                        {propertyLabel(property)}
                      </h3>
                      <Badge variant="success">Available</Badge>
                    </div>
                    <p className="font-body text-sm text-charcoal mb-1">{property.address}</p>
                    <p className="font-body text-sm text-muted mb-4">
                      {property.city}, {property.state}
                    </p>

                    <div className="flex items-center gap-4 font-body text-sm text-muted mb-4">
                      <span className="flex items-center gap-1">
                        <Bed size={14} />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={14} />
                        {property.bathrooms}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="font-display text-xl font-bold text-forest">
                        {formatNaira(property.monthly_rent)}
                        <span className="text-sm font-body text-muted">/month</span>
                      </p>
                      <p className="font-body text-sm text-muted">
                        {formatNaira(property.annual_rent)}/year
                      </p>
                    </div>

                    <div className="mt-auto">
                      <Link href={`/properties/browse/${property.id}`}>
                        <Button variant="secondary" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function BrowsePropertiesPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT} redirectTo="/properties">
      <BrowsePropertiesContent />
    </ProtectedPageWrapper>
  );
}
