'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';
import { Shield, FileCheck, Users } from 'lucide-react';
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
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4 py-20">
        <p className="font-body text-xs uppercase tracking-wider text-forest font-semibold mb-3">
          Welcome back
        </p>
        <Card className="w-full max-w-md shadow-2xl">
          <h1 className="font-display text-2xl font-bold text-navy mb-6">Log in to Leja</h1>

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

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-[#A0AEC0] font-body mt-8">
          <div className="flex items-center gap-2">
            <Shield size={16} />
            Bank-grade security
          </div>
          <div className="flex items-center gap-2">
            <FileCheck size={16} />
            State-compliant agreements
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            No agent fees
          </div>
        </div>
      </div>
    </>
  );
}
