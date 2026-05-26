'use client';

import { FileText } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@leja/shared';
import { formatNaira } from '@/lib/utils';

export default function RentalHistoryPage() {
  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Rental History"
              action={
                <Button variant="primary" disabled title="Export feature coming soon">
                  Export Verified Report — {formatNaira(5000)}
                </Button>
              }
            />

            <EmptyState
              icon={FileText}
              title="No rental history yet"
              description="Your verified rental record will appear here after your first tenancy."
            />
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
