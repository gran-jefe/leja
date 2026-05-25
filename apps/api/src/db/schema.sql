-- Leja PostgreSQL Schema

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
  role TEXT NOT NULL CHECK (role IN ('LANDLORD', 'TENANT')),
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
  type TEXT NOT NULL CHECK (type IN ('AGREEMENT_BASIC','AGREEMENT_REVIEWED','SUBSCRIPTION','RENTAL_HISTORY')),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  paystack_reference TEXT UNIQUE NOT NULL,
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
