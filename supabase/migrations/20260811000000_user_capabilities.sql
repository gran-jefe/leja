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
--
-- IDEMPOTENT: safe to run more than once, and tolerant of a database where
-- `users.role` has already been dropped or where `properties`/`agreements`
-- don't exist yet. Every statement is guarded — re-running is a no-op rather
-- than an error.

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

DO $$
BEGIN
  -- ---- Backfill 1: every existing user keeps exactly what they had --------
  -- Skipped entirely if `role` has already been dropped by a later migration,
  -- which is the case this guard exists for.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    INSERT INTO user_capabilities (user_id, capability, granted_reason)
    SELECT id, role, 'backfill_from_role'
    FROM users
    WHERE role IS NOT NULL
      -- Defensive: a stray value outside the CHECK constraint would abort the
      -- whole migration rather than skip one row.
      AND role IN ('LANDLORD', 'TENANT', 'PROVIDER')
    ON CONFLICT (user_id, capability) DO NOTHING;

    -- Role is no longer required at signup. A no-op if already nullable.
    ALTER TABLE users ALTER COLUMN role DROP NOT NULL;

    COMMENT ON COLUMN users.role IS
      'DEPRECATED — superseded by user_capabilities. Kept nullable for rolling-deploy compatibility; do not read in new code.';
  END IF;

  -- ---- Backfill 2: anyone with a live listing is already a landlord ------
  IF to_regclass('public.properties') IS NOT NULL THEN
    INSERT INTO user_capabilities (user_id, capability, granted_reason)
    SELECT DISTINCT landlord_id, 'LANDLORD', 'backfill_has_property'
    FROM properties
    WHERE landlord_id IS NOT NULL
      AND COALESCE(is_deleted, false) = false
    ON CONFLICT (user_id, capability) DO NOTHING;
  END IF;

  -- ---- Backfill 3: anyone past DRAFT on an agreement is already a tenant --
  IF to_regclass('public.agreements') IS NOT NULL THEN
    INSERT INTO user_capabilities (user_id, capability, granted_reason)
    SELECT DISTINCT tenant_id, 'TENANT', 'backfill_has_agreement'
    FROM agreements
    WHERE tenant_id IS NOT NULL
      AND status IS DISTINCT FROM 'DRAFT'
    ON CONFLICT (user_id, capability) DO NOTHING;
  END IF;
END
$$;

COMMENT ON TABLE user_capabilities IS
  'What a user can do, earned by action rather than declared at signup. One user may hold several.';

-- ---- Post-condition -------------------------------------------------------
-- Nobody who previously had access should end up with zero capabilities.
-- Raises rather than completing quietly, because a silent partial backfill
-- would lock real users out of their own properties and agreements.
DO $$
DECLARE
  orphaned INTEGER;
  stray    INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    -- Scoped to roles the backfill actually handles. Counting every non-null
    -- role here would contradict the `role IN (...)` filter above and let a
    -- single junk row abort the entire deploy.
    SELECT COUNT(*) INTO orphaned
    FROM users u
    WHERE u.role IN ('LANDLORD', 'TENANT', 'PROVIDER')
      AND NOT EXISTS (SELECT 1 FROM user_capabilities c WHERE c.user_id = u.id);

    IF orphaned > 0 THEN
      RAISE EXCEPTION
        'Capability backfill incomplete: % user(s) with a valid role have no capability. Aborting.', orphaned;
    END IF;

    -- A value outside the enum can't exist under the CHECK constraint on
    -- users.role, so this is belt-and-braces — surfaced loudly, but not fatal,
    -- since such a user had no working role to lose in the first place.
    SELECT COUNT(*) INTO stray
    FROM users u
    WHERE u.role IS NOT NULL
      AND u.role NOT IN ('LANDLORD', 'TENANT', 'PROVIDER');

    IF stray > 0 THEN
      RAISE WARNING
        '% user(s) have an unrecognised role value and were granted no capability. Review manually.', stray;
    END IF;
  END IF;
END
$$;
