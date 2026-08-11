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
import { getErrorMessage } from '@/lib/utils';
import { landingRouteFor, persistSession } from '@/lib/session';

// No role is chosen here. Capabilities are earned by action — listing a
// property makes you a landlord, accepting an agreement makes you a tenant,
// and one account can be both.
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  password: z.string().min(8, 'Use at least 8 characters'),
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
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

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
      subtitle="One account. Rent a home, list a property, or both."
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
