'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export interface PropertyPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useProperties(filters?: Record<string, unknown>) {
  const [properties, setProperties] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PropertyPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch whenever the filter *values* change, not the object identity
  // (callers often build a fresh filters object on every render).
  const filtersKey = JSON.stringify(filters || {});

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/properties', { params: filters });
      setProperties(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load properties'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, pagination, loading, error, refetch: fetchProperties };
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
