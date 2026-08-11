'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

export const ADMIN_PAGE_SIZE = 50;

/**
 * admin/users, admin/agreements and admin/payments each carried their own copy
 * of this exact fetch + offset + loading/error block, along with an identical
 * pager. One hook, three call sites.
 */
export function useAdminList<T>(
  endpoint: string,
  dataKey: string,
  extraParams: Record<string, unknown> = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Serialised so the effect doesn't refire on every render from a fresh
  // object identity.
  const paramsKey = JSON.stringify(extraParams);

  const fetchPage = useCallback(
    async (pageValue: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(endpoint, {
          params: {
            ...JSON.parse(paramsKey),
            limit: ADMIN_PAGE_SIZE,
            offset: pageValue * ADMIN_PAGE_SIZE,
          },
        });
        setItems(res.data.data[dataKey] || []);
        setTotal(res.data.data.total || 0);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load'));
      } finally {
        setLoading(false);
      }
    },
    [endpoint, dataKey, paramsKey]
  );

  // Any filter change resets to the first page — paging into a filtered set
  // from page 3 would otherwise show an empty result.
  useEffect(() => {
    setPage(0);
  }, [paramsKey]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  return {
    items,
    total,
    page,
    setPage,
    loading,
    error,
    refetch: () => fetchPage(page),
  };
}
