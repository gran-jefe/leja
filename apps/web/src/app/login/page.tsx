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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    NProgress.start();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data.data;
      persistSession(token, user);
      router.push(landingRouteFor(user));
    } catch (err: unknown) {
      NProgress.done();
      // 401 is the one case worth a bespoke message; the rest goes through the
      // shared helper instead of the hand-rolled status ladder duplicated here
      // and in signup.
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 401
          ? 'Those details don’t match an account. Check your email and password.'
          : getErrorMessage(err, 'Login failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to BeyondAgency"
      subtitle="Pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="text-brass-700 font-semibold hover:underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

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
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
