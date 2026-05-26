'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PropertyType } from '@leja/shared';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { calculateAnnualRent } from '@/lib/utils';
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

const propertyTypeLabel = {
  SELF_CONTAIN: 'Self Contain',
  ONE_BEDROOM: '1 Bedroom',
  TWO_BEDROOM: '2 Bedrooms',
  THREE_BEDROOM: '3 Bedrooms',
  DUPLEX: 'Duplex',
  BUNGALOW: 'Bungalow',
  FLAT: 'Flat',
};

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const monthlyRent = parseInt(watch('monthlyRent') || '0', 10);
  const annualRent = calculateAnnualRent(monthlyRent);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    try {
      // Placeholder: actual API call would go here
      console.log('Creating property:', data);
      router.push('/properties');
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPageWrapper requiredRole={UserRole.LANDLORD}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-navy mb-8">Add Property</h1>

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
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
