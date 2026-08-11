import { supabase } from '../index';
import { Capability, CapabilityGrantReason } from '@beyond/shared';

/**
 * Capabilities are earned by action, not declared at signup.
 *
 * Grant points:
 *   LANDLORD  — first property listed        (routes/properties.ts)
 *   TENANT    — first agreement accepted     (routes/agreements.ts)
 *   PROVIDER  — provider application approved (routes/marketplace.ts)
 *
 * A route that grants a capability must not also require it, or it can never
 * be reached. See requireCapability in middleware/auth.ts.
 */

export async function getUserCapabilities(userId: string): Promise<Capability[]> {
  const { data, error } = await supabase
    .from('user_capabilities')
    .select('capability')
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to load capabilities: ${error.message}`);
  return (data ?? []).map((r) => r.capability as Capability);
}

/** Idempotent — the unique (user_id, capability) constraint absorbs repeats. */
export async function grantCapability(
  userId: string,
  capability: Capability,
  reason: CapabilityGrantReason
): Promise<void> {
  const { error } = await supabase
    .from('user_capabilities')
    .upsert(
      { user_id: userId, capability, granted_reason: reason },
      { onConflict: 'user_id,capability', ignoreDuplicates: true }
    );

  if (error) throw new Error(`Failed to grant ${capability}: ${error.message}`);
}

export async function revokeCapability(
  userId: string,
  capability: Capability
): Promise<void> {
  const { error } = await supabase
    .from('user_capabilities')
    .delete()
    .eq('user_id', userId)
    .eq('capability', capability);

  if (error) throw new Error(`Failed to revoke ${capability}: ${error.message}`);
}

export async function userHasCapability(
  userId: string,
  capability: Capability
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_capabilities')
    .select('id')
    .eq('user_id', userId)
    .eq('capability', capability)
    .maybeSingle();

  if (error) throw new Error(`Failed to check capability: ${error.message}`);
  return Boolean(data);
}
