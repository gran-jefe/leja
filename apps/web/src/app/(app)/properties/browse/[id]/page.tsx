'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Bed, Bath, User, ArrowLeft, Phone, Mail, CheckCircle2, MessageCircle } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SafeImage } from '@/components/ui/SafeImage';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { useProperty } from '@/hooks/useProperties';
import { PropertyType } from '@beyond/shared';
import { cn, formatNaira, getErrorMessage } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';
import api from '@/lib/api';

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

// Nigerian phone numbers are usually stored as 0XXXXXXXXXX — WhatsApp's
// click-to-chat link needs the international format with no leading zero.
const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
};

function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-ink-100 rounded-card flex items-center justify-center text-ink-300">
        <Home size={40} aria-hidden />
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full aspect-video bg-ink-100 rounded-card overflow-hidden">
        <SafeImage src={images[active]} alt={alt} fill priority sizes="(max-width: 1024px) 100vw, 60vw" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={active === i}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-button overflow-hidden border-2 bg-ink-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500',
                active === i ? 'border-brass-500' : 'border-transparent hover:border-ink-300'
              )}
            >
              <SafeImage src={img} alt="" fill sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageLandlordForm({ propertyId, address }: { propertyId: string; address: string }) {
  const router = useRouter();
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${address}. Is it still available?`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await api.post('/messages/conversations', { propertyId, body: message.trim() });
      router.push(`/messages/${res.data.data.conversation.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message'));
      setSending(false);
    }
  };

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full px-4 py-2 font-body text-sm border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest mb-2"
      />
      {error && <p className="text-sm text-ember font-body mb-2">{error}</p>}
      <Button
        variant="primary"
        className="w-full flex items-center justify-center gap-2"
        loading={sending}
        onClick={handleSend}
      >
        <MessageCircle size={16} />
        Message Landlord
      </Button>
      <p className="text-xs text-muted font-body mt-2">
        Sent through BeyondAgency — the landlord can reply here, and you'll see it in your inbox.
      </p>
    </div>
  );
}

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
              <ImageGallery images={property.images || []} alt={property.address} />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-button bg-navy-900/5 text-navy-900 flex items-center justify-center flex-shrink-0">
                  <Home className="text-navy" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
                      {propertyLabel(property)}
                    </h1>
                    {property.requires_insurance && (
                      <Badge variant="info">Insured Tenancy</Badge>
                    )}
                  </div>
                  <p className="font-body text-muted">
                    {property.address}, {property.city}, {property.state}
                  </p>
                  {property.requires_insurance && (
                    <p className="font-body text-xs text-muted mt-1">
                      This landlord requires rent-protection insurance as a condition of
                      tenancy — underwritten by a licensed insurer, paid by the landlord.
                    </p>
                  )}
                </div>
              </div>

              {property.description && (
                <Card title="About this property">
                  <p className="font-body text-sm text-charcoal whitespace-pre-line">
                    {property.description}
                  </p>
                </Card>
              )}

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

              {property.amenities?.length > 0 && (
                <Card title="Amenities">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map((amenity: string) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 font-body text-sm text-charcoal"
                      >
                        <CheckCircle2 size={14} className="text-forest flex-shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="bg-navy rounded-card p-6 flex flex-col sm:flex-row gap-6 sm:gap-12">
                <div>
                  <p className="text-on-dark-muted text-body-sm font-body mb-1">Annual Rent</p>
                  <p className="font-display text-2xl font-bold text-white">
                    {formatNaira(property.annual_rent)}
                  </p>
                </div>
                <div>
                  <p className="text-on-dark-muted text-body-sm font-body mb-1">Monthly Rent</p>
                  <p className="font-display text-2xl font-bold text-white">
                    {formatNaira(property.monthly_rent)}
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
                  Message the landlord through BeyondAgency and ask them to send you a tenancy
                  agreement. Connecting and accepting the agreement are completely free — no
                  agent fees, no legalization fee.
                </p>

                <MessageLandlordForm propertyId={property.id} address={property.address} />

                {(property.landlord_phone || property.landlord_email) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted font-body mb-2">Prefer another way?</p>
                    <div className="flex flex-col gap-2">
                      {property.landlord_phone && (
                        <a
                          href={`https://wa.me/${toWhatsAppNumber(property.landlord_phone)}?text=${encodeURIComponent(
                            `Hi, I'm interested in ${property.address}, ${property.city} on BeyondAgency.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-2">
                            <Phone size={14} />
                            WhatsApp
                          </Button>
                        </a>
                      )}
                      {property.landlord_email && (
                        <a
                          href={`mailto:${property.landlord_email}?subject=${encodeURIComponent(`Interested in ${property.address}`)}`}
                        >
                          <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-2">
                            <Mail size={14} />
                            Email
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

// Open to any signed-in user, same reason as the browse index.
export default function BrowsePropertyDetailPage() {
  return (
    <ProtectedPageWrapper>
      <PropertyDetailContent />
    </ProtectedPageWrapper>
  );
}
