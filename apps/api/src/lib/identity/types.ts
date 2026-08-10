// Provider-agnostic identity verification contract — mirrors the pattern in
// ../payments/. No real KYC provider is wired up yet (this is Phase 2
// groundwork per the Vision & Strategy / Execution Roadmap docs); a
// StubKycProvider fills in until one is chosen (Youverify, Smile Identity,
// Prembly/QoreID, VerifyMe are the leading Nigerian candidates — see the
// Skills & Team Audit doc for the "in-app, third-party rails behind our own
// UI" decision).
//
// Two tiers, both category-agnostic — verified once, travels with the user
// across every role/vertical:
//   Tier 1 — phone + BVN/NIN check. Fast, unlocks low-stakes activity.
//   Tier 2 — liveness check + document verification. Required before any
//            high-value or escrow-backed activity (e.g. property purchase).

export type VerificationTier = 1 | 2;

export interface Tier1Params {
  userId: string;
  phone: string;
  bvnOrNin: string;
}

export interface Tier2Params {
  userId: string;
  /** URL/reference to an already-uploaded selfie for liveness matching. */
  livenessImageRef: string;
  /** URL/reference to an already-uploaded ID document. */
  documentImageRef: string;
  documentType: 'NIN_SLIP' | 'DRIVERS_LICENSE' | 'PASSPORT' | 'VOTERS_CARD';
}

export interface VerificationResult {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  providerReference?: string;
  reason?: string;
}

export interface KycProvider {
  readonly name: string;
  verifyTier1(params: Tier1Params): Promise<VerificationResult>;
  verifyTier2(params: Tier2Params): Promise<VerificationResult>;
}
