-- BeyondAgency now employs lawyers directly (monthly salary) instead of
-- running legal review as an open bid category — but keeps the PaaS bid
-- marketplace itself for categories with genuine external competition
-- (insurance now, more categories later). This distinguishes the two
-- provider types on the same service_providers table rather than forking
-- the schema: INTERNAL (salaried staff, auto-assigned, no bidding) vs
-- EXTERNAL (independent providers who compete for jobs).
--
-- Idempotent: safe to re-run.

ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'EXTERNAL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'service_providers' AND constraint_name = 'service_providers_employment_type_check'
  ) THEN
    ALTER TABLE service_providers ADD CONSTRAINT service_providers_employment_type_check
      CHECK (employment_type IN ('INTERNAL', 'EXTERNAL'));
  END IF;
END $$;
