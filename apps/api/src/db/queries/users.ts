import { supabase } from '../index';
import { Capability, IUser } from '@beyond/shared';
import { getUserCapabilities, grantCapability } from './capabilities';

type SafeUser = Omit<IUser, 'password_hash' | 'capabilities'> & {
  id: string;
  capabilities?: Capability[];
};

// New accounts start with NO capabilities. A user becomes a landlord by
// listing a property and a tenant by accepting an agreement — signup no
// longer asks them to pick a lane. `role` is left null; the column survives
// only for rolling-deploy compatibility.
export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
}): Promise<SafeUser> {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      password_hash: data.passwordHash,
      name: data.name,
      phone: data.phone || null,
      role: null,
    })
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return { ...(user as unknown as SafeUser), capabilities: [] };
}

/** Attaches capabilities to a user record loaded from the users table. */
export async function withCapabilities<T extends { id: string }>(user: T): Promise<T & { capabilities: Capability[] }> {
  const capabilities = await getUserCapabilities(user.id);
  return { ...user, capabilities };
}

export async function findUserByEmail(
  email: string
): Promise<(SafeUser & { password_hash: string }) | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, phone, role, is_verified, password_hash, created_at, updated_at')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error?.code === 'PGRST116') return null; // not found
  if (error) throw new Error(`Database error: ${error.message}`);
  return user as unknown as SafeUser & { password_hash: string };
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw new Error(`Database error: ${error.message}`);
  return user as unknown as SafeUser;
}

export async function updateUser(
  id: string,
  data: { name?: string; phone?: string }
): Promise<SafeUser> {
  const { data: user, error } = await supabase
    .from('users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .single();

  if (error) throw new Error(`Failed to update user: ${error.message}`);
  return user as unknown as SafeUser;
}

// Granted the moment a provider becomes ACTIVE (on verification, or
// immediately for admin-onboarded internal staff). Previously this
// *overwrote* users.role, which silently destroyed the account's landlord or
// tenant status — an insurer who was also a tenant lost access to their own
// tenancy. Granting is additive, so that can no longer happen.
//
// Note: an already-issued JWT still carries the old capability list until the
// user logs in again — this updates the database, not any live token.
export async function promoteToProviderRole(userId: string): Promise<void> {
  await grantCapability(userId, Capability.PROVIDER, 'provider_approved');
}
