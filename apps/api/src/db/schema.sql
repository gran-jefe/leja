-- BeyondAgency PostgreSQL Schema

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('LANDLORD', 'TENANT', 'PROVIDER')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER users_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_users_email ON users(email);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  monthly_rent NUMERIC(12,2) NOT NULL,
  annual_rent NUMERIC(12,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  -- Landlord-set condition of tenancy, not a platform mandate: when true,
  -- rent-protection insurance is posted to the bid marketplace automatically
  -- on agreement acceptance rather than left to the tenant's opt-in
  -- checkbox. Landlord is the requester/payer — this product protects
  -- their asset, not the tenant's. Surfaced on the listing as a trust
  -- badge ("Insured Tenancy").
  requires_insurance BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER properties_update_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_is_available ON properties(is_available);

-- Agreements table
CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  landlord_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC(12,2) NOT NULL,
  annual_rent NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PENDING_PAYMENT','ACTIVE','EXPIRED','DISPUTED','TERMINATED')),
  pdf_url TEXT,
  lawyer_review_status TEXT DEFAULT 'NOT_REQUESTED' CHECK (lawyer_review_status IN ('NOT_REQUESTED','PENDING','IN_REVIEW','COMPLETED')),
  lawyer_review_id UUID,
  payment_reference TEXT,
  -- Snapshotted at DRAFT creation via calculateLegalizationFee() so a later
  -- platform rate change never alters an already-created agreement's fee.
  legalization_fee_rate NUMERIC(4,3) DEFAULT 0.08,
  legalization_fee_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER agreements_update_updated_at
  BEFORE UPDATE ON agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_agreements_landlord_id ON agreements(landlord_id);
CREATE INDEX idx_agreements_tenant_id ON agreements(tenant_id);
CREATE INDEX idx_agreements_status ON agreements(status);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  agreement_id UUID REFERENCES agreements(id),
  type TEXT NOT NULL CHECK (type IN ('TENANT_MOVE_IN_FEE','TENANT_LAWYER_REVIEW','RENTAL_HISTORY_EXPORT','LANDLORD_SUBSCRIPTION','PROVIDER_SUBSCRIPTION')),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  paystack_reference TEXT UNIQUE NOT NULL, -- legacy column name, now stores the Flutterwave tx_ref
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_paystack_reference ON payments(paystack_reference);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Rental History table
CREATE TABLE IF NOT EXISTS rental_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES users(id),
  landlord_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  property_address TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','TERMINATED_EARLY')),
  landlord_rating INT CHECK (landlord_rating BETWEEN 1 AND 5),
  tenant_rating INT CHECK (tenant_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rental_history_tenant_id ON rental_history(tenant_id);

-- Insurance interest capture (lightweight — no insurer integration yet)
CREATE TABLE IF NOT EXISTS insurance_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id),
  tenant_id UUID NOT NULL REFERENCES users(id),
  product_type TEXT NOT NULL DEFAULT 'RENT_PROTECTION' CHECK (product_type IN ('RENT_PROTECTION')),
  status TEXT NOT NULL DEFAULT 'INTERESTED' CHECK (status IN ('INTERESTED', 'CONTACTED', 'DECLINED')),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_interests_tenant_id ON insurance_interests(tenant_id);
CREATE INDEX idx_insurance_interests_agreement_id ON insurance_interests(agreement_id);

-- Service-bid marketplace: providers, jobs, bids. Generic across categories
-- so future categories (inspection, moving, tech services) reuse this
-- engine rather than needing a rebuild.
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL CHECK (category IN ('LEGAL', 'INSURANCE')),
  license_number TEXT NOT NULL,
  license_verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
  subscription_tier TEXT NOT NULL DEFAULT 'STANDARD' CHECK (subscription_tier IN ('STANDARD', 'PRIORITY')),
  -- Null or in the past means effectively STANDARD regardless of the tier
  -- column above — checked at read time rather than via a cron downgrade.
  subscription_expires_at TIMESTAMPTZ,
  -- EXTERNAL providers compete in the open bid marketplace (currently
  -- INSURANCE, and any future category). INTERNAL providers are
  -- BeyondAgency's own salaried staff (currently LEGAL) — they don't bid,
  -- they're auto-assigned jobs at a flat platform-set price. Onboarded via
  -- an admin-only endpoint, not the public /providers/apply flow.
  employment_type TEXT NOT NULL DEFAULT 'EXTERNAL' CHECK (employment_type IN ('INTERNAL', 'EXTERNAL')),
  rating NUMERIC(3,2),
  rating_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER service_providers_update_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX idx_service_providers_user_category ON service_providers(user_id, category);
CREATE INDEX idx_service_providers_category_status ON service_providers(category, status);

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

CREATE TRIGGER service_jobs_update_updated_at
  BEFORE UPDATE ON service_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_service_jobs_agreement_id ON service_jobs(agreement_id);
CREATE INDEX idx_service_jobs_category_status ON service_jobs(category, status);

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

CREATE TRIGGER service_bids_update_updated_at
  BEFORE UPDATE ON service_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX idx_service_bids_job_provider ON service_bids(job_id, provider_id);
CREATE INDEX idx_service_bids_job_id ON service_bids(job_id);
CREATE INDEX idx_service_bids_provider_id ON service_bids(provider_id);

ALTER TABLE service_jobs ADD CONSTRAINT fk_service_jobs_winning_bid
  FOREIGN KEY (winning_bid_id) REFERENCES service_bids(id);
