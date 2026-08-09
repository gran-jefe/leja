import { supabase } from '../index';

const DEFAULT_LIMIT = 50;

export const listUsers = async (params: { search?: string; limit?: number; offset?: number }) => {
  let query = supabase
    .from('users')
    .select('id, email, name, phone, role, is_verified, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.search) {
    query = query.or(`email.ilike.%${params.search}%,name.ilike.%${params.search}%`);
  }

  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = params.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list users: ${error.message}`);
  return { users: data || [], total: count ?? 0 };
};

export const listAgreements = async (params: { status?: string; limit?: number; offset?: number }) => {
  let query = supabase
    .from('agreements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);

  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = params.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data: agreements, error, count } = await query;
  if (error) throw new Error(`Failed to list agreements: ${error.message}`);
  if (!agreements || agreements.length === 0) return { agreements: [], total: count ?? 0 };

  const userIds = [...new Set(agreements.flatMap((a: any) => [a.landlord_id, a.tenant_id]))];
  const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  return {
    agreements: agreements.map((a: any) => ({
      ...a,
      landlord: userMap.get(a.landlord_id) || null,
      tenant: userMap.get(a.tenant_id) || null,
    })),
    total: count ?? 0,
  };
};

export const listPayments = async (params: { status?: string; type?: string; limit?: number; offset?: number }) => {
  let query = supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.type) query = query.eq('type', params.type);

  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = params.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data: payments, error, count } = await query;
  if (error) throw new Error(`Failed to list payments: ${error.message}`);
  if (!payments || payments.length === 0) return { payments: [], total: count ?? 0 };

  const userIds = [...new Set(payments.map((p: any) => p.user_id))];
  const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  return {
    payments: payments.map((p: any) => ({ ...p, user: userMap.get(p.user_id) || null })),
    total: count ?? 0,
  };
};

// Cheap counts for the admin overview — head-only queries (no row data
// transferred), fine to run all of these on every /admin visit.
export const getAdminStats = async () => {
  const countOf = async (table: string, filters?: (q: any) => any) => {
    let query = supabase.from(table).select('id', { count: 'exact', head: true });
    if (filters) query = filters(query);
    const { count, error } = await query;
    if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
    return count ?? 0;
  };

  const [
    totalUsers,
    totalLandlords,
    totalTenants,
    totalProperties,
    activeAgreements,
    draftAgreements,
    pendingProviders,
    activeProviders,
    successfulPayments,
  ] = await Promise.all([
    countOf('users'),
    countOf('users', (q) => q.eq('role', 'LANDLORD')),
    countOf('users', (q) => q.eq('role', 'TENANT')),
    countOf('properties', (q) => q.eq('is_deleted', false)),
    countOf('agreements', (q) => q.eq('status', 'ACTIVE')),
    countOf('agreements', (q) => q.eq('status', 'DRAFT')),
    countOf('service_providers', (q) => q.eq('status', 'PENDING')),
    countOf('service_providers', (q) => q.eq('status', 'ACTIVE')),
    countOf('payments', (q) => q.eq('status', 'SUCCESS')),
  ]);

  const { data: revenueRows, error: revenueError } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'SUCCESS');
  if (revenueError) throw new Error(`Failed to sum payments: ${revenueError.message}`);
  const totalRevenue = (revenueRows || []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);

  return {
    totalUsers,
    totalLandlords,
    totalTenants,
    totalProperties,
    activeAgreements,
    draftAgreements,
    pendingProviders,
    activeProviders,
    successfulPayments,
    totalRevenue,
  };
};
