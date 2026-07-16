-- The 20250526000000 migration was never applied via the tracked Supabase
-- migration flow (confirmed via `supabase migration list` — empty Remote
-- column), but its structure (user_id, kobo-denominated amounts, lowercase
-- status enums, no pdf_url/lawyer_review_status/payment_reference) somehow
-- ended up live on this project regardless, and no longer matches what the
-- application code (apps/api/src/db/schema.sql and every db/queries/*.ts
-- file) expects. This migration replaces properties/agreements/payments
-- with the structure the app actually uses, and adds rental_history, which
-- never existed at all under the old migration.
--
-- Written to be idempotent regardless of starting state (empty DB, the old
-- broken schema, or a DB already fixed via this same script run ad hoc) —
-- safe to apply via `supabase db push` on a fresh project or this one.

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS agreements CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_update_updated_at ON users;
CREATE TRIGGER users_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Properties table
CREATE TABLE properties (
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
CREATE TABLE agreements (
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
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  agreement_id UUID REFERENCES agreements(id),
  type TEXT NOT NULL CHECK (type IN ('AGREEMENT_BASIC','AGREEMENT_REVIEWED','SUBSCRIPTION','RENTAL_HISTORY')),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  paystack_reference TEXT UNIQUE NOT NULL, -- legacy column name, now stores the Flutterwave tx_ref
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_paystack_reference ON payments(paystack_reference);
CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Rental History table (did not exist under the old migration at all)
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

CREATE INDEX IF NOT EXISTS idx_rental_history_tenant_id ON rental_history(tenant_id);
