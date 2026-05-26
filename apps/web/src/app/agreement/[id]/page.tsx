'use client';

import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileDown, CheckCircle2 } from 'lucide-react';

export default function AgreementPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedPageWrapper>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold text-navy mb-2">
                Agreement #{id}
              </h1>
              <Badge variant="success">Loading...</Badge>
            </div>

            <Card title="Agreement Details">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted font-body">Property</label>
                  <p className="text-charcoal font-body">Loading...</p>
                </div>
                <div>
                  <label className="text-sm text-muted font-body">Landlord</label>
                  <p className="text-charcoal font-body">Loading...</p>
                </div>
                <div>
                  <label className="text-sm text-muted font-body">Tenant</label>
                  <p className="text-charcoal font-body">Loading...</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted font-body">Start Date</label>
                    <p className="text-charcoal font-body">Loading...</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted font-body">End Date</label>
                    <p className="text-charcoal font-body">Loading...</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted font-body">Monthly Rent</label>
                    <p className="text-charcoal font-body">Loading...</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted font-body">Annual Rent</label>
                    <p className="text-charcoal font-body">Loading...</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 mt-6">
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                disabled
              >
                <FileDown size={18} />
                Download PDF
              </Button>
              <Button
                variant="primary"
                className="flex items-center gap-2"
                disabled
              >
                <CheckCircle2 size={18} />
                Request Lawyer Review
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedPageWrapper>
  );
}
