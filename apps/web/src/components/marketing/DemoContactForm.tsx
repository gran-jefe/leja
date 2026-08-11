'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['LANDLORD', 'TENANT', 'INVESTOR', 'OTHER']),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const roleOptions = [
  { value: 'LANDLORD', label: 'Landlord' },
  { value: 'TENANT', label: 'Tenant' },
  { value: 'INVESTOR', label: 'Investor' },
  { value: 'OTHER', label: 'Other' },
];

export function DemoContactForm() {
  const [submitted, setSubmitted] = useState<{ name: string } | null>(null);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { role: 'LANDLORD' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError('');
    try {
      await api.post('/contact', data);
      setSubmitted({ name: data.name });
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Something went wrong. Please try again.'));
    }
  };

  if (submitted) {
    return (
      <div className="bg-paper rounded-card border border-ink-200 p-8 py-16 text-center">
        <CheckCircle2 className="text-brass-600 mx-auto mb-4" size={44} aria-hidden />
        <p className="font-display text-title font-semibold text-navy-900 mb-2">
          Thanks, {submitted.name}.
        </p>
        <p className="font-body text-ink-500">We&apos;ll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="bg-paper rounded-card border border-ink-200 p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input label="Full name" required {...register('name')} error={errors.name?.message} />
        <Input
          label="Email address"
          type="email"
          required
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Phone number"
          type="tel"
          required
          autoComplete="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Select
          label="I am a"
          options={roleOptions}
          {...register('role')}
          error={errors.role?.message}
        />
        <Textarea
          label="Message or questions"
          rows={4}
          {...register('message')}
          error={errors.message?.message}
        />
        {submitError && <Alert tone="error">{submitError}</Alert>}
        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Book my demo
        </Button>
      </form>
    </div>
  );
}
