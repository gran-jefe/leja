import { supabase } from '../index';
import { findUserByEmail } from './users';
import { createProperty } from './properties';

interface CreateAgreementInput {
  landlordId: string;
  tenantEmail: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  annualRent: number;
  withLawyerReview: boolean;
  paymentReference: string;
}

class TenantNotFoundError extends Error {
  status = 404;
}

export const createAgreementWithProperty = async (input: CreateAgreementInput) => {
  const tenant = await findUserByEmail(input.tenantEmail);
  if (!tenant) {
    throw new TenantNotFoundError(
      'No Leja account found for this tenant email. Ask them to sign up first.'
    );
  }

  const property = await createProperty({
    landlordId: input.landlordId,
    address: input.address,
    city: input.city,
    state: input.state,
    propertyType: input.propertyType,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    monthlyRent: input.monthlyRent,
    annualRent: input.annualRent,
  });

  const { data: agreement, error } = await supabase
    .from('agreements')
    .insert({
      property_id: property.id,
      landlord_id: input.landlordId,
      tenant_id: tenant.id,
      start_date: input.startDate,
      end_date: input.endDate,
      monthly_rent: input.monthlyRent,
      annual_rent: input.annualRent,
      status: 'PENDING_PAYMENT',
      lawyer_review_status: input.withLawyerReview ? 'PENDING' : 'NOT_REQUESTED',
      payment_reference: input.paymentReference,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create agreement: ${error.message}`);

  // The Flutterwave webhook confirms payment by looking up a `payments` row
  // by reference, then flips the linked agreement to ACTIVE — without this
  // row the webhook has nothing to match against and the agreement would
  // never activate.
  const { error: paymentError } = await supabase.from('payments').insert({
    user_id: input.landlordId,
    agreement_id: agreement.id,
    type: input.withLawyerReview ? 'AGREEMENT_REVIEWED' : 'AGREEMENT_BASIC',
    amount: input.withLawyerReview ? 12000 : 3500,
    status: 'PENDING',
    paystack_reference: input.paymentReference,
  });

  if (paymentError) {
    throw new Error(`Failed to record agreement payment: ${paymentError.message}`);
  }

  return agreement;
};

const enrichAgreements = async (agreements: any[]) => {
  if (agreements.length === 0) return [];

  const propertyIds = [...new Set(agreements.map((a) => a.property_id).filter(Boolean))];
  const userIds = [...new Set(agreements.flatMap((a) => [a.landlord_id, a.tenant_id]))];

  const [{ data: properties }, { data: users }] = await Promise.all([
    propertyIds.length
      ? supabase.from('properties').select('id, address, city, state').in('id', propertyIds)
      : Promise.resolve({ data: [] as any[] }),
    supabase.from('users').select('id, name, email').in('id', userIds),
  ]);

  const propertyMap = new Map((properties || []).map((p: any) => [p.id, p]));
  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  return agreements.map((a) => ({
    ...a,
    property: propertyMap.get(a.property_id) || null,
    landlord: userMap.get(a.landlord_id) || null,
    tenant: userMap.get(a.tenant_id) || null,
  }));
};

export const findAgreementsForUser = async (userId: string, role: 'LANDLORD' | 'TENANT') => {
  const column = role === 'LANDLORD' ? 'landlord_id' : 'tenant_id';

  const { data: agreements, error } = await supabase
    .from('agreements')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list agreements: ${error.message}`);
  return enrichAgreements(agreements || []);
};

export const findAgreementById = async (id: string) => {
  const { data: agreement, error } = await supabase
    .from('agreements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find agreement: ${error.message}`);
  }

  const [enriched] = await enrichAgreements([agreement]);
  return enriched;
};

export const updateAgreementLawyerReview = async (id: string, status: string) => {
  const { data: agreement, error } = await supabase
    .from('agreements')
    .update({ lawyer_review_status: status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update agreement: ${error.message}`);
  return agreement;
};

export const updateAgreementStatus = async (id: string, status: string) => {
  const { data: agreement, error } = await supabase
    .from('agreements')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update agreement: ${error.message}`);
  return agreement;
};
