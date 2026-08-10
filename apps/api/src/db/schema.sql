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
  -- Phase 2 (property verification/escrow): single, category-agnostic
  -- verification tier that travels with the user across every role/vertical
  -- — never re-verified per category. 0 = unverified, 1 = Tier 1 (phone +
  -- BVN/NIN), 2 = Tier 2 (liveness + document, required for escrow-backed
  -- activity). is_verified above is kept for backward compatibility with
  -- existing checks and is derived as (verification_tier >= 1).
  verification_tier SMALLINT NOT NULL DEFAULT 0 CHECK (verification_tier IN (0, 1, 2)),
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
  description TEXT,
  -- External image URLs — no upload/storage pipeline exists yet, landlords
  -- paste links to photos hosted elsewhere.
  images TEXT[] NOT NULL DEFAULT '{}',
  -- Free-text tags. Frontend offers a preset checklist of common Nigerian
  -- rental amenities plus "other" — nothing here constrains the values, so
  -- new amenities are a frontend-only change, no migration needed.
  amenities TEXT[] NOT NULL DEFAULT '{}',
  -- Landlord-set condition of tenancy, not a platform mandate: when true,
  -- rent-protection insurance is posted to the bid marketplace automatically
  -- on agreement acceptance rather than left to the tenant's opt-in
  -- checkbox. Landlord is the requester/payer — this product protects
  -- their asset, not the tenant's. Surfaced on the listing as a trust
  -- badge ("Insured Tenancy").
  requires_insurance BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  -- Phase 2 (property verification/escrow) — independent of the rental
  -- flow above; NULL/UNVERIFIED for every existing rental listing. Set by
  -- the verification/review operator (see verifications table) after a
  -- Land Registry search and, where applicable, a field check.
  title_verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (title_verification_status IN ('UNVERIFIED','PENDING','VERIFIED','REJECTED')),
  title_document_url TEXT,
  title_verified_at TIMESTAMPTZ,
  title_verified_by UUID REFERENCES users(id),
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
  payment_reference TEXT UNIQUE NOT NULL, -- our internal reference; stores the eTranzact customerID/session reference (previously the Flutterwave tx_ref, previously named paystack_reference)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_payment_reference ON payments(payment_reference);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Verifications table (Phase 2 groundwork) — one row per verification
-- attempt/check, not per user, so the history of tier upgrades and any
-- rejected attempts is auditable. See apps/api/src/lib/identity/ for the
-- provider-agnostic interface this backs (mirrors lib/payments/) — no real
-- KYC provider is wired up yet, this is schema + interface only.
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier SMALLINT NOT NULL CHECK (tier IN (1, 2)),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  -- Tier 1: phone + BVN/NIN. Tier 2: liveness + document. Kept generic
  -- (JSONB) since the exact fields depend on which KYC provider is chosen.
  method TEXT NOT NULL,
  provider_reference TEXT,
  metadata JSONB DEFAULT '{}',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);

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

-- In-app messaging: keeps a tenant's first contact with a landlord inside
-- the platform instead of bouncing them out to WhatsApp/email with no
-- record of the interaction. One thread per (tenant, landlord, property);
-- either side can reply once it exists.
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  landlord_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES users(id),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Simple per-side "seen up to" marker for an unread indicator in the
  -- inbox — no per-message read receipts, that's more than this needs.
  landlord_last_read_at TIMESTAMPTZ,
  tenant_last_read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER conversations_update_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX idx_conversations_unique_thread
  ON conversations(property_id, landlord_id, tenant_id);
CREATE INDEX idx_conversations_landlord_id ON conversations(landlord_id);
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
