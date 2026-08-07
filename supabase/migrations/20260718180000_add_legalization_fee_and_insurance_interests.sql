-- BeyondAgency percentage-based Legalization & Protection fee: adds the
-- snapshot columns agreements need (rate + computed amount, set once at
-- DRAFT creation via calculateLegalizationFee() so a later platform rate
-- change never alters an already-created agreement's fee).
--
-- Existing agreements predate this column and keep their historical flat
-- fee amounts recorded on their `payments` row — this migration does NOT
-- backfill legalization_fee_amount for them (see MIGRATION_NOTES.md).
--
-- Also adds insurance_interests, a lightweight capture table for tenant
-- interest in rent-protection insurance (no insurer integration yet).
--
-- Idempotent: safe to re-run.

ALTER TABLE agreements ADD COLUMN IF NOT EXISTS legalization_fee_rate NUMERIC(4,3) DEFAULT 0.08;
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS legalization_fee_amount NUMERIC(12,2);

CREATE TABLE IF NOT EXISTS insurance_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id),
  tenant_id UUID NOT NULL REFERENCES users(id),
  product_type TEXT NOT NULL DEFAULT 'RENT_PROTECTION' CHECK (product_type IN ('RENT_PROTECTION')),
  status TEXT NOT NULL DEFAULT 'INTERESTED' CHECK (status IN ('INTERESTED', 'CONTACTED', 'DECLINED')),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_interests_tenant_id ON insurance_interests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_insurance_interests_agreement_id ON insurance_interests(agreement_id);
