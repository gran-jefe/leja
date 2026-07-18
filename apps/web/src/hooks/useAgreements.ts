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

// Agreements awaiting the tenant's review/acceptance (status=DRAFT). Used by
// both the landlord dashboard ("Pending Acceptance") and tenant dashboard
// ("Agreements to Review") — filtering by role happens naturally since the
// API scopes GET /agreements to the authenticated user's own agreements.
export function usePendingAgreements() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/agreements', { params: { status: 'DRAFT' } });
      setAgreements(data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load pending agreements'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { agreements, loading, error, refetch: fetchPending };
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

// Full pre-payment preview (agreement + landlord/tenant/property details +
// pricing breakdown) — GET /agreements/:id/preview.
export function useAgreementPreview(id: string) {
  const [preview, setPreview] = useState<{ agreement: any; pricing: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPreview = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/agreements/${id}/preview`);
      setPreview(data.data || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load agreement preview'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  return { preview, loading, error, refetch: fetchPreview };
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

// Tenant accepts a DRAFT agreement — POST /agreements/:id/accept, which
// returns a Flutterwave hosted payment link rather than charging inline.
export function useAcceptAgreement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const acceptAgreement = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const { data: response } = await api.post(`/agreements/${id}/accept`);
      return response.data as { paymentLink: string; reference: string; total: number; breakdown: any };
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to accept agreement'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { acceptAgreement, loading, error };
}

export function useDeclineAgreement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const declineAgreement = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const { data: response } = await api.post(`/agreements/${id}/decline`);
      return response.data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to decline agreement'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { declineAgreement, loading, error };
}
