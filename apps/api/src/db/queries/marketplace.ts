import { supabase } from '../index';
import { BEYOND_PRICING } from '@beyond/shared';
import { findAgreementById } from './agreements';

// Public application flow — for EXTERNAL providers only. LEGAL is staffed
// in-house (salaried, admin-onboarded via createInternalProvider below), so
// callers should reject category: 'LEGAL' before this is ever called.
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
      employment_type: 'EXTERNAL',
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to submit provider application: ${error.message}`);
  return provider;
};

// Admin-only onboarding for BeyondAgency's own salaried staff (currently
// just in-house lawyers). Goes straight to ACTIVE — there's no license
// verification step here because HR/hiring already vetted them before this
// is called; license_number is still recorded for the record.
export const createInternalProvider = async (data: {
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
      license_verified: true,
      status: 'ACTIVE',
      employment_type: 'INTERNAL',
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to onboard internal provider: ${error.message}`);
  return provider;
};

// Admin queue — external provider applications awaiting license
// verification. Joins in the applicant's name/email since the admin UI
// needs to know who they're verifying, not just a provider row.
export const findPendingProviders = async () => {
  const { data: providers, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('status', 'PENDING')
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to list pending providers: ${error.message}`);
  if (!providers || providers.length === 0) return [];

  const userIds = [...new Set(providers.map((p) => p.user_id))];
  const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  return providers.map((p) => ({ ...p, applicant: userMap.get(p.user_id) || null }));
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

// A provider's tier reads as effectively STANDARD once subscription_expires_at
// has passed, even though the tier column itself still says PRIORITY —
// avoids needing a cron to downgrade it; checked wherever tier matters.
export const effectiveSubscriptionTier = (provider: {
  subscription_tier: string;
  subscription_expires_at: string | null;
}): 'STANDARD' | 'PRIORITY' => {
  if (provider.subscription_tier !== 'PRIORITY') return 'STANDARD';
  if (!provider.subscription_expires_at) return 'STANDARD';
  return new Date(provider.subscription_expires_at) > new Date() ? 'PRIORITY' : 'STANDARD';
};

// 30-day PRIORITY window from whichever payment confirms — stacks from
// "now", not from the previous expiry, so a lapsed provider who resubscribes
// gets a clean 30 days rather than owing for the gap.
export const upgradeProviderSubscription = async (providerId: string) => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: provider, error } = await supabase
    .from('service_providers')
    .update({ subscription_tier: 'PRIORITY', subscription_expires_at: expiresAt })
    .eq('id', providerId)
    .select('*')
    .single();

  if (error) throw new Error(`Failed to upgrade provider subscription: ${error.message}`);
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

// Finds the least-loaded active internal provider in a category — a simple
// round-robin so jobs spread across the in-house team rather than all
// landing on whoever was onboarded first. "Load" is jobs won in the
// current calendar month.
const findLeastBusyInternalProvider = async (category: string) => {
  const { data: providers, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('category', category)
    .eq('employment_type', 'INTERNAL')
    .eq('status', 'ACTIVE')
    .eq('is_deleted', false);

  if (error) throw new Error(`Failed to list internal providers: ${error.message}`);
  if (!providers || providers.length === 0) return null;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const loads = await Promise.all(
    providers.map(async (p) => {
      const { count, error: countError } = await supabase
        .from('service_bids')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', p.id)
        .eq('status', 'WON')
        .gte('created_at', monthStart.toISOString());

      if (countError) throw new Error(`Failed to count provider load: ${countError.message}`);
      return { provider: p, load: count ?? 0 };
    })
  );

  loads.sort((a, b) => a.load - b.load);
  return loads[0].provider;
};

// Creates the LEGAL job for an agreement's optional lawyer-review add-on,
// once the tenant's add-on payment is confirmed, and immediately assigns
// it to whichever in-house lawyer has the lightest current load — no open
// bidding, because these are salaried staff, not independent bidders. The
// job/bid tables are reused for architectural consistency with the
// external marketplace (INSURANCE etc.), but there's no competitive window:
// a single bid is created on the assigned lawyer's behalf at the flat
// LAWYER_REVIEW_ADDON price and awarded in the same step.
//
// Falls back to the old open-bid flow only if no internal lawyer is
// available yet (e.g. before the first hire is onboarded) — this keeps a
// job from being silently lost, though in practice it'll sit unbid until
// an external LEGAL provider pool exists, which there currently isn't. Get
// at least one internal lawyer onboarded before relying on this path.
export const createAndAssignLegalReviewJob = async (agreementId: string, requesterId: string) => {
  const agreement = await findAgreementById(agreementId);
  if (!agreement) throw new Error('Agreement not found when creating lawyer review job');

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
      min_price: 0,
      max_price: BEYOND_PRICING.LAWYER_REVIEW_ADDON,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create lawyer review job: ${error.message}`);

  const assignee = await findLeastBusyInternalProvider('LEGAL');
  if (!assignee) {
    console.warn(
      `[MARKETPLACE] No internal LEGAL provider available to assign job ${job.id} — left OPEN for external fallback (none onboarded yet, see MIGRATION_NOTES.md)`
    );
    return job;
  }

  await upsertBid({
    jobId: job.id,
    providerId: assignee.id,
    price: BEYOND_PRICING.LAWYER_REVIEW_ADDON,
    turnaroundHours: 48,
  });
  await awardJob(job.id, assignee.id);

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

// Posts an INSURANCE job for an agreement once the tenant has expressed
// interest in rent-protection insurance. Unlike LEGAL, there's no in-house
// fallback — insurance genuinely requires external, licensed insurers to
// bid, so min/max price is left open (a premium quote, not a bounded fee).
export const createInsuranceJob = async (agreementId: string, requesterId: string) => {
  const bidWindowClosesAt = new Date(
    Date.now() + BEYOND_PRICING.BID_WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data: job, error } = await supabase
    .from('service_jobs')
    .insert({
      agreement_id: agreementId,
      category: 'INSURANCE',
      requester_id: requesterId,
      status: 'OPEN',
      bid_window_closes_at: bidWindowClosesAt,
      min_price: null,
      max_price: null,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create insurance job: ${error.message}`);
  return job;
};

// No cron exists to sweep and award jobs once their bid window closes (see
// MIGRATION_NOTES.md), so this is evaluated lazily on read: whenever a job
// is fetched by agreement, if its window has already passed we attempt an
// award (or expire it if it never got a single bid) right then, instead of
// leaving it OPEN forever. Cheap given how rarely this path is read.
const settleIfWindowClosed = async (job: any) => {
  if (job.status !== 'OPEN' || new Date(job.bid_window_closes_at) >= new Date()) {
    return job;
  }

  const awarded = await awardJob(job.id);
  if (awarded) {
    return { ...job, status: 'AWARDED', winning_bid_id: awarded.winningBid.id };
  }

  const { data: expired, error } = await supabase
    .from('service_jobs')
    .update({ status: 'EXPIRED' })
    .eq('id', job.id)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to expire job: ${error.message}`);
  return expired;
};

export const findJobByAgreement = async (agreementId: string, category: string) => {
  const { data: job, error } = await supabase
    .from('service_jobs')
    .select('*')
    .eq('agreement_id', agreementId)
    .eq('category', category)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to find job for agreement: ${error.message}`);
  if (!job) return null;

  const settled = await settleIfWindowClosed(job);

  if (settled.winning_bid_id) {
    const { data: winningBid } = await supabase
      .from('service_bids')
      .select('*, service_providers(id, user_id, category, rating, rating_count)')
      .eq('id', settled.winning_bid_id)
      .single();
    return { ...settled, winning_bid: winningBid || null };
  }

  return { ...settled, winning_bid: null };
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
