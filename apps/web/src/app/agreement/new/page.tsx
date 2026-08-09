'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FilePlus, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProperties } from '@/hooks/useProperties';
import { useCreateAgreement } from '@/hooks/useAgreements';
import { UserRole, BEYOND_PRICING } from '@beyond/shared';
import { formatNaira } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/lib/constants';

// Rent is quoted yearly in Nigeria — the landlord enters the annual figure
// here and monthly is derived (annual / 12), not the other way round.
const tenancySchema = z.object({
  tenantEmail: z.string().email('Invalid email'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  annualRent: z.coerce.number().min(1, 'Annual rent is required'),
});

type TenancyFormData = z.infer<typeof tenancySchema>;

interface FormState extends TenancyFormData {
  propertyId: string;
  wantsLawyerReview: boolean;
}

function NewAgreementForm() {
  const router = useRouter();
  const { properties, loading: propertiesLoading } = useProperties();
  const { createAgreement, loading: submitting, error: agreementError } = useCreateAgreement();
  const [step, setStep] = useState(1);
  const [wantsLawyerReview, setWantsLawyerReview] = useState(false);
  const [formData, setFormData] = useState<Partial<FormState>>({});

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);

  const tenancyForm = useForm<TenancyFormData>({
    resolver: zodResolver(tenancySchema),
    defaultValues: formData,
  });

  useEffect(() => {
    if (selectedProperty) {
      tenancyForm.setValue('annualRent', selectedProperty.annual_rent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id]);

  const handleSelectProperty = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, propertyId }));
  };

  const handlePropertyNext = () => {
    if (!formData.propertyId) return;
    setStep(2);
  };

  const handleTenancyNext = async (data: TenancyFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const annualRent = formData.annualRent || 0;
  const monthlyRent = annualRent ? Math.round(annualRent / 12) : 0;
  const tenantTotal = wantsLawyerReview ? BEYOND_PRICING.LAWYER_REVIEW_ADDON : 0;

  const handleSubmit = async () => {
    const result = await createAgreement({
      propertyId: formData.propertyId,
      tenantEmail: formData.tenantEmail,
      startDate: formData.startDate,
      endDate: formData.endDate,
      monthlyRent,
      annualRent,
      wantsLawyerReview,
    });

    const agreement = result?.agreement;
    if (agreement) {
      router.push(`/agreement/${agreement.id}?created=1`);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-button bg-navy bg-opacity-5 flex items-center justify-center flex-shrink-0">
            <FilePlus className="text-navy" size={24} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">New Agreement</h1>
        </div>

        <StepIndicator
          currentStep={step}
          totalSteps={3}
          labels={['Property', 'Tenancy', 'Review']}
        />

        {/* Step 1: Select Property */}
        {step === 1 && (
          <Card>
            <h2 className="font-display text-2xl font-bold text-navy mb-2">Select Property</h2>
            <p className="font-body text-sm text-muted mb-6">
              Choose which of your properties this agreement is for.
            </p>

            {propertiesLoading ? (
              <div className="space-y-3">
                <Skeleton height="4rem" />
                <Skeleton height="4rem" />
              </div>
            ) : properties.length === 0 ? (
              <EmptyState
                icon={Home}
                title="No properties yet"
                description="Add a property before creating an agreement."
                action={
                  <Link href="/properties/new">
                    <Button variant="primary">Add Property</Button>
                  </Link>
                }
              />
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {properties.map((property) => (
                    <label
                      key={property.id}
                      className={`block p-4 rounded-button border cursor-pointer transition-colors ${
                        formData.propertyId === property.id
                          ? 'border-forest bg-forest bg-opacity-5'
                          : 'border-border hover:border-forest'
                      }`}
                    >
                      <input
                        type="radio"
                        name="propertyId"
                        value={property.id}
                        checked={formData.propertyId === property.id}
                        onChange={() => handleSelectProperty(property.id)}
                        className="hidden"
                      />
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-body font-semibold text-charcoal truncate">
                            {property.address}
                          </p>
                          <p className="font-body text-sm text-muted">
                            {property.city}, {property.state} ·{' '}
                            {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
                          </p>
                        </div>
                        <p className="font-display text-sm font-bold text-forest whitespace-nowrap">
                          {formatNaira(property.annual_rent)}/yr
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!formData.propertyId}
                  onClick={handlePropertyNext}
                >
                  Next
                </Button>
              </>
            )}
          </Card>
        )}

        {/* Step 2: Tenancy Details */}
        {step === 2 && (
          <Card>
            <h2 className="font-display text-2xl font-bold text-navy mb-6">Tenancy Details</h2>
            <form onSubmit={tenancyForm.handleSubmit(handleTenancyNext)} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="annualRent"
                  control={tenancyForm.control}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Annual Rent"
                      placeholder="2,400,000"
                      value={field.value}
                      onValueChange={field.onChange}
                      error={tenancyForm.formState.errors.annualRent?.message}
                    />
                  )}
                />
                <CurrencyInput
                  label="Monthly Rent (calculated)"
                  value={
                    tenancyForm.watch('annualRent')
                      ? Math.round(tenancyForm.watch('annualRent') / 12)
                      : 0
                  }
                  readOnly
                />
              </div>

              <div className="border border-border rounded-button p-4 bg-forest bg-opacity-5">
                <p className="font-body text-sm text-charcoal">
                  <span className="font-semibold text-forest">Connecting and this agreement are free</span>
                  {' '}— no fee for you or your tenant. Vetted providers only get paid if you or
                  your tenant choose an optional add-on below.
                </p>
              </div>

              <div className="border border-border rounded-button p-4">
                <label className="flex items-start gap-3 cursor-pointer font-body">
                  <input
                    type="checkbox"
                    checked={wantsLawyerReview}
                    onChange={(e) => setWantsLawyerReview(e.target.checked)}
                    className="w-4 h-4 mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-charcoal">
                      Would you like lawyer review for this agreement?
                    </span>
                    <span className="block text-sm text-muted mt-1">
                      Optional. Reviewed by our in-house legal team, not an open marketplace —
                      one flat fee of {formatNaira(BEYOND_PRICING.LAWYER_REVIEW_ADDON)}, paid by
                      your tenant.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="primary" className="flex-1">
                  Review
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 3: Review & Submit (no payment — landlord pays nothing) */}
        {step === 3 && (
          <div className="space-y-6">
            <Card title="Summary">
              <div className="space-y-3 text-sm font-body">
                <p>
                  <span className="font-semibold">Property:</span> {selectedProperty?.address},{' '}
                  {selectedProperty?.city}
                </p>
                <p>
                  <span className="font-semibold">Tenant:</span> {formData.tenantEmail}
                </p>
                <p>
                  <span className="font-semibold">Tenancy:</span> {formData.startDate} to{' '}
                  {formData.endDate}
                </p>
                <p>
                  <span className="font-semibold">Annual Rent:</span> {formatNaira(annualRent)}
                </p>
                <p>
                  <span className="font-semibold">Monthly Rent:</span> {formatNaira(monthlyRent)}
                </p>
                <p>
                  <span className="font-semibold">Lawyer Review:</span>{' '}
                  {wantsLawyerReview ? 'Requested (optional add-on)' : 'Not requested'}
                </p>
              </div>
            </Card>

            <Card className="bg-navy">
              <p className="font-body text-sm text-white text-opacity-70 mb-2">
                Your tenant will pay
              </p>
              <p className="font-display text-3xl font-bold text-ember mb-2">
                {tenantTotal > 0 ? formatNaira(tenantTotal) : 'Nothing — free'}
              </p>
              <p className="font-body text-sm text-white text-opacity-70">
                {wantsLawyerReview
                  ? `Connecting and the agreement itself are free. Only the optional lawyer review is paid — a flat ${formatNaira(BEYOND_PRICING.LAWYER_REVIEW_ADDON)}, handled by our in-house legal team.`
                  : `Connecting and the agreement itself are completely free — this replaces the ${formatNaira(BEYOND_PRICING.TYPICAL_AGENT_FEE)}+ they would have paid an agent.`}
              </p>
            </Card>

            {agreementError && (
              <Card className="bg-ember bg-opacity-10 border border-ember">
                <p className="font-body text-sm text-ember">{agreementError}</p>
              </Card>
            )}

            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={submitting}
                onClick={handleSubmit}
              >
                Create Agreement Draft
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function NewAgreementPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.LANDLORD} redirectTo="/properties/browse">
      <NewAgreementForm />
    </ProtectedPageWrapper>
  );
}
