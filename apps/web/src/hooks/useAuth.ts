'use client';

import { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'LANDLORD' | 'TENANT';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookie.get('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (err) {
      console.error('Failed to decode token', err);
      Cookie.remove('token');
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    Cookie.remove('token');
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
};
