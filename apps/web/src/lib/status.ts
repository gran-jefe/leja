/**
 * Single status registry.
 *
 * Replaces six separate mappers that had drifted apart:
 *   lib/utils.ts            getAgreementStatusVariant / getLawyerReviewStatusVariant
 *   rental-history/page.tsx historyStatusVariant
 *   provider/dashboard      local bid-status mapper
 *   admin/users             local mapper
 *   admin/payments          local mapper
 *
 * `tone` maps onto Badge tones. Note that `warning` (ember) and `danger`
 * (crimson) are now genuinely different colours — previously both rendered as
 * ember, so PENDING_PAYMENT and TERMINATED looked identical.
 */

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

const AGREEMENT: Record<string, StatusMeta> = {
  DRAFT: { label: 'Awaiting Tenant', tone: 'neutral' },
  PENDING_PAYMENT: { label: 'Awaiting Payment', tone: 'warning' },
  ACTIVE: { label: 'Active', tone: 'success' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
  DISPUTED: { label: 'Disputed', tone: 'danger' },
  TERMINATED: { label: 'Terminated', tone: 'danger' },
};

const LAWYER_REVIEW: Record<string, StatusMeta> = {
  NONE: { label: 'Not requested', tone: 'neutral' },
  PENDING: { label: 'Pending', tone: 'warning' },
  IN_REVIEW: { label: 'In review', tone: 'info' },
  COMPLETED: { label: 'Completed', tone: 'success' },
};

const PAYMENT: Record<string, StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  SUCCESS: { label: 'Paid', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
};

const JOB: Record<string, StatusMeta> = {
  OPEN: { label: 'Open for bids', tone: 'info' },
  AWARDED: { label: 'Awarded', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

const PROVIDER: Record<string, StatusMeta> = {
  PENDING: { label: 'Awaiting review', tone: 'warning' },
  ACTIVE: { label: 'Verified', tone: 'success' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
};

const TENANCY: Record<string, StatusMeta> = {
  ACTIVE: { label: 'Current tenancy', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  TERMINATED: { label: 'Terminated', tone: 'danger' },
};

const VERIFICATION: Record<string, StatusMeta> = {
  UNVERIFIED: { label: 'Unverified', tone: 'neutral' },
  PENDING: { label: 'Verification pending', tone: 'warning' },
  VERIFIED: { label: 'Verified', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
};

const REGISTRY = {
  agreement: AGREEMENT,
  lawyerReview: LAWYER_REVIEW,
  payment: PAYMENT,
  job: JOB,
  provider: PROVIDER,
  tenancy: TENANCY,
  verification: VERIFICATION,
} as const;

export type StatusDomain = keyof typeof REGISTRY;

const titleCase = (raw: string) =>
  raw
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** Unknown values degrade to a neutral, title-cased label rather than raw SCREAMING_SNAKE. */
export function getStatus(domain: StatusDomain, status?: string | null): StatusMeta {
  if (!status) return { label: '—', tone: 'neutral' };
  return REGISTRY[domain][status] ?? { label: titleCase(status), tone: 'neutral' };
}

export const statusLabel = (domain: StatusDomain, status?: string | null) =>
  getStatus(domain, status).label;

export const statusTone = (domain: StatusDomain, status?: string | null) =>
  getStatus(domain, status).tone;
