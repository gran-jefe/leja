'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading, error, refetch } = useProfile();
  const { capabilities } = useAuth();
  const { updateProfile, loading: updating, error: updateError } = useUpdateProfile();
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSuccessMessage('');
    const updated = await updateProfile(data);
    if (updated) {
      setSuccessMessage('Profile updated successfully.');
    }
  };

  return (
    <div className="max-w-content mx-auto">
      <PageHeader
        title="My profile"
        subtitle="Your account details."
        icon={UserIcon}
      />

      {loading ? (
        <SkeletonCard lines={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} size="page" />
      ) : (
        <Card>
          {successMessage && (
            <Alert tone="success" className="mb-5">
              {successMessage}
            </Alert>
          )}
          {updateError && (
            <Alert tone="error" className="mb-5">
              {updateError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Name"
              placeholder="Your name"
              required
              autoComplete="name"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              helperText="Contact support to change the email on your account."
            />
            <Input
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 801 234 5678"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <div>
              <p className="font-body text-body-sm font-semibold text-ink-800 mb-2">
                What you can do
              </p>
              {capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((c) => (
                    <Badge key={c} tone="info">
                      {c.charAt(0) + c.slice(1).toLowerCase()}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="font-body text-body-sm text-ink-500">
                  Nothing yet — list a property or accept an agreement to get started.
                </p>
              )}
            </div>
            <Button type="submit" fullWidth size="lg" loading={updating}>
              Save changes
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
