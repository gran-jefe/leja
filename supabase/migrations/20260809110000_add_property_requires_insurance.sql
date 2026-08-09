-- Landlord-required insurance: a property-level condition of tenancy, set
-- by the landlord, not forced by the platform. When true, rent-protection
-- insurance is posted to the bid marketplace automatically on agreement
-- acceptance (landlord as requester/payer — this product protects their
-- asset) instead of relying on the tenant's optional opt-in. Surfaced on
-- the listing as an "Insured Tenancy" trust badge.
--
-- Idempotent: safe to re-run.

ALTER TABLE properties ADD COLUMN IF NOT EXISTS requires_insurance BOOLEAN DEFAULT false;
