import { supabase } from '../index';
import { IUser, UserRole } from '@leja/shared';

type SafeUser = Omit<IUser, 'password_hash'> & { id: string };

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
}): Promise<SafeUser> {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      password_hash: data.passwordHash,
      name: data.name,
      phone: data.phone || null,
      role: data.role,
    })
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return user as unknown as SafeUser;
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
