'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;

  const isLandlord = user?.role === 'LANDLORD';

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-navy mb-8">
        Welcome back, {user?.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLandlord ? (
          <>
            <Card title="Properties" subtitle="Manage your listings">
              <div className="h-24 bg-cream rounded-button flex items-center justify-center text-muted">
                0 properties
              </div>
            </Card>
            <Card title="Active Agreements" subtitle="Tenancy agreements">
              <div className="h-24 bg-cream rounded-button flex items-center justify-center text-muted">
                0 active
              </div>
            </Card>
            <Card title="Pending Reviews" subtitle="Lawyer reviews">
              <div className="h-24 bg-cream rounded-button flex items-center justify-center text-muted">
                0 pending
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card title="My Agreements" subtitle="Your tenancy agreements">
              <div className="h-24 bg-cream rounded-button flex items-center justify-center text-muted">
                0 agreements
              </div>
            </Card>
            <Card title="Rental History" subtitle="Your rental record">
              <div className="h-24 bg-cream rounded-button flex items-center justify-center text-muted">
                0 records
              </div>
            </Card>
            <Card title="Get Agreement" subtitle="Start new tenancy">
              <div className="h-24 bg-cream rounded-button flex items-center justify-center text-muted">
                Browse properties
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
