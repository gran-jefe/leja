'use client';

import Cookies from 'js-cookie';
import { Capability, resolveCapabilities } from '@beyond/shared';

interface User {
  id: string;
  email: string;
  name: string;
  /** What this user can do. Empty for a brand-new account. */
  capabilities?: Capability[];
  /** @deprecated Present only on sessions created before capabilities. */
  role?: 'LANDLORD' | 'TENANT' | 'PROVIDER' | null;
  // No ADMIN capability exists in the schema — this is a deploy-time email
  // allowlist check (ADMIN_EMAILS) computed server-side on every auth
  // response, not stored. A user can hold capabilities *and* be an admin.
  isAdmin?: boolean;
}

export function useAuth() {
  const getUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('leja_user');
      if (stored) return JSON.parse(stored);
      // fallback: decode JWT from cookie
      const token = Cookies.get('leja_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const user = getUser();

  // `resolveCapabilities` falls back to the deprecated single `role` field, so
  // a session created before this change keeps working until it expires
  // rather than silently losing every permission.
  const capabilities = user ? resolveCapabilities(user) : [];
  const can = (capability: Capability) => capabilities.includes(capability);

  const logout = () => {
    Cookies.remove('leja_token');
    localStorage.removeItem('leja_user');
    window.location.href = '/login';
  };

  return {
    user,
    isAuthenticated: !!user,
    capabilities,
    can,
    // A user may hold several at once — these are no longer mutually exclusive.
    isLandlord: can(Capability.LANDLORD),
    isTenant: can(Capability.TENANT),
    isProvider: can(Capability.PROVIDER),
    /** True until they've listed a property or accepted an agreement. */
    isNewUser: capabilities.length === 0,
    isAdmin: !!user?.isAdmin,
    logout,
  };
}
