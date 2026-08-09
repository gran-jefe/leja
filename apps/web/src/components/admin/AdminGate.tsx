'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

// Shared by every /admin/* page — checks the ADMIN_EMAILS allowlist via
// the backend (never trusts the locally-stored isAdmin flag alone, since
// that's just a UI convenience computed at login time and could be stale
// if the allowlist changes) before rendering admin-only content.
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api
      .get('/admin/whoami')
      .then((res) => setIsAdmin(!!res.data.data?.isAdmin))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <ShieldAlert className="text-ember mx-auto mb-3" size={32} />
        <h2 className="font-display text-lg font-semibold text-navy mb-2">Admin access only</h2>
        <p className="font-body text-sm text-muted">
          Your account isn't on the admin allowlist. Ask whoever manages{' '}
          <code className="text-xs bg-cream px-1.5 py-0.5 rounded">ADMIN_EMAILS</code> to add you.
        </p>
      </Card>
    );
  }

  return <>{children}</>;
}
