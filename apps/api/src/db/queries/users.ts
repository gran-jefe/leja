import { supabase } from '../index';
import { IUser, UserRole } from '@leja/shared';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export const createUser = async (data: CreateUserInput): Promise<Omit<IUser, 'password'>> => {
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        email: data.email,
        password_hash: data.passwordHash,
        name: data.name,
        phone: data.phone || null,
        role: data.role,
        is_verified: false,
      },
    ])
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isVerified: user.is_verified,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  };
};

export const findUserByEmail = async (
  email: string
): Promise<(IUser & { passwordHash: string }) | null> => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, name, phone, role, is_verified, created_at, updated_at')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No user found
    }
    throw new Error(`Failed to find user: ${error.message}`);
  }

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.password_hash,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isVerified: user.is_verified,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  };
};

export const findUserById = async (id: string): Promise<Omit<IUser, 'password'> | null> => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No user found
    }
    throw new Error(`Failed to find user: ${error.message}`);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isVerified: user.is_verified,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  };
};

interface UpdateUserInput {
  name?: string;
  phone?: string;
}

export const updateUser = async (
  id: string,
  data: UpdateUserInput
): Promise<Omit<IUser, 'password'>> => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, email, name, phone, role, is_verified, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isVerified: user.is_verified,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  };
};
