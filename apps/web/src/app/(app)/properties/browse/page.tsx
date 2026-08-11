'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Home, SlidersHorizontal } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox, ChoiceChip } from '@/components/ui/Choice';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperties } from '@/hooks/useProperties';
import { PropertyType } from '@beyond/shared';
import { cn } from '@/lib/utils';
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

function BrowsePropertiesContent() {
  const [draft, setDraft] = useState<FilterState>(emptyFilters);
  const [applied, setApplied] = useState<FilterState>(emptyFilters);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
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
          title="Browse properties"
          subtitle="Find your next home, direct from the landlord."
          icon={Home}
        />

        {/* On small screens the filter panel was a full-width card stacked
            above the results, pushing every listing below the fold. It now
            collapses behind a toggle. */}
        <div className="lg:hidden mb-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setFiltersOpen((v) => !v)}
            leadingIcon={<SlidersHorizontal size={16} />}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
          >
            {filtersOpen ? 'Hide filters' : 'Show filters'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            id="filter-panel"
            className={cn('lg:w-72 flex-shrink-0', !filtersOpen && 'hidden lg:block')}
          >
            <Card className="lg:sticky lg:top-8">
              <h3 className="font-display text-title font-semibold text-navy-900 mb-5">Filters</h3>

              <div className="mb-4">
                <Input
                  label="City"
                  placeholder="e.g. Ikeja"
                  value={draft.city}
                  onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div className="mb-4">
                <Select
                  label="State"
                  value={draft.state}
                  onChange={(e) => setDraft((prev) => ({ ...prev, state: e.target.value }))}
                >
                  <option value="">Any</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>

              <fieldset className="mb-5">
                <legend className="font-body text-body-sm font-semibold text-ink-800 mb-2.5">
                  Property type
                </legend>
                <div className="space-y-2.5">
                  {Object.values(PropertyType).map((type) => (
                    <Checkbox
                      key={type}
                      checked={draft.propertyTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      label={PROPERTY_TYPE_LABELS[type] || type}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <Input
                  label="Min rent"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={draft.minRent}
                  onChange={(e) => setDraft((prev) => ({ ...prev, minRent: e.target.value }))}
                />
                <Input
                  label="Max rent"
                  type="number"
                  inputMode="numeric"
                  placeholder="Any"
                  value={draft.maxRent}
                  onChange={(e) => setDraft((prev) => ({ ...prev, maxRent: e.target.value }))}
                />
              </div>

              {/* Was radio inputs behind `className="hidden"`, so these pills
                  could not be reached or toggled by keyboard. */}
              <fieldset className="mb-6">
                <legend className="font-body text-body-sm font-semibold text-ink-800 mb-2.5">
                  Bedrooms
                </legend>
                <div className="flex flex-wrap gap-2">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <ChoiceChip
                      key={opt.label}
                      name="bedrooms"
                      value={opt.value}
                      checked={draft.bedrooms === opt.value}
                      onChange={(e) => setDraft((prev) => ({ ...prev, bedrooms: e.target.value }))}
                      label={opt.label}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <Button onClick={applyFilters} fullWidth>
                  Apply filters
                </Button>
                <Button variant="ghost" onClick={clearFilters} fullWidth>
                  Clear filters
                </Button>
              </div>
            </Card>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <Input
                label="Search listings"
                hideLabel
                type="search"
                placeholder="Search by address or area…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                leadingIcon={<Search size={17} />}
              />
            </div>

            {!loading && !error && (
              <p className="font-mono text-label uppercase text-ink-400 mb-4" aria-live="polite">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} lines={3} />
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
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property, i) => (
                  <PropertyCard
                    key={property.id}
                    href={`/properties/browse/${property.id}`}
                    address={property.address}
                    city={property.city}
                    state={property.state}
                    propertyType={property.property_type}
                    annualRent={property.annual_rent}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    imageUrl={property.images?.[0]}
                    priority={i < 3}
                    status={
                      property.requires_insurance
                        ? { label: 'Insured tenancy', tone: 'info' }
                        : { label: 'Available', tone: 'success' }
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

// Open to any signed-in user — browsing listings is how someone with no
// capabilities yet finds a home and becomes a tenant.
export default function BrowsePropertiesPage() {
  return (
    <ProtectedPageWrapper>
      <BrowsePropertiesContent />
    </ProtectedPageWrapper>
  );
}
