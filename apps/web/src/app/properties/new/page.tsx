'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCreateProperty } from '@/hooks/useProperties';
import { calculateAnnualRent } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';
import { UserRole } from '@leja/shared';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.enum(['Lagos', 'Abuja', 'Port Harcourt', 'Others']),
  propertyType: z.enum(['SELF_CONTAIN', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM', 'DUPLEX', 'BUNGALOW', 'FLAT']),
  bedrooms: z.coerce.number().min(1, 'Bedrooms must be at least 1'),
  bathrooms: z.coerce.number().min(1, 'Bathrooms must be at least 1'),
  monthlyRent: z.coerce.number().min(1, 'Monthly rent is required'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyTypeLabel = PROPERTY_TYPE_LABELS;

export default function NewPropertyPage() {
  const { createProperty, loading, error } = useCreateProperty();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const monthlyRent = watch('monthlyRent') || 0;
  const annualRent = calculateAnnualRent(monthlyRent);

  const onSubmit = async (data: PropertyFormData) => {
    await createProperty(data);
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

            <Card>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Input
                  label="Monthly Rent (₦)"
                  type="number"
                  placeholder="500000"
                  {...register('monthlyRent')}
                  error={errors.monthlyRent?.message}
                />
                <Input
                  label="Annual Rent (₦)"
                  type="number"
                  value={annualRent}
                  readOnly
                />
                <Button variant="primary" className="w-full" loading={loading}>
                  Save Property
                </Button>
              </form>
            </Card>
        </div>
      </DashboardShell>
    </ProtectedPageWrapper>
  );
}
