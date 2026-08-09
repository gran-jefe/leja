export const BEYOND_PRICING = {
  // Connecting, the standardized agreement, and base legalization are all
  // free — no fee charged to landlord or tenant. Kept explicit (rather than
  // just absent) so nothing computes a phantom charge.
  BASE_LEGALIZATION_FEE: 0, // Naira — always free

  // Deprecated: no longer charged. calculateLegalizationFee() and these
  // constants are kept only so historical agreements (created before this
  // pivot) can still resolve/display the fee rate/amount they were
  // originally snapshotted with. Do not use these to charge new agreements.
  LEGALIZATION_FEE_RATE: 0.08,
  LEGALIZATION_FEE_MIN_RATE: 0.05,
  LEGALIZATION_FEE_MAX_RATE: 0.1,
  LEGALIZATION_FEE_FLOOR: 10000,
  LEGALIZATION_FEE_CAP: 100000,

  // The only per-deal fee left on the tenant/landlord side — entirely
  // optional. Paid only if the tenant opts into a human lawyer reviewing
  // their (already free, standardized) agreement. Legal review is delivered
  // by BeyondAgency's own in-house, monthly-salaried legal team, not an
  // open bid — so this is a flat price the platform sets, not a bid
  // ceiling. The full amount is platform revenue (funds payroll); no
  // PLATFORM_COMMISSION_RATE cut applies here the way it does for
  // externally-bid categories.
  LAWYER_REVIEW_ADDON: 20000,       // Naira — flat price for in-house lawyer review

  RENTAL_HISTORY_EXPORT: 5000,      // Naira
  LANDLORD_SUBSCRIPTION: 20000,     // Naira/month

  // What connecting via BeyondAgency saves vs the informal market — used in
  // marketing comparisons (agent fee + informal legal cost vs ₦0 base fee).
  TYPICAL_AGENT_FEE: 100000,        // Naira — for display purposes only
  TYPICAL_LEGAL_FEE: 20000,         // Naira — for display purposes only

  // Placeholder until an insurer partnership is signed — premiums themselves
  // are set by the insurer partner, not by us. Insurance is optional and
  // paid directly by the tenant to the insurer via the bid marketplace.
  INSURANCE_COMMISSION_RATE: 0.15,  // 15% of premium — platform's cut of what the insurer earns, not an extra tenant charge

  // Service-bid marketplace: applies to EXTERNAL provider categories only
  // (insurance now, more later — inspection, moving, tech services).
  // Independent providers compete for jobs; the platform earns via
  // PLATFORM_COMMISSION_RATE (taken from the provider's side, never added
  // on top of what the requester pays) and via PRIORITY-tier subscriptions
  // for faster bid-pool visibility. LEGAL is no longer part of this —
  // BeyondAgency employs its legal team directly (see LAWYER_REVIEW_ADDON).
  BID_WINDOW_HOURS: 6,              // how long an external job stays open for bids
  PLATFORM_COMMISSION_RATE: 0.1,    // platform's cut of the winning external bid, deducted from the provider's payout
  PROVIDER_PRIORITY_SUBSCRIPTION: 15000, // Naira/month — external providers pay this for immediate (non-delayed) job visibility
} as const;
