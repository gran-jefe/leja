'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export function useAgreements() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAgreements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/agreements');
      setAgreements(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load agreements'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  return { agreements, loading, error, refetch: fetchAgreements };
}

export function useAgreement(id: string) {
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAgreement = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/agreements/${id}`);
      setAgreement(data.data || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load agreement'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAgreement();
  }, [fetchAgreement]);

  return { agreement, loading, error, refetch: fetchAgreement };
}

export function useCreateAgreement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createAgreement = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    try {
      const { data: response } = await api.post('/agreements', data);
      return response.data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create agreement'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createAgreement, loading, error };
}
