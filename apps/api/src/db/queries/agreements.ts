import { supabase } from '../index';
import { calculateLegalizationFee } from '@beyond/shared';
import { findUserByEmail } from './users';
import { findPropertyById } from './properties';

interface CreateAgreementDraftInput {
  landlordId: string;
  propertyId: string;
  tenantEmail: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  annualRent: number;
  wantsLawyerReview: boolean;
  legalizationFeeRate?: number;
}

export class TenantNotFoundError extends Error {
  status = 404;
}

export class PropertyNotFoundError extends Error {
  status = 404;
}

export class PropertyOwnershipError extends Error {
  status = 403;
}

// Landlord-only, free draft creation — no payment involved, and the
// agreement itself is free to accept. legalization_fee_rate/amount are no
// longer computed or charged (see BEYOND_PRICING.BASE_LEGALIZATION_FEE) —
// left null for new agreements. They still exist as columns only so
// pre-pivot agreements can resolve their historical snapshotted fee.
export const createAgreementDraft = async (input: CreateAgreementDraftInput) => {
  const tenant = await findUserByEmail(input.tenantEmail);
  if (!tenant) {
    throw new TenantNotFoundError(
      "This tenant doesn't have a BeyondAgency account yet. Ask them to sign up at leja.ng first."
    );
  }

  const property = await findPropertyById(input.propertyId);
  if (!property) {
    throw new PropertyNotFoundError('Property not found');
  }
  if (property.landlord_id !== input.landlordId) {
    throw new PropertyOwnershipError('You do not own this property');
  }

  const { data: agreement, error } = await supabase
    .from('agreements')
    .insert({
      property_id: input.propertyId,
      landlord_id: input.landlordId,
      tenant_id: tenant.id,
      start_date: input.startDate,
      end_date: input.endDate,
      monthly_rent: input.monthlyRent,
      annual_rent: input.annualRent,
      status: 'DRAFT',
      lawyer_review_status: input.wantsLawyerReview ? 'PENDING' : 'NOT_REQUESTED',
      legalization_fee_rate: null,
      legalization_fee_amount: null,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create agreement: ${error.message}`);
  return agreement;
};

// Derived, not stored — a landlord flags interest via lawyer_review_status
// rather than a separate boolean column.
export const wantsLawyerReview = (agreement: { lawyer_review_status: string }) =>
  agreement.lawyer_review_status !== 'NOT_REQUESTED';

// Legacy — not used in the charging path anymore (base agreements are
// free, see BEYOND_PRICING.BASE_LEGALIZATION_FEE). Kept only to resolve
// what a pre-pivot agreement's fee snapshot actually was, e.g. for admin
// display or historical payment reconciliation. Recomputes from the
// snapshotted rate + annual rent and cross-checks against the stored
// amount — a mismatch means the row was tampered with or corrupted.
export const resolveLegalizationFee = (agreement: {
  annual_rent: number;
  legalization_fee_rate: number | null;
  legalization_fee_amount: number | null;
}): number => {
  const recomputed = calculateLegalizationFee(
    agreement.annual_rent,
    agreement.legalization_fee_rate ?? undefined
  );

  if (agreement.legalization_fee_amount == null) {
    return recomputed;
  }

  if (Math.abs(agreement.legalization_fee_amount - recomputed) > 0.01) {
    throw new Error('Legalization fee mismatch — agreement data may be corrupted');
  }

  return agreement.legalization_fee_amount;
};

const enrichAgreements = async (agreements: any[]) => {
  if (agreements.length === 0) return [];

  const propertyIds = [...new Set(agreements.map((a) => a.property_id).filter(Boolean))];
  const userIds = [...new Set(agreements.flatMap((a) => [a.landlord_id, a.tenant_id]))];

  const [{ data: properties }, { data: users }] = await Promise.all([
    propertyIds.length
      ? supabase.from('properties').select('id, address, city, state, requires_insurance').in('id', propertyIds)
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

// Side-agnostic by default: someone who lets one flat and rents another has
// agreements on both sides, and "my agreements" means all of them. Pass `side`
// only where one side is genuinely meant.
export const findAgreementsForUser = async (
  userId: string,
  status?: string,
  side?: 'LANDLORD' | 'TENANT'
) => {
  let query = supabase.from('agreements').select('*');

  if (side) {
    query = query.eq(side === 'LANDLORD' ? 'landlord_id' : 'tenant_id', userId);
  } else {
    query = query.or(`landlord_id.eq.${userId},tenant_id.eq.${userId}`);
  }

  if (status) query = query.eq('status', status);

  const { data: agreements, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list agreements: ${error.message}`);
  return enrichAgreements(agreements || []);
};

export const getAgreementsByTenantId = async (tenantId: string, status?: string) =>
  findAgreementsForUser(tenantId, status, 'TENANT');

export const getAgreementsByLandlordId = async (landlordId: string, status?: string) =>
  findAgreementsForUser(landlordId, status, 'LANDLORD');

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

// Fuller version of findAgreementById used by the pre-payment preview screen —
// includes full property details (type/bedrooms/bathrooms) rather than just
// the address summary enrichAgreements attaches.
export const getAgreementWithDetails = async (id: string) => {
  const { data: agreement, error } = await supabase
    .from('agreements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find agreement: ${error.message}`);
  }

  const [propertyResult, landlordResult, tenantResult] = await Promise.all([
    agreement.property_id
      ? supabase.from('properties').select('*').eq('id', agreement.property_id).single()
      : Promise.resolve({ data: null, error: null }),
    supabase.from('users').select('id, name, email').eq('id', agreement.landlord_id).single(),
    supabase.from('users').select('id, name, email').eq('id', agreement.tenant_id).single(),
  ]);

  return {
    ...agreement,
    property: propertyResult.data || null,
    landlord: landlordResult.data || null,
    tenant: tenantResult.data || null,
  };
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

export const updateAgreementPendingPayment = async (id: string, paymentReference: string) => {
  const { data: agreement, error } = await supabase
    .from('agreements')
    .update({ status: 'PENDING_PAYMENT', payment_reference: paymentReference })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to update agreement: ${error.message}`);
  return agreement;
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
