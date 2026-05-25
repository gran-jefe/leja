-- Leja Sample Data for Testing

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, phone, role, is_verified)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'landlord@example.com', '$2a$10$hashed_password_here', 'Adekunle Okafor', '+2348012345678', 'LANDLORD', true),
  ('550e8400-e29b-41d4-a716-446655440001', 'tenant1@example.com', '$2a$10$hashed_password_here', 'Chioma Adeyemi', '+2348087654321', 'TENANT', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'tenant2@example.com', '$2a$10$hashed_password_here', 'Emeka Nwosu', '+2349012345678', 'TENANT', true)
ON CONFLICT DO NOTHING;

-- Insert sample properties
INSERT INTO properties (
  id, landlord_id, address, city, state, property_type,
  bedrooms, bathrooms, monthly_rent, annual_rent, is_available
)
VALUES
  (
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '45 Lekki Phase 1 Road',
    'Lagos',
    'Lagos',
    'TWO_BEDROOM',
    2,
    2,
    500000.00,
    6000000.00,
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '12 Victoria Island Avenue',
    'Lagos',
    'Lagos',
    'THREE_BEDROOM',
    3,
    2,
    750000.00,
    9000000.00,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert sample agreement
INSERT INTO agreements (
  id, property_id, landlord_id, tenant_id,
  start_date, end_date, monthly_rent, annual_rent,
  status, lawyer_review_status, payment_reference
)
VALUES
  (
    '770e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-01-01',
    '2025-01-01',
    500000.00,
    6000000.00,
    'ACTIVE',
    'NOT_REQUESTED',
    'ref_12345678'
  )
ON CONFLICT DO NOTHING;

-- Insert sample rental history
INSERT INTO rental_history (
  tenant_id, landlord_id, property_id, property_address,
  start_date, end_date, status, landlord_rating, tenant_rating, notes
)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    '45 Lekki Phase 1 Road, Lagos',
    '2023-01-01',
    '2023-12-31',
    'COMPLETED',
    5,
    4,
    'Excellent tenant, paid on time'
  )
ON CONFLICT DO NOTHING;
