import { supabase } from '../index';

export const findRentalHistoryByTenant = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('rental_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('start_date', { ascending: false });

  if (error) throw new Error(`Failed to list rental history: ${error.message}`);
  return data;
};
