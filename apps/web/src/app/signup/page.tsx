'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(11, 'Phone must be at least 11 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'TENANT' },
  });

  const role = watch('role');

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data.data;
      Cookies.set('leja_token', token, { expires: 7 });
      localStorage.setItem('leja_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to connect. Please try again.');
      } else {
        const errors = err.response.data?.errors;
        setError(
          Array.isArray(errors) ? errors.join(' ') : err.response.data?.message || 'Signup failed'
        );
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
          <h1 className="font-display text-2xl font-bold text-navy mb-6">Create Account</h1>

          {error && (
            <div className="mb-4 p-3 bg-ember bg-opacity-10 text-ember rounded-button text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Phone"
              placeholder="+2348012345678"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                I am a:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-body">
                  <input
                    type="radio"
                    value="TENANT"
                    {...register('role')}
                    className="w-4 h-4"
                  />
                  <span>Tenant</span>
                </label>
                <label className="flex items-center gap-2 font-body">
                  <input
                    type="radio"
                    value="LANDLORD"
                    {...register('role')}
                    className="w-4 h-4"
                  />
                  <span>Landlord</span>
                </label>
              </div>
            </div>

            <Button variant="primary" className="w-full" loading={loading}>
              Sign Up
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted text-center font-body">
            Already have an account?{' '}
            <Link href="/login" className="text-forest font-semibold hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
