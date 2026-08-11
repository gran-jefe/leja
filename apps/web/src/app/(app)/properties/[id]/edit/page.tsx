'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, X, ImagePlus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProperty, useUpdateProperty } from '@/hooks/useProperties';
import { COMMON_AMENITIES } from '@/lib/constants';
import { Capability } from '@beyond/shared';

const editSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.enum(['Lagos', 'Abuja', 'Port Harcourt', 'Others']),
  bedrooms: z.coerce.number().min(1, 'Bedrooms must be at least 1'),
  bathrooms: z.coerce.number().min(1, 'Bathrooms must be at least 1'),
  annualRent: z.coerce.number().min(1, 'Annual rent is required'),
  description: z.string().max(2000, 'Keep it under 2000 characters').optional(),
  requiresInsurance: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
});

type EditFormData = z.infer<typeof editSchema>;

function EditPropertyForm() {
  const params = useParams();
  const id = params.id as string;
  const { property, loading: propertyLoading, error: propertyError, refetch } = useProperty(id);
  const { updateProperty, loading: saving, error: saveError } = useUpdateProperty(id);

  const [amenities, setAmenities] = useState<string[]>([]);
  const [otherAmenity, setOtherAmenity] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [initialized, setInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  const watchedAnnualRent = watch('annualRent') || 0;

  useEffect(() => {
    if (property && !initialized) {
      reset({
        address: property.address,
        city: property.city,
        state: property.state,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        annualRent: property.annual_rent,
        description: property.description || '',
        requiresInsurance: !!property.requires_insurance,
        isAvailable: property.is_available !== false,
      });
      setAmenities(property.amenities || []);
      setImages(property.images?.length ? property.images : ['']);
      setInitialized(true);
    }
  }, [property, initialized, reset]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addOtherAmenity = () => {
    const trimmed = otherAmenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed]);
    }
    setOtherAmenity('');
  };

  const updateImageUrl = (index: number, url: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? url : img)));
  };

  const addImageField = () => setImages((prev) => [...prev, '']);
  const removeImageField = (index: number) =>
    setImages((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const onSubmit = async (data: EditFormData) => {
    const monthlyRent = Math.round(data.annualRent / 12);
    await updateProperty({
      address: data.address,
      city: data.city,
      state: data.state,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      monthlyRent,
      annualRent: data.annualRent,
      requiresInsurance: data.requiresInsurance,
      isAvailable: data.isAvailable,
      description: data.description,
      amenities,
      images: images.map((i) => i.trim()).filter(Boolean),
    });
  };

  if (propertyLoading) {
    return (
      <Card>
        <Skeleton height="1.5rem" className="mb-4" width="60%" />
        <Skeleton height="1rem" className="mb-2" />
        <Skeleton height="1rem" className="mb-2" />
        <Skeleton height="1rem" width="40%" />
      </Card>
    );
  }

  if (propertyError || !property) {
    return <ErrorState message={propertyError || 'Property not found'} onRetry={refetch} />;
  }

  return (
    <>
      {saveError && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-100 text-danger-700 rounded-button text-body-sm font-body">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h2 className="font-display text-lg font-semibold text-navy mb-4">Basics</h2>
          <div className="space-y-4">
            <Input label="Address" {...register('address')} error={errors.address?.message} />
            <Input label="City" {...register('city')} error={errors.city?.message} />
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                State
              </label>
              <select
                className="w-full px-4 py-2 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest font-body"
                {...register('state')}
              >
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bedrooms"
                type="number"
                min="1"
                {...register('bedrooms')}
                error={errors.bedrooms?.message}
              />
              <Input
                label="Bathrooms"
                type="number"
                min="1"
                {...register('bathrooms')}
                error={errors.bathrooms?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 font-body border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
              />
              {errors.description?.message && (
                <p className="text-sm text-ember mt-1 font-body">{errors.description.message}</p>
              )}
            </div>
            <label className="flex items-center gap-3 cursor-pointer font-body">
              <input type="checkbox" {...register('isAvailable')} className="w-4 h-4" />
              <span className="text-sm text-charcoal">
                Available for new tenants (uncheck once occupied)
              </span>
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-navy mb-1">Rent</h2>
          <p className="font-body text-sm text-muted mb-4">
            Rent is usually quoted yearly in Nigeria — enter the annual figure and we'll work out
            the monthly amount.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="annualRent"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Annual Rent"
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.annualRent?.message}
                />
              )}
            />
            <CurrencyInput
              label="Monthly Rent (calculated)"
              value={watchedAnnualRent ? Math.round(watchedAnnualRent / 12) : 0}
              readOnly
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-navy mb-1">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {COMMON_AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className={`flex items-center gap-2 px-3 py-2 rounded-button border text-sm font-body cursor-pointer ${
                  amenities.includes(amenity)
                    ? 'border-brass-500 bg-brass-50 text-brass-700 font-semibold'
                    : 'border-border text-charcoal'
                }`}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4"
                />
                {amenity}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Other amenity..."
              value={otherAmenity}
              onChange={(e) => setOtherAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOtherAmenity();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addOtherAmenity}>
              Add
            </Button>
          </div>
          {amenities.filter((a) => !COMMON_AMENITIES.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {amenities
                .filter((a) => !COMMON_AMENITIES.includes(a))
                .map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 px-3 py-1 rounded-button bg-cream text-sm font-body text-charcoal"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className="text-muted hover:text-ember"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-navy mb-1 flex items-center gap-2">
            <ImagePlus size={18} className="text-forest" />
            Photos
          </h2>
          <div className="space-y-2">
            {images.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => updateImageUrl(i, e.target.value)}
                />
                {images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeImageField(i)}
                    className="flex-shrink-0"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 flex items-center gap-1 text-forest"
            onClick={addImageField}
          >
            <Plus size={16} />
            Add another photo
          </Button>
        </Card>

        <Card>
          <label className="flex items-start gap-3 cursor-pointer font-body">
            <input type="checkbox" {...register('requiresInsurance')} className="w-4 h-4 mt-1" />
            <span>
              <span className="block font-semibold text-charcoal">
                Require rent-protection insurance for this property
              </span>
              <span className="block text-sm text-muted mt-1">
                A condition of tenancy you set — landlord pays the premium, licensed insurers bid
                to underwrite it. Shown to tenants as an "Insured Tenancy" badge.
              </span>
            </span>
          </label>
        </Card>

        <Button variant="primary" className="w-full" loading={saving}>
          Save Changes
        </Button>
      </form>
    </>
  );
}

export default function EditPropertyPage() {
  return (
    <ProtectedPageWrapper requiredCapability={Capability.LANDLORD}>
      <DashboardShell>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-button bg-navy-900/5 text-navy-900 flex items-center justify-center flex-shrink-0">
              <Building2 className="text-navy" size={24} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Edit Property</h1>
          </div>
          <EditPropertyForm />
        </div>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
