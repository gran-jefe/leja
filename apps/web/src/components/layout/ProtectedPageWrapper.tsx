'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { UserRole } from '@leja/shared';

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedPageWrapper: React.FC<ProtectedPageWrapperProps> = ({
  children,
  requiredRole,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
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
    } else if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, requiredRole, user?.role, router]);

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

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};
