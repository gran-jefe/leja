'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    NProgress.start();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data.data;
      Cookies.set('leja_token', token, { expires: 7 });
      localStorage.setItem('leja_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      NProgress.done();
      if (!err.response) {
        setError('Unable to connect. Please try again.');
      } else if (err.response.status === 401) {
        setError('Invalid email or password');
      } else if (err.response.status === 400) {
        const errors = err.response.data?.errors;
        setError(Array.isArray(errors) ? errors.join(' ') : 'Please check your input and try again.');
      } else {
        setError(err.response.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <h1 className="font-display text-2xl font-bold text-navy mb-6">Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-ember bg-opacity-10 text-ember rounded-button text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••"
              {...register('password')}
              error={errors.password?.message}
            />
            <Button variant="primary" className="w-full" loading={loading}>
              Login
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted text-center font-body">
            Don't have an account?{' '}
            <Link href="/signup" className="text-forest font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
