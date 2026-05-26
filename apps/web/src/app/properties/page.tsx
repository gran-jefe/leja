'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@leja/shared';

export default function PropertiesPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.LANDLORD}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Properties"
              action={
                <Link href="/properties/new">
                  <Button variant="primary">Add Property</Button>
                </Link>
              }
            />

            <EmptyState
              icon={Home}
              title="No properties yet"
              description="Add your first property to get started"
              action={
                <Link href="/properties/new">
                  <Button variant="primary">Add Property</Button>
                </Link>
              }
            />
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
