'use client';

import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'LANDLORD' | 'TENANT' | 'PROVIDER';
  // No ADMIN role exists in the schema — this is a deploy-time email
  // allowlist check (ADMIN_EMAILS) computed server-side on every auth
  // response, not stored. A user can be e.g. TENANT *and* isAdmin at once.
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

  const logout = () => {
    Cookies.remove('leja_token');
    localStorage.removeItem('leja_user');
    window.location.href = '/login';
  };

  return {
    user,
    isAuthenticated: !!user,
    isLandlord: user?.role === 'LANDLORD',
    isTenant: user?.role === 'TENANT',
    isProvider: user?.role === 'PROVIDER',
    isAdmin: !!user?.isAdmin,
    logout,
  };
}
