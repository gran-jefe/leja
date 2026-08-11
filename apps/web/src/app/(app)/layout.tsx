'use client';

import { ProtectedPageWrapper } from '@/components/layout/ProtectedPageWrapper';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Every authenticated route gets auth + chrome from here.
 *
 * Role gating stays at the page level: `requiredRole` differs per screen
 * (LANDLORD, TENANT, PROVIDER) and several pages set their own `redirectTo`,
 * so it can't be hoisted. A page-level ProtectedPageWrapper nested inside this
 * one is harmless — it re-runs the same check and enforces the role on top.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPageWrapper>
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </ProtectedPageWrapper>
  );
}
