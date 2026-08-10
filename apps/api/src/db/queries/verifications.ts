import { supabase } from '../index';

export const createVerificationAttempt = async (data: {
  userId: string;
  tier: 1 | 2;
  method: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  providerReference?: string;
  metadata?: Record<string, unknown>;
}) => {
  const { data: record, error } = await supabase
    .from('verifications')
    .insert({
      user_id: data.userId,
      tier: data.tier,
      method: data.method,
      status: data.status,
      provider_reference: data.providerReference,
      metadata: data.metadata || {},
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to record verification attempt: ${error.message}`);
  return record;
};

// Bumps the user's tier only forward — a later Tier 1 retry never downgrades
// someone already sitting at Tier 2.
export const bumpUserVerificationTier = async (userId: string, tier: 1 | 2) => {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('verification_tier')
    .eq('id', userId)
    .single();

  if (fetchError) throw new Error(`Failed to load user for verification bump: ${fetchError.message}`);
  if ((user?.verification_tier ?? 0) >= tier) return;

  const { error } = await supabase
    .from('users')
    .update({ verification_tier: tier, is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(`Failed to update verification tier: ${error.message}`);
};

export const getUserVerificationStatus = async (userId: string) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('verification_tier')
    .eq('id', userId)
    .single();

  if (userError) throw new Error(`Failed to load verification status: ${userError.message}`);

  const { data: attempts, error: attemptsError } = await supabase
    .from('verifications')
    .select('id, tier, method, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (attemptsError) throw new Error(`Failed to load verification history: ${attemptsError.message}`);

  return { verificationTier: user?.verification_tier ?? 0, attempts: attempts || [] };
};
