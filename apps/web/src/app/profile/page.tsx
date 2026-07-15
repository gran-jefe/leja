'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading, error, refetch } = useProfile();
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
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-navy mb-8">My Profile</h1>

            {loading ? (
              <Card>
                <Skeleton height="1rem" className="mb-4" />
                <Skeleton height="1rem" className="mb-4" />
                <Skeleton height="1rem" width="40%" />
              </Card>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <Card>
                {successMessage && (
                  <div className="mb-4 p-3 bg-forest bg-opacity-10 text-forest rounded-button text-sm font-body">
                    {successMessage}
                  </div>
                )}
                {updateError && (
                  <div className="mb-4 p-3 bg-ember bg-opacity-10 text-ember rounded-button text-sm font-body">
                    {updateError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Your name"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+234..."
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
                      Role
                    </label>
                    <Badge variant="info">{user?.role}</Badge>
                  </div>
                  <Button variant="primary" className="w-full" loading={updating}>
                    Save Changes
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
