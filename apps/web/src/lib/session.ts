import Cookies from 'js-cookie';

/**
 * Session persistence, extracted from login/page.tsx and signup/page.tsx where
 * it was duplicated byte-for-byte.
 *
 * NOTE: the storage keys are still `leja_*` — the pre-rename brand. They are
 * deliberately unchanged: renaming them would invalidate every live session
 * and log all existing users out. `useAuth` and the axios interceptor read the
 * same keys, so all three must move together if they are ever changed.
 */
const TOKEN_KEY = 'leja_token';
const USER_KEY = 'leja_user';

export interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
}

export function persistSession(token: string, user: SessionUser) {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Where a user lands after authenticating, by role. */
export function landingRouteFor(user: SessionUser): string {
  if (user?.isAdmin) return '/admin';
  if (user?.role === 'PROVIDER') return '/provider/dashboard';
  return '/dashboard';
}
