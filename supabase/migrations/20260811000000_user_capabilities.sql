-- Capabilities replace the exclusive `users.role` column.
--
-- WHY: `role TEXT NOT NULL CHECK (role IN ('LANDLORD','TENANT','PROVIDER'))`
-- forced one person into one lane. A landlord who rents a flat elsewhere, or a
-- tenant who later lists a property, needed a second account under a second
-- email. It also doesn't extend: Phase 2 adds buyer/seller and Phase 3 adds
-- SME/lender, neither of which fits a three-value enum — exactly the kind of
-- hardcoded assumption CLAUDE.md warns against.
--
-- MODEL: a capability is *earned by doing the thing*, not declared at signup.
-- You become a LANDLORD by listing a property, a TENANT by accepting an
-- agreement, a PROVIDER by being approved. Signup asks for nothing but who you
-- are.
--
-- `users.role` is deliberately NOT dropped here. It stays as a nullable
-- compatibility column so a rolling deploy can't break: old API instances keep
-- reading it while new ones read capabilities. Drop it in a later migration
-- once nothing references it.

CREATE TABLE IF NOT EXISTS user_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capability TEXT NOT NULL CHECK (
    capability IN ('LANDLORD', 'TENANT', 'PROVIDER')
  ),
  -- How it was acquired, for auditing and for future phases where a
  -- capability may be revoked (e.g. a suspended provider).
  granted_reason TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, capability)
);

CREATE INDEX IF NOT EXISTS idx_user_capabilities_user ON user_capabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_capabilities_capability ON user_capabilities(capability);

-- Backfill: every existing user keeps exactly what they had.
INSERT INTO user_capabilities (user_id, capability, granted_reason)
SELECT id, role, 'backfill_from_role'
FROM users
WHERE role IS NOT NULL
ON CONFLICT (user_id, capability) DO NOTHING;

-- Existing landlords with a live listing and tenants on an active agreement
-- would have earned the capability anyway; this makes the backfill match what
-- the new grant rules would produce.
INSERT INTO user_capabilities (user_id, capability, granted_reason)
SELECT DISTINCT landlord_id, 'LANDLORD', 'backfill_has_property'
FROM properties
WHERE landlord_id IS NOT NULL AND is_deleted = false
ON CONFLICT (user_id, capability) DO NOTHING;

INSERT INTO user_capabilities (user_id, capability, granted_reason)
SELECT DISTINCT tenant_id, 'TENANT', 'backfill_has_agreement'
FROM agreements
WHERE tenant_id IS NOT NULL AND status <> 'DRAFT'
ON CONFLICT (user_id, capability) DO NOTHING;

-- Role is no longer required at signup.
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;

COMMENT ON COLUMN users.role IS
  'DEPRECATED — superseded by user_capabilities. Kept nullable for rolling-deploy compatibility; do not read in new code.';

COMMENT ON TABLE user_capabilities IS
  'What a user can do, earned by action rather than declared at signup. One user may hold several.';
