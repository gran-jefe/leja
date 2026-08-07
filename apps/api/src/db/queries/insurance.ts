import { supabase } from '../index';

export const createInsuranceInterest = async (data: {
  agreementId: string;
  tenantId: string;
  productType: string;
}) => {
  const { data: interest, error } = await supabase
    .from('insurance_interests')
    .insert({
      agreement_id: data.agreementId,
      tenant_id: data.tenantId,
      product_type: data.productType,
      status: 'INTERESTED',
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to record insurance interest: ${error.message}`);
  return interest;
};

export const findInsuranceInterestsByTenant = async (tenantId: string) => {
  const { data: interests, error } = await supabase
    .from('insurance_interests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list insurance interests: ${error.message}`);
  return interests || [];
};
