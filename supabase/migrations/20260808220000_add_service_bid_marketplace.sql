-- BeyondAgency service-bid marketplace: legalization (and later insurance)
-- work is posted as a "job" that multiple vetted, independent providers bid
-- on, rather than routed to a single in-house/exclusive partner. The
-- winning bid executes; the platform earns a commission on top regardless
-- of who wins. Generic across categories so future categories (inspection,
-- moving, tech services) reuse this engine.
--
-- Idempotent: safe to re-run.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('LANDLORD', 'TENANT', 'PROVIDER'));

CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL CHECK (category IN ('LEGAL', 'INSURANCE')),
  license_number TEXT NOT NULL,
  license_verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
  subscription_tier TEXT NOT NULL DEFAULT 'STANDARD' CHECK (subscription_tier IN ('STANDARD', 'PRIORITY')),
  rating NUMERIC(3,2),
  rating_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER service_providers_update_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_service_providers_user_category ON service_providers(user_id, category);
CREATE INDEX IF NOT EXISTS idx_service_providers_category_status ON service_providers(category, status);

CREATE TABLE IF NOT EXISTS service_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id),
  category TEXT NOT NULL CHECK (category IN ('LEGAL', 'INSURANCE')),
  requester_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'AWARDED', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  bid_window_closes_at TIMESTAMPTZ NOT NULL,
  min_price NUMERIC(12,2),
  max_price NUMERIC(12,2),
  winning_bid_id UUID,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER service_jobs_update_updated_at
  BEFORE UPDATE ON service_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_service_jobs_agreement_id ON service_jobs(agreement_id);
CREATE INDEX IF NOT EXISTS idx_service_jobs_category_status ON service_jobs(category, status);

CREATE TABLE IF NOT EXISTS service_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES service_jobs(id),
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  price NUMERIC(12,2) NOT NULL,
  turnaround_hours INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'WON', 'LOST', 'WITHDRAWN')),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER service_bids_update_updated_at
  BEFORE UPDATE ON service_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_service_bids_job_provider ON service_bids(job_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bids_job_id ON service_bids(job_id);
CREATE INDEX IF NOT EXISTS idx_service_bids_provider_id ON service_bids(provider_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_service_jobs_winning_bid'
  ) THEN
    ALTER TABLE service_jobs ADD CONSTRAINT fk_service_jobs_winning_bid
      FOREIGN KEY (winning_bid_id) REFERENCES service_bids(id);
  END IF;
END $$;
