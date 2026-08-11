/**
 * A capability is something a user *can do*, earned by doing it — not a lane
 * they pick at signup. One person may hold several: a landlord who also rents
 * elsewhere holds both LANDLORD and TENANT on one account.
 *
 * Values intentionally match the old UserRole strings so existing tokens,
 * rows and API payloads stay readable through the transition.
 */
export enum Capability {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  PROVIDER = 'PROVIDER',
}

/**
 * @deprecated Superseded by `Capability`. A user is no longer confined to one
 * role. Kept so unmigrated code compiles and old JWTs remain readable — read
 * `capabilities` in anything new.
 */
export enum UserRole {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  PROVIDER = 'PROVIDER',
}

/** How a capability was acquired. Recorded for auditing and future revocation. */
export type CapabilityGrantReason =
  | 'listed_property'
  | 'accepted_agreement'
  | 'provider_approved'
  | 'backfill_from_role'
  | 'backfill_has_property'
  | 'backfill_has_agreement';

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  /** What this user can do. May be empty for a brand-new account. */
  capabilities: Capability[];
  /** @deprecated Use `capabilities`. Null for accounts created after the switch. */
  role?: UserRole | null;
  isVerified: boolean;
  // Phase 2 groundwork — single, category-agnostic tier that travels with
  // the user across every role/vertical. 0 = unverified, 1 = Tier 1
  // (phone + BVN/NIN), 2 = Tier 2 (liveness + document, required for
  // escrow-backed activity). isVerified above is derived as tier >= 1.
  verificationTier?: 0 | 1 | 2;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reads capabilities with a fallback to the deprecated single role, so a JWT
 * issued before this change still resolves correctly until it expires.
 */
export const resolveCapabilities = (user: {
  capabilities?: Capability[] | string[] | null;
  role?: string | null;
}): Capability[] => {
  if (user.capabilities && user.capabilities.length > 0) {
    return user.capabilities as Capability[];
  }
  return user.role ? [user.role as Capability] : [];
};

export const hasCapability = (
  user: { capabilities?: Capability[] | string[] | null; role?: string | null },
  capability: Capability
): boolean => resolveCapabilities(user).includes(capability);
