export const BEYOND_PRICING = {
  // Legalization & Protection fee — percentage of annual rent, clamped by
  // the min/max negotiation band, then floored and capped in Naira.
  LEGALIZATION_FEE_RATE: 0.08,      // 8% of annual rent (default rate)
  LEGALIZATION_FEE_MIN_RATE: 0.05,  // 5% — lowest a landlord may negotiate to
  LEGALIZATION_FEE_MAX_RATE: 0.1,   // 10% — highest a landlord may negotiate to
  LEGALIZATION_FEE_FLOOR: 10000,    // Naira
  LEGALIZATION_FEE_CAP: 100000,     // Naira

  LAWYER_REVIEW_ADDON: 8000,        // Naira — add-on to the legalization fee
  RENTAL_HISTORY_EXPORT: 5000,      // Naira
  LANDLORD_SUBSCRIPTION: 20000,     // Naira/month

  // What the tenant saves vs informal market
  TYPICAL_AGENT_FEE: 100000,        // Naira — for display purposes only
  TYPICAL_LEGAL_FEE: 20000,         // Naira — for display purposes only

  // Lawyer payout split
  LAWYER_REVIEW_PAYOUT: 5000,       // Naira — lawyer earns this
  LAWYER_REVIEW_PLATFORM_CUT: 3000, // Naira — platform keeps this

  // Placeholder until an insurer partnership is signed — premiums themselves
  // are set by the insurer partner, not by us.
  INSURANCE_COMMISSION_RATE: 0.15,  // 15% of premium
} as const;
