'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@leja/shared';

export default function AgreementsPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === UserRole.LANDLORD;

  return (
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Agreements"
              action={
                isLandlord ? (
                  <Link href="/agreement/new">
                    <Button variant="primary">New Agreement</Button>
                  </Link>
                ) : undefined
              }
            />

            <EmptyState
              icon={FileText}
              title="No agreements yet"
              description={
                isLandlord
                  ? 'Create your first rental agreement to get started'
                  : 'Your rental agreements will appear here'
              }
              action={
                isLandlord ? (
                  <Link href="/agreement/new">
                    <Button variant="primary">New Agreement</Button>
                  </Link>
                ) : undefined
              }
            />
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
