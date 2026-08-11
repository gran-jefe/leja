'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import NProgress from 'nprogress';
import api from '@/lib/api';
import { AuthLayout } from '@/components/marketing/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ChoiceCard } from '@/components/ui/Choice';
import { getErrorMessage } from '@/lib/utils';
import { landingRouteFor, persistSession } from '@/lib/session';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  password: z.string().min(8, 'Use at least 8 characters'),
  role: z.enum(['LANDLORD', 'TENANT']),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'TENANT' },
  });

  const onSubmit = async (data: SignupFormData) => {
    NProgress.start();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data.data;
      persistSession(token, user);
      router.push(landingRouteFor(user));
    } catch (err) {
      NProgress.done();
      setError(getErrorMessage(err, 'We couldn’t create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started — free"
      title="Create your account"
      subtitle="No agent, no fee on the deal itself."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-brass-700 font-semibold hover:underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        {/* Role is the most consequential choice on this page; it was two bare
            radios. ChoiceCard also keeps the input in the tab order. */}
        <fieldset>
          <legend className="font-body text-body-sm font-semibold text-ink-800 mb-2">
            I am a
            <span className="text-danger-600 ml-0.5" aria-hidden>
              *
            </span>
          </legend>
          <div className="grid sm:grid-cols-2 gap-3">
            <ChoiceCard
              value="TENANT"
              label="Tenant"
              description="Looking for a home"
              {...register('role')}
            />
            <ChoiceCard
              value="LANDLORD"
              label="Landlord"
              description="Listing a property"
              {...register('role')}
            />
          </div>
          {errors.role?.message && (
            <p className="mt-1.5 font-body text-body-sm text-danger-600">{errors.role.message}</p>
          )}
        </fieldset>

        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Chioma Ezeh"
          required
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="+234 801 234 5678"
          required
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          helperText="At least 8 characters."
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>

        <p className="font-body text-body-sm text-ink-400 text-center">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-brass-700 hover:underline underline-offset-4">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-brass-700 hover:underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
