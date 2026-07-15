'use client';

import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Card } from '@/components/ui/Card';
import { PayButton } from '@/components/shared/PayButton';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { UserRole } from '@leja/shared';
import { formatNaira } from '@/lib/utils';

export default function RentalHistoryPage() {
  const { user } = useAuth();
  const [exportError, setExportError] = useState('');
  const reference = useMemo(() => `LEJA_RHX_${Date.now()}`, []);

  const handleExportSuccess = async (response: any) => {
    setExportError('');
    try {
      const { data } = await api.post('/rental-history/export', {
        flutterwaveReference: response.tx_ref,
        transactionId: response.transaction_id,
      });

      const downloadUrl = data?.data?.downloadUrl;
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'rental-history.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setExportError('Payment succeeded but we could not generate your report. Please contact support.');
    }
  };

  return (
    <ProtectedPageWrapper requiredRole={UserRole.TENANT}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              title="My Rental History"
              action={
                <PayButton
                  amount={5000}
                  email={user?.email || ''}
                  name={user?.name || ''}
                  reference={reference}
                  description="Rental History Export"
                  label={`Export Verified Report — ${formatNaira(5000)}`}
                  onSuccess={handleExportSuccess}
                />
              }
            />

            {exportError && (
              <Card className="bg-ember bg-opacity-10 border border-ember mb-6">
                <p className="font-body text-sm text-ember">{exportError}</p>
              </Card>
            )}

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
