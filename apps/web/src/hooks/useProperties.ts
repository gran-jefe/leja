'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export function useProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/properties');
      setProperties(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load properties'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/properties/${id}`);
      setProperty(data.data || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load property'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { property, loading, error, refetch: fetchProperty };
}

export function useCreateProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createProperty = async (data: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/properties', data);
      router.push('/properties');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create property'));
    } finally {
      setLoading(false);
    }
  };

  return { createProperty, loading, error };
}
