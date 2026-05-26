'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      // Placeholder: actual API call would go here
      console.log('Updating profile:', data);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl font-bold text-navy mb-8">My Profile</h1>

            <Card>
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
                <Button variant="primary" className="w-full" loading={loading}>
                  Save Changes
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
