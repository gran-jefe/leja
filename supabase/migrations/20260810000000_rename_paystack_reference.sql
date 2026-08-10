-- Payment rail swap: Flutterwave -> eTranzact (see apps/api/src/lib/payments/).
-- The `payments.paystack_reference` column was already a misnomer (it stored
-- the Flutterwave tx_ref, never a Paystack reference — Paystack was never
-- actually integrated). Renaming it to a provider-neutral name now that a
-- second provider is in the codebase, rather than carrying the wrong name
-- through a second migration.

ALTER TABLE payments RENAME COLUMN paystack_reference TO payment_reference;
ALTER INDEX IF EXISTS idx_payments_paystack_reference RENAME TO idx_payments_payment_reference;
