import { config } from '../config';

// Single source of truth for "is this user an admin". There is no ADMIN
// role in the users table by design (see CLAUDE.md) — admin access is a
// deploy-time email allowlist (ADMIN_EMAILS), never something a user can
// self-assign via signup or an API call. Anything gating admin-only
// behavior, backend or frontend-facing, should go through this.
export const isAdmin = (email?: string | null): boolean =>
  !!email && config.admin.emails.includes(email.toLowerCase());
