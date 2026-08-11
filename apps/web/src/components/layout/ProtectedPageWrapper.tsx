'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Capability } from '@beyond/shared';

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  /**
   * Gate on holding a capability. Do not use this on a screen that *earns*
   * the capability — listing a first property or accepting a first agreement
   * must stay reachable by someone who holds nothing yet.
   */
  requiredCapability?: Capability;
  redirectTo?: string;
  /** @deprecated Use `requiredCapability`. */
  requiredRole?: Capability;
}

export const ProtectedPageWrapper: React.FC<ProtectedPageWrapperProps> = ({
  children,
  requiredCapability,
  requiredRole,
  redirectTo = '/dashboard',
}) => {
  const router = useRouter();
  const { isAuthenticated, can } = useAuth();
  const required = requiredCapability ?? requiredRole;
  // useAuth reads localStorage/cookies synchronously, which isn't available
  // during SSR — wait for the client mount before trusting its result so the
  // first client render matches the server render instead of flash-redirecting.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (required && !can(required)) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, required, can, router, redirectTo]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (required && !can(required)) {
    return null;
  }

  return <>{children}</>;
};
