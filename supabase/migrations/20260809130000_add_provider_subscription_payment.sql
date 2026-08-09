-- Lets external providers actually pay for PRIORITY-tier bid-pool access
-- (previously priced via PROVIDER_PRIORITY_SUBSCRIPTION in @beyond/shared
-- but with no way to buy it). Adds the payment type and an expiry column
-- so a lapsed subscription reads as STANDARD again without needing a cron
-- job — checked at read time.
--
-- Idempotent: safe to re-run.

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_type_check;
ALTER TABLE payments ADD CONSTRAINT payments_type_check
  CHECK (type IN ('TENANT_MOVE_IN_FEE','TENANT_LAWYER_REVIEW','RENTAL_HISTORY_EXPORT','LANDLORD_SUBSCRIPTION','PROVIDER_SUBSCRIPTION'));

ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
