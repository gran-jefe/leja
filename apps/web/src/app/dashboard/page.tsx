'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';

export default function DashboardPage() {
  const { user, isLandlord, isTenant } = useAuth();

  return (
    <ProtectedPageWrapper>
      <div>
        <h1 className="font-display text-3xl font-bold text-navy mb-8">
          Welcome back, {user?.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {isLandlord && (
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
            </>
          )}

          {isTenant && (
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
            </>
          )}
        </div>

        {isLandlord && (
          <Link href="/agreement/new">
            <Button variant="primary">New Agreement</Button>
          </Link>
        )}

        {isTenant && (
          <Link href="/agreements">
            <Button variant="primary">Get Agreement</Button>
          </Link>
        )}
      </div>
    </ProtectedPageWrapper>
  );
}
