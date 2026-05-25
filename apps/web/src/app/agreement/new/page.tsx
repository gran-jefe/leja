'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatNaira, calculateAnnualRent } from '@/lib/utils';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  bedrooms: z.coerce.number().min(1),
  bathrooms: z.coerce.number().min(1),
});

const tenancySchema = z.object({
  landlordName: z.string().min(1, 'Landlord name is required'),
  landlordEmail: z.string().email('Invalid email'),
  tenantName: z.string().min(1, 'Tenant name is required'),
  tenantEmail: z.string().email('Invalid email'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  monthlyRent: z.coerce.number().min(1, 'Monthly rent is required'),
});

type PropertyFormData = z.infer<typeof propertySchema>;
type TenancyFormData = z.infer<typeof tenancySchema>;

export default function NewAgreementPage() {
  const [step, setStep] = useState(1);
  const [withLawyerReview, setWithLawyerReview] = useState(false);

  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const tenancyForm = useForm<TenancyFormData>({
    resolver: zodResolver(tenancySchema),
  });

  const monthlyRent = tenancyForm.watch('monthlyRent') || 0;
  const annualRent = calculateAnnualRent(monthlyRent);
  const basePrice = 3500;
  const totalPrice = withLawyerReview ? 12000 : basePrice;

  const handlePropertyNext = (data: PropertyFormData) => {
    setStep(2);
  };

  const handleTenancyNext = (data: TenancyFormData) => {
    setStep(3);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-navy mb-2">New Agreement</h1>
          <p className="text-muted mb-8 font-body">Step {step} of 3</p>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? 'bg-forest' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Property Details */}
          {step === 1 && (
            <Card>
              <h2 className="font-display text-2xl font-bold text-navy mb-6">
                Property Details
              </h2>
              <form onSubmit={propertyForm.handleSubmit(handlePropertyNext)} className="space-y-4">
                <Input
                  label="Address"
                  placeholder="123 Main Street"
                  {...propertyForm.register('address')}
                  error={propertyForm.formState.errors.address?.message}
                />
                <Input
                  label="City"
                  placeholder="Lagos"
                  {...propertyForm.register('city')}
                  error={propertyForm.formState.errors.city?.message}
                />
                <Input
                  label="State"
                  placeholder="Lagos"
                  {...propertyForm.register('state')}
                  error={propertyForm.formState.errors.state?.message}
                />
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                    Property Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest font-body"
                    {...propertyForm.register('propertyType')}
                  >
                    <option value="">Select property type</option>
                    <option value="SELF_CONTAIN">Self Contain</option>
                    <option value="ONE_BEDROOM">1 Bedroom</option>
                    <option value="TWO_BEDROOM">2 Bedrooms</option>
                    <option value="THREE_BEDROOM">3 Bedrooms</option>
                    <option value="DUPLEX">Duplex</option>
                    <option value="BUNGALOW">Bungalow</option>
                    <option value="FLAT">Flat</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Bedrooms"
                    type="number"
                    min="1"
                    {...propertyForm.register('bedrooms')}
                    error={propertyForm.formState.errors.bedrooms?.message}
                  />
                  <Input
                    label="Bathrooms"
                    type="number"
                    min="1"
                    {...propertyForm.register('bathrooms')}
                    error={propertyForm.formState.errors.bathrooms?.message}
                  />
                </div>
                <Button variant="primary" className="w-full">
                  Next
                </Button>
              </form>
            </Card>
          )}

          {/* Step 2: Tenancy Details */}
          {step === 2 && (
            <Card>
              <h2 className="font-display text-2xl font-bold text-navy mb-6">Tenancy Details</h2>
              <form onSubmit={tenancyForm.handleSubmit(handleTenancyNext)} className="space-y-4">
                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="font-body font-semibold text-charcoal mb-3">Landlord</h3>
                  <Input
                    label="Name"
                    placeholder="Landlord Name"
                    {...tenancyForm.register('landlordName')}
                    error={tenancyForm.formState.errors.landlordName?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="landlord@example.com"
                    {...tenancyForm.register('landlordEmail')}
                    error={tenancyForm.formState.errors.landlordEmail?.message}
                  />
                </div>

                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="font-body font-semibold text-charcoal mb-3">Tenant</h3>
                  <Input
                    label="Name"
                    placeholder="Tenant Name"
                    {...tenancyForm.register('tenantName')}
                    error={tenancyForm.formState.errors.tenantName?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="tenant@example.com"
                    {...tenancyForm.register('tenantEmail')}
                    error={tenancyForm.formState.errors.tenantEmail?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    {...tenancyForm.register('startDate')}
                    error={tenancyForm.formState.errors.startDate?.message}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    {...tenancyForm.register('endDate')}
                    error={tenancyForm.formState.errors.endDate?.message}
                  />
                </div>

                <Input
                  label="Monthly Rent (₦)"
                  type="number"
                  placeholder="500000"
                  {...tenancyForm.register('monthlyRent')}
                  error={tenancyForm.formState.errors.monthlyRent?.message}
                />

                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="primary" className="flex-1">
                    Review
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Step 3: Review & Pay */}
          {step === 3 && (
            <Card>
              <h2 className="font-display text-2xl font-bold text-navy mb-6">Review & Pay</h2>

              <div className="space-y-4 mb-6">
                <div className="bg-cream p-4 rounded-button">
                  <h3 className="font-body font-semibold text-charcoal mb-2">Summary</h3>
                  <div className="text-sm text-muted space-y-1 font-body">
                    <p>
                      <span className="font-semibold">Monthly Rent:</span> {formatNaira(monthlyRent)}
                    </p>
                    <p>
                      <span className="font-semibold">Annual Rent:</span> {formatNaira(annualRent)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-body cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withLawyerReview}
                      onChange={(e) => setWithLawyerReview(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Request lawyer review (+₦{formatNaira(8500)})</span>
                  </label>
                </div>
              </div>

              <div className="bg-forest bg-opacity-10 p-4 rounded-button mb-6">
                <p className="font-body text-sm text-charcoal mb-2">
                  <span className="font-semibold">Total Price:</span>
                </p>
                <p className="font-display text-2xl font-bold text-forest">
                  {formatNaira(totalPrice)}
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="primary" className="flex-1">
                  Pay with Paystack
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
