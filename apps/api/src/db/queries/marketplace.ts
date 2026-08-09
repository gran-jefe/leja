import { supabase } from '../index';
import { BEYOND_PRICING } from '@beyond/shared';
import { findAgreementById } from './agreements';

export const applyAsProvider = async (data: {
  userId: string;
  category: 'LEGAL' | 'INSURANCE';
  licenseNumber: string;
}) => {
  const { data: provider, error } = await supabase
    .from('service_providers')
    .insert({
      user_id: data.userId,
      category: data.category,
      license_number: data.licenseNumber,
      status: 'PENDING',
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to submit provider application: ${error.message}`);
  return provider;
};

export const findProviderById = async (id: string) => {
  const { data: provider, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find provider: ${error.message}`);
  }
  return provider;
};

export const findProviderByUserAndCategory = async (userId: string, category: string) => {
  const { data: provider, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find provider: ${error.message}`);
  }
  return provider;
};

export const verifyProvider = async (id: string) => {
  const { data: provider, error } = await supabase
    .from('service_providers')
    .update({ license_verified: true, status: 'ACTIVE' })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to verify provider: ${error.message}`);
  return provider;
};

// Creates the LEGAL service job for an agreement once the tenant's payment
// is confirmed. min/max price mirror the agreement's own negotiated
// legalization fee band so a bid can never exceed what the tenant paid for.
export const createLegalizationJob = async (agreementId: string, requesterId: string) => {
  const agreement = await findAgreementById(agreementId);
  if (!agreement) throw new Error('Agreement not found when creating legalization job');

  const bidWindowClosesAt = new Date(
    Date.now() + BEYOND_PRICING.BID_WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data: job, error } = await supabase
    .from('service_jobs')
    .insert({
      agreement_id: agreementId,
      category: 'LEGAL',
      requester_id: requesterId,
      status: 'OPEN',
      bid_window_closes_at: bidWindowClosesAt,
      min_price: BEYOND_PRICING.LEGALIZATION_FEE_FLOOR,
      max_price: agreement.legalization_fee_amount ?? BEYOND_PRICING.LEGALIZATION_FEE_CAP,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create legalization job: ${error.message}`);
  return job;
};

export const findOpenJobsForCategory = async (category: string, tier: 'STANDARD' | 'PRIORITY') => {
  let query = supabase
    .from('service_jobs')
    .select('*')
    .eq('category', category)
    .eq('status', 'OPEN')
    .eq('is_deleted', false)
    .gt('bid_window_closes_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (tier === 'STANDARD') {
    // PRIORITY-tier providers see a job immediately; STANDARD-tier providers
    // only see it after a short visibility delay.
    const visibleAfter = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    query = query.lt('created_at', visibleAfter);
  }

  const { data: jobs, error } = await query;
  if (error) throw new Error(`Failed to list open jobs: ${error.message}`);
  return jobs || [];
};

export const findJobById = async (id: string) => {
  const { data: job, error } = await supabase
    .from('service_jobs')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to find job: ${error.message}`);
  }
  return job;
};

export const upsertBid = async (data: {
  jobId: string;
  providerId: string;
  price: number;
  turnaroundHours: number;
}) => {
  const { data: bid, error } = await supabase
    .from('service_bids')
    .upsert(
      {
        job_id: data.jobId,
        provider_id: data.providerId,
        price: data.price,
        turnaround_hours: data.turnaroundHours,
        status: 'SUBMITTED',
      },
      { onConflict: 'job_id,provider_id' }
    )
    .select('*')
    .single();

  if (error) throw new Error(`Failed to submit bid: ${error.message}`);
  return bid;
};

export const findBidsForJob = async (jobId: string) => {
  const { data: bids, error } = await supabase
    .from('service_bids')
    .select('*')
    .eq('job_id', jobId)
    .eq('is_deleted', false)
    .eq('status', 'SUBMITTED')
    .order('price', { ascending: true });

  if (error) throw new Error(`Failed to list bids: ${error.message}`);
  return bids || [];
};

const notifyProviderAwarded = async (providerId: string, jobId: string) => {
  // Stub — wire to email/SMS once a notification channel exists.
  console.log(`[MARKETPLACE] Provider ${providerId} awarded job ${jobId}`);
};

// Picks the lowest qualifying bid (unless a preferred provider was
// specified), marks the job AWARDED, the winning bid WON, and every other
// bid LOST. Called from the payment webhook right after a tenant's payment
// is confirmed, so award happens immediately once the job has bids — for
// jobs with no bids yet, this is a no-op until a later retry/cron picks it
// up (not built in this pass).
export const awardJob = async (jobId: string, preferredProviderId?: string) => {
  const job = await findJobById(jobId);
  if (!job || job.status !== 'OPEN') return null;

  const bids = await findBidsForJob(jobId);
  if (bids.length === 0) return null;

  const winningBid = preferredProviderId
    ? bids.find((b) => b.provider_id === preferredProviderId) ?? bids[0]
    : bids[0];

  const { error: jobError } = await supabase
    .from('service_jobs')
    .update({ status: 'AWARDED', winning_bid_id: winningBid.id })
    .eq('id', jobId);
  if (jobError) throw new Error(`Failed to award job: ${jobError.message}`);

  const { error: winError } = await supabase
    .from('service_bids')
    .update({ status: 'WON' })
    .eq('id', winningBid.id);
  if (winError) throw new Error(`Failed to mark winning bid: ${winError.message}`);

  const otherBidIds = bids.filter((b) => b.id !== winningBid.id).map((b) => b.id);
  if (otherBidIds.length > 0) {
    const { error: loseError } = await supabase
      .from('service_bids')
      .update({ status: 'LOST' })
      .in('id', otherBidIds);
    if (loseError) throw new Error(`Failed to mark losing bids: ${loseError.message}`);
  }

  await notifyProviderAwarded(winningBid.provider_id, jobId);

  return { job: { ...job, status: 'AWARDED', winning_bid_id: winningBid.id }, winningBid };
};

export const findBidsByProvider = async (providerId: string) => {
  const { data: bids, error } = await supabase
    .from('service_bids')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list provider bids: ${error.message}`);
  return bids || [];
};
