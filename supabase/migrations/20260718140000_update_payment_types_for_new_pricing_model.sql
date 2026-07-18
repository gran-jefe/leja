-- The pricing model changed: landlords no longer pay to generate agreements
-- (AGREEMENT_BASIC / AGREEMENT_REVIEWED are gone); tenants now pay a move-in
-- fee at agreement acceptance instead. PaymentType in packages/shared was
-- updated to TENANT_MOVE_IN_FEE / TENANT_LAWYER_REVIEW / RENTAL_HISTORY_EXPORT
-- / LANDLORD_SUBSCRIPTION, so the payments.type CHECK constraint (and any
-- rows still holding an old value) need to follow.
--
-- Constraint is dropped before the data backfill (not after) — updating rows
-- to the new values while the old constraint is still active would violate it.
--
-- Idempotent: safe to re-run against a DB already on the new constraint.

BEGIN;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_type_check;

UPDATE payments SET type = 'TENANT_MOVE_IN_FEE' WHERE type IN ('AGREEMENT_BASIC', 'AGREEMENT_REVIEWED');
UPDATE payments SET type = 'LANDLORD_SUBSCRIPTION' WHERE type = 'SUBSCRIPTION';
UPDATE payments SET type = 'RENTAL_HISTORY_EXPORT' WHERE type = 'RENTAL_HISTORY';

ALTER TABLE payments ADD CONSTRAINT payments_type_check
  CHECK (type IN ('TENANT_MOVE_IN_FEE', 'TENANT_LAWYER_REVIEW', 'RENTAL_HISTORY_EXPORT', 'LANDLORD_SUBSCRIPTION'));

COMMIT;
