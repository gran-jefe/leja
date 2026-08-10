export enum UserRole {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  PROVIDER = 'PROVIDER',
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  // Phase 2 groundwork — single, category-agnostic tier that travels with
  // the user across every role/vertical. 0 = unverified, 1 = Tier 1
  // (phone + BVN/NIN), 2 = Tier 2 (liveness + document, required for
  // escrow-backed activity). isVerified above is derived as tier >= 1.
  verificationTier?: 0 | 1 | 2;
  createdAt: Date;
  updatedAt: Date;
}
