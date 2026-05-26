-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role TEXT NOT NULL CHECK (role IN ('LANDLORD', 'TENANT')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create properties table for landlords
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  monthly_rent_kobo BIGINT,
  annual_rent_kobo BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

-- Create agreements table
CREATE TABLE IF NOT EXISTS public.agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'signed', 'active', 'terminated', 'cancelled')),
  start_date DATE,
  end_date DATE,
  monthly_rent_kobo BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_landlord_id ON public.agreements(landlord_id);
CREATE INDEX IF NOT EXISTS idx_agreements_tenant_id ON public.agreements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agreements_property_id ON public.agreements(property_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  amount_kobo BIGINT NOT NULL,
  payment_date DATE,
  payment_method TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_agreement_id ON public.payments(agreement_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Properties: users can read and update their own
CREATE POLICY "Users can read their own properties" ON public.properties
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Agreements: landlords can read agreements for their properties
CREATE POLICY "Landlords can read their agreements" ON public.agreements
  FOR SELECT USING (
    auth.uid()::text = landlord_id::text OR
    auth.uid()::text = tenant_id::text
  );
