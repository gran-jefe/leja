'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PropertyType } from '@leja/shared';
import { Sidebar } from '@/components/layout/Sidebar';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatNaira, calculateAnnualRent } from '@/lib/utils';

const propertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.enum(['Lagos', 'Abuja', 'Port Harcourt', 'Others']),
  propertyType: z.enum(['SELF_CONTAIN', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM', 'DUPLEX', 'BUNGALOW', 'FLAT']),
  bedrooms: z.coerce.number().min(1, 'Bedrooms must be at least 1'),
  bathrooms: z.coerce.number().min(1, 'Bathrooms must be at least 1'),
});

const tenancySchema = z.object({
  tenantEmail: z.string().email('Invalid email'),
  tenantName: z.string().min(1, 'Tenant name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  monthlyRent: z.coerce.number().min(1, 'Monthly rent is required'),
});

type PropertyFormData = z.infer<typeof propertySchema>;
type TenancyFormData = z.infer<typeof tenancySchema>;

interface FormState extends PropertyFormData, TenancyFormData {
  withLawyerReview: boolean;
}

export default function NewAgreementPage() {
  const [step, setStep] = useState(1);
  const [withLawyerReview, setWithLawyerReview] = useState(false);
  const [formData, setFormData] = useState<Partial<FormState>>({});

  const propertyForm = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: formData,
  });

  const tenancyForm = useForm<TenancyFormData>({
    resolver: zodResolver(tenancySchema),
    defaultValues: formData,
  });

  const monthlyRent = formData.monthlyRent || 0;
  const annualRent = calculateAnnualRent(monthlyRent);
  const basePrice = 3500;
  const totalPrice = withLawyerReview ? 12000 : basePrice;

  const handlePropertyNext = async (data: PropertyFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleTenancyNext = async (data: TenancyFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const propertyTypeLabel = {
    SELF_CONTAIN: 'Self Contain',
    ONE_BEDROOM: '1 Bedroom',
    TWO_BEDROOM: '2 Bedrooms',
    THREE_BEDROOM: '3 Bedrooms',
    DUPLEX: 'Duplex',
    BUNGALOW: 'Bungalow',
    FLAT: 'Flat',
  };

  return (
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-navy mb-8">New Agreement</h1>

            <StepIndicator
              currentStep={step}
              totalSteps={3}
              labels={['Property', 'Tenancy', 'Review']}
            />

            {/* Step 1: Property Details */}
            {step === 1 && (
              <Card>
                <h2 className="font-display text-2xl font-bold text-navy mb-6">Property Details</h2>
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
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                      State
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest font-body"
                      {...propertyForm.register('state')}
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
                      {...propertyForm.register('propertyType')}
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
                  <Input
                    label="Tenant Name"
                    placeholder="Chioma Adeyemi"
                    {...tenancyForm.register('tenantName')}
                    error={tenancyForm.formState.errors.tenantName?.message}
                  />
                  <Input
                    label="Tenant Email"
                    type="email"
                    placeholder="tenant@example.com"
                    {...tenancyForm.register('tenantEmail')}
                    error={tenancyForm.formState.errors.tenantEmail?.message}
                  />
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
                    <Button variant="secondary" className="flex-1" onClick={handleBack}>
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
              <div className="space-y-6">
                <Card title="Summary">
                  <div className="space-y-3 text-sm font-body">
                    <p><span className="font-semibold">Property:</span> {formData.address}, {formData.city}</p>
                    <p><span className="font-semibold">Type:</span> {propertyTypeLabel[formData.propertyType as keyof typeof propertyTypeLabel]}</p>
                    <p><span className="font-semibold">Tenant:</span> {formData.tenantName} ({formData.tenantEmail})</p>
                    <p><span className="font-semibold">Tenancy:</span> {formData.startDate} to {formData.endDate}</p>
                    <p><span className="font-semibold">Monthly Rent:</span> {formatNaira(monthlyRent)}</p>
                    <p><span className="font-semibold">Annual Rent:</span> {formatNaira(annualRent)}</p>
                  </div>
                </Card>

                <Card>
                  <label className="flex items-center gap-3 cursor-pointer font-body">
                    <input
                      type="checkbox"
                      checked={withLawyerReview}
                      onChange={(e) => setWithLawyerReview(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Request lawyer review (+{formatNaira(8500)})</span>
                  </label>
                </Card>

                <Card className="bg-forest bg-opacity-10">
                  <p className="font-body text-sm text-charcoal mb-2">
                    <span className="font-semibold">Total Price:</span>
                  </p>
                  <p className="font-display text-2xl font-bold text-forest">{formatNaira(totalPrice)}</p>
                </Card>

                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled
                    title="Paystack integration coming soon"
                  >
                    Pay with Paystack (Coming soon)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
