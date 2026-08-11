'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FilePlus, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { EmptyState } from '@/components/layout/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Card } from '@/components/ui/Card';
import { ChoiceCard, Checkbox } from '@/components/ui/Choice';
import { Field, FieldGroup } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProperties } from '@/hooks/useProperties';
import { useCreateAgreement } from '@/hooks/useAgreements';
import { Capability, BEYOND_PRICING } from '@beyond/shared';
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
    <>
      <div className="max-w-content mx-auto">
        <PageHeader
          icon={FilePlus}
          title="New agreement"
          subtitle="Three steps. Free to create and free for your tenant to accept."
        />

        <StepIndicator
          currentStep={step}
          totalSteps={3}
          labels={['Property', 'Tenancy', 'Review']}
        />

        {/* Step 1: Select Property */}
        {step === 1 && (
          <Card>
            <h2 className="font-display text-title font-semibold text-navy-900 mb-1.5">Select a property</h2>
            <p className="font-body text-body-sm text-ink-500 mb-6">
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
                    <Button>Add a property</Button>
                  </Link>
                }
              />
            ) : (
              <>
                {/* Was a <label> wrapping an input with className="hidden",
                    which removed it from the tab order entirely — the property
                    choice was unreachable by keyboard. ChoiceCard uses
                    sr-only + peer so the control stays focusable. */}
                <fieldset className="mb-6">
                  <legend className="sr-only">Select a property</legend>
                  <div className="space-y-3">
                    {properties.map((property) => (
                      <ChoiceCard
                        key={property.id}
                        name="propertyId"
                        value={property.id}
                        checked={formData.propertyId === property.id}
                        onChange={() => handleSelectProperty(property.id)}
                        label={property.address}
                        description={`${property.city}, ${property.state} · ${
                          PROPERTY_TYPE_LABELS[property.property_type] || property.property_type
                        }`}
                        meta={`${formatNaira(property.annual_rent)}/yr`}
                      />
                    ))}
                  </div>
                </fieldset>
                <Button
                  fullWidth
                  size="lg"
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
            <h2 className="font-display text-title font-semibold text-navy-900 mb-6">Tenancy details</h2>
            <form onSubmit={tenancyForm.handleSubmit(handleTenancyNext)} className="space-y-4">
              <Input
                label="Tenant email"
                required
                type="email"
                placeholder="tenant@example.com"
                {...tenancyForm.register('tenantEmail')}
                error={tenancyForm.formState.errors.tenantEmail?.message}
              />
              {/* Breakpointed — these were bare `grid-cols-2`, squeezing a
                  labelled date field and a ₦-prefixed amount into ~140px at
                  375px wide. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start date"
                  type="date"
                  required
                  {...tenancyForm.register('startDate')}
                  error={tenancyForm.formState.errors.startDate?.message}
                />
                <Input
                  label="End date"
                  type="date"
                  required
                  {...tenancyForm.register('endDate')}
                  error={tenancyForm.formState.errors.endDate?.message}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="annualRent"
                  control={tenancyForm.control}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Annual rent"
                      required
                      placeholder="2,400,000"
                      value={field.value}
                      onValueChange={field.onChange}
                      error={tenancyForm.formState.errors.annualRent?.message}
                    />
                  )}
                />
                <CurrencyInput
                  label="Monthly rent (calculated)"
                  value={
                    tenancyForm.watch('annualRent')
                      ? Math.round(tenancyForm.watch('annualRent') / 12)
                      : 0
                  }
                  readOnly
                />
              </div>

              <Alert tone="success" title="This agreement is free">
                No fee for you or your tenant. Providers are only paid if one of you chooses an
                optional add-on below.
              </Alert>

              <div className="border border-ink-200 rounded-button p-4">
                <Checkbox
                  checked={wantsLawyerReview}
                  onChange={(e) => setWantsLawyerReview(e.target.checked)}
                  label="Add a lawyer review to this agreement"
                  description={`Optional. Handled by our in-house legal team, not an open marketplace — one flat fee of ${formatNaira(
                    BEYOND_PRICING.LAWYER_REVIEW_ADDON
                  )}, paid by your tenant.`}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" fullWidth>
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
              <FieldGroup columns={2}>
                <Field label="Property">
                  {selectedProperty?.address}, {selectedProperty?.city}
                </Field>
                <Field label="Tenant">{formData.tenantEmail}</Field>
                <Field label="Tenancy" mono>
                  {formData.startDate} → {formData.endDate}
                </Field>
                <Field label="Lawyer review">
                  {wantsLawyerReview ? 'Requested (optional add-on)' : 'Not requested'}
                </Field>
                <Field label="Annual rent" mono>
                  {formatNaira(annualRent)}
                </Field>
                <Field label="Monthly rent" mono>
                  {formatNaira(monthlyRent)}
                </Field>
              </FieldGroup>
            </Card>

            <Card tone="dark" className="grain-overlay">
              <p className="font-mono text-label uppercase text-on-dark-muted mb-2">
                Your tenant will pay
              </p>
              <p className="font-display text-display-md font-semibold text-brass-500 mb-3">
                {tenantTotal > 0 ? formatNaira(tenantTotal) : 'Nothing — free'}
              </p>
              <p className="font-body text-body-sm text-on-dark-muted">
                {wantsLawyerReview
                  ? `Connecting and the agreement itself are free. Only the optional lawyer review is paid — a flat ${formatNaira(BEYOND_PRICING.LAWYER_REVIEW_ADDON)}, handled by our in-house legal team.`
                  : `Connecting and the agreement itself are completely free — this replaces the ${formatNaira(BEYOND_PRICING.TYPICAL_AGENT_FEE)}+ they would have paid an agent.`}
              </p>
            </Card>

            {agreementError && <Alert tone="error">{agreementError}</Alert>}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button variant="secondary" fullWidth onClick={handleBack}>
                Back
              </Button>
              <Button fullWidth loading={submitting} onClick={handleSubmit}>
                Create agreement draft
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function NewAgreementPage() {
  return (
    <ProtectedPageWrapper requiredCapability={Capability.LANDLORD} redirectTo="/properties/browse">
      <NewAgreementForm />
    </ProtectedPageWrapper>
  );
}
