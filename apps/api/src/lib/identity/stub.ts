import type { KycProvider, Tier1Params, Tier2Params, VerificationResult } from './types';

// Placeholder implementation — auto-approves everything so the verification
// flow (routes, DB writes, tier gating on escrow-backed actions) can be
// built and tested end-to-end before a real KYC provider is chosen and
// contracted. NEVER use this in production: it does not actually check
// anything. Swap for a real provider (see types.ts header) by implementing
// KycProvider and wiring it into index.ts the same way lib/payments/index.ts
// switches on PAYMENT_PROVIDER.
export const stubKycProvider: KycProvider = {
  name: 'stub',

  async verifyTier1(params: Tier1Params): Promise<VerificationResult> {
    console.warn(
      `[IDENTITY] Using stub KYC provider for Tier 1 check on user ${params.userId} — no real verification performed.`
    );
    return { status: 'APPROVED', providerReference: `STUB_T1_${Date.now()}` };
  },

  async verifyTier2(params: Tier2Params): Promise<VerificationResult> {
    console.warn(
      `[IDENTITY] Using stub KYC provider for Tier 2 check on user ${params.userId} — no real verification performed.`
    );
    return { status: 'APPROVED', providerReference: `STUB_T2_${Date.now()}` };
  },
};
