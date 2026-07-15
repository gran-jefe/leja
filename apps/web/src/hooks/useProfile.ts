'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export function useProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users/profile');
      setUser(data.data?.user || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { user, loading, error, refetch: fetchProfile };
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    setLoading(true);
    setError('');
    try {
      const { data: response } = await api.patch('/users/profile', data);
      return response.data?.user || null;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}
