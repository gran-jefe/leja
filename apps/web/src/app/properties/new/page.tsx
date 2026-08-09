'use client';

import { useState } from 'react';
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
import { useCreateProperty } from '@/hooks/useProperties';
import { PROPERTY_TYPE_LABELS, COMMON_AMENITIES } from '@/lib/constants';
import { UserRole } from '@beyond/shared';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.enum(['Lagos', 'Abuja', 'Port Harcourt', 'Others']),
  propertyType: z.enum(['SELF_CONTAIN', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM', 'DUPLEX', 'BUNGALOW', 'FLAT']),
  bedrooms: z.coerce.number().min(1, 'Bedrooms must be at least 1'),
  bathrooms: z.coerce.number().min(1, 'Bathrooms must be at least 1'),
  // Rent is almost always quoted yearly in Nigeria — landlords enter the
  // annual figure and monthly is derived, not the other way round.
  annualRent: z.coerce.number().min(1, 'Annual rent is required'),
  description: z.string().max(2000, 'Keep it under 2000 characters').optional(),
  requiresInsurance: z.boolean().optional().default(false),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyTypeLabel = PROPERTY_TYPE_LABELS;

export default function NewPropertyPage() {
  const { createProperty, loading, error } = useCreateProperty();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [otherAmenity, setOtherAmenity] = useState('');
  const [images, setImages] = useState<string[]>(['']);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const annualRent = watch('annualRent') || 0;
  const monthlyRent = annualRent ? Math.round(annualRent / 12) : 0;

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

  const onSubmit = async (data: PropertyFormData) => {
    await createProperty({
      address: data.address,
      city: data.city,
      state: data.state,
      propertyType: data.propertyType,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      monthlyRent,
      requiresInsurance: data.requiresInsurance,
      description: data.description,
      amenities,
      images: images.map((i) => i.trim()).filter(Boolean),
    });
  };

  return (
    <ProtectedPageWrapper requiredRole={UserRole.LANDLORD}>
      <DashboardShell>
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
                <Building2 className="text-navy" size={24} />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Add Property</h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-ember bg-opacity-10 text-ember rounded-button text-sm font-body">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <h2 className="font-display text-lg font-semibold text-navy mb-4">Basics</h2>
                <div className="space-y-4">
                  <Input
                    label="Address"
                    placeholder="123 Main Street"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                  <Input
                    label="City"
                    placeholder="Lagos"
                    {...register('city')}
                    error={errors.city?.message}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                      State
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest font-body"
                      {...register('state')}
                    >
                      <option value="">Select state</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                      Property Type
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest font-body"
                      {...register('propertyType')}
                    >
                      <option value="">Select property type</option>
                      {Object.entries(propertyTypeLabel).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
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
                      placeholder="Tell tenants what makes this place worth renting — layout, neighborhood, nearby landmarks, condition, anything a listing photo can't say."
                      className="w-full px-4 py-2 font-body border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                    {errors.description?.message && (
                      <p className="text-sm text-ember mt-1 font-body">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="font-display text-lg font-semibold text-navy mb-1">Rent</h2>
                <p className="font-body text-sm text-muted mb-4">
                  Rent is usually quoted yearly in Nigeria — enter the annual figure and we'll work
                  out the monthly amount.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="annualRent"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        label="Annual Rent"
                        placeholder="2,400,000"
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.annualRent?.message}
                      />
                    )}
                  />
                  <CurrencyInput label="Monthly Rent (calculated)" value={monthlyRent} readOnly />
                </div>
              </Card>

              <Card>
                <h2 className="font-display text-lg font-semibold text-navy mb-1">Amenities</h2>
                <p className="font-body text-sm text-muted mb-4">
                  Select everything that applies — this is what tenants filter and search on.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {COMMON_AMENITIES.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 px-3 py-2 rounded-button border text-sm font-body cursor-pointer ${
                        amenities.includes(amenity)
                          ? 'border-forest bg-forest bg-opacity-5 text-forest font-semibold'
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
                <p className="font-body text-sm text-muted mb-4">
                  Paste links to photos of the property (from your phone's cloud backup, Google
                  Drive, etc.) — listings you can actually see get far more interest.
                </p>
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
                  <input
                    type="checkbox"
                    {...register('requiresInsurance')}
                    className="w-4 h-4 mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-charcoal">
                      Require rent-protection insurance for this property
                    </span>
                    <span className="block text-sm text-muted mt-1">
                      A condition of tenancy you set, not us — protects you against unpaid rent
                      and property damage. Licensed insurers bid to underwrite it; you pay the
                      premium, we take a commission. Shown to tenants as an "Insured Tenancy"
                      badge on your listing.
                    </span>
                  </span>
                </label>
              </Card>

              <Button variant="primary" className="w-full" loading={loading}>
                Save Property
              </Button>
            </form>
        </div>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
