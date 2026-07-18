export const LEJA_PRICING = {
  TENANT_MOVE_IN_FEE: 15000,        // Naira
  TENANT_LAWYER_REVIEW: 8000,       // Naira — add-on to move-in fee
  RENTAL_HISTORY_EXPORT: 5000,      // Naira
  LANDLORD_SUBSCRIPTION: 20000,     // Naira/month

  // What the tenant saves vs informal market
  TYPICAL_AGENT_FEE: 100000,        // Naira — for display purposes only
  TYPICAL_LEGAL_FEE: 20000,         // Naira — for display purposes only

  // Lawyer payout split
  LAWYER_REVIEW_PAYOUT: 5000,       // Naira — lawyer earns this
  LAWYER_REVIEW_PLATFORM_CUT: 3000, // Naira — Leja keeps this
} as const;
