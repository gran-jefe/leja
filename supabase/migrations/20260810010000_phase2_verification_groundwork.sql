-- Phase 2 groundwork: property verification & escrow for remote/absentee
-- buyers (domestic Nigerians primary, diaspora as an addition — see
-- CLAUDE.md and docs/BeyondAgency_Vision_and_Strategy.docx). This migration
-- adds the schema pieces needed before any verification UI/API is built:
-- a single, category-agnostic user verification tier, a verifications
-- audit table, and property title-verification fields. No existing rental
-- flow behavior changes — every column here defaults to the unverified
-- state so current users/properties are unaffected.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_tier SMALLINT NOT NULL DEFAULT 0
    CHECK (verification_tier IN (0, 1, 2));

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS title_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (title_verification_status IN ('UNVERIFIED','PENDING','VERIFIED','REJECTED')),
  ADD COLUMN IF NOT EXISTS title_document_url TEXT,
  ADD COLUMN IF NOT EXISTS title_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS title_verified_by UUID REFERENCES users(id);

CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier SMALLINT NOT NULL CHECK (tier IN (1, 2)),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  method TEXT NOT NULL,
  provider_reference TEXT,
  metadata JSONB DEFAULT '{}',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
