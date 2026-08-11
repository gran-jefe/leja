import React from 'react';
import Link from 'next/link';
import { Bath, Bed, Building2 } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { Badge } from './Badge';
import { SafeImage } from './SafeImage';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';

/**
 * One property card. Two divergent copies existed: properties/page.tsx (16:9,
 * landlord view) and properties/browse/page.tsx (4:3, tenant view), which had
 * drifted apart in markup, hover treatment and metadata.
 */
export interface PropertyCardProps {
  href: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  annualRent: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl?: string | null;
  /** Overlay badge, e.g. "Listed" / "Draft". */
  status?: { label: string; tone: React.ComponentProps<typeof Badge>['tone'] };
  aspect?: 'video' | 'photo';
  priority?: boolean;
  className?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  href,
  address,
  city,
  state,
  propertyType,
  annualRent,
  bedrooms,
  bathrooms,
  imageUrl,
  status,
  aspect = 'photo',
  priority,
  className,
}) => (
  <Link
    href={href}
    className={cn(
      'group flex flex-col bg-white border border-ink-200 rounded-card overflow-hidden',
      'transition-all duration-base ease-standard hover:shadow-md hover:-translate-y-0.5',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
      className
    )}
  >
    <div
      className={cn(
        'relative bg-ink-100 overflow-hidden',
        aspect === 'video' ? 'aspect-video' : 'aspect-[4/3]'
      )}
    >
      <SafeImage
        src={imageUrl}
        alt={address}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="transition-transform duration-slow ease-standard group-hover:scale-[1.03]"
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="text-ink-300" size={36} aria-hidden />
          </div>
        }
      />
      {status && (
        <span className="absolute top-3 left-3">
          <Badge tone={status.tone} appearance="solid" size="sm">
            {status.label}
          </Badge>
        </span>
      )}
    </div>

    <div className="flex flex-col flex-1 p-5">
      <p className="font-mono text-label uppercase text-ink-400 mb-1.5">
        {PROPERTY_TYPE_LABELS[propertyType] || propertyType}
      </p>
      <h3 className="font-display text-title font-semibold text-navy-900 mb-1 line-clamp-1">
        {address}
      </h3>
      <p className="font-body text-body-sm text-ink-500 mb-4">
        {city}, {state}
      </p>

      <div className="mt-auto flex items-end justify-between gap-3">
        <p className="font-mono tabular-nums text-body-lg font-medium text-navy-900">
          {formatNaira(annualRent)}
          <span className="font-body text-body-sm text-ink-400 font-normal">/yr</span>
        </p>
        {(bedrooms != null || bathrooms != null) && (
          <div className="flex items-center gap-3 font-body text-body-sm text-ink-500">
            {bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed size={15} aria-hidden />
                {bedrooms}
                <span className="sr-only">bedrooms</span>
              </span>
            )}
            {bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath size={15} aria-hidden />
                {bathrooms}
                <span className="sr-only">bathrooms</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </Link>
);
