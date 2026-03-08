import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { env } from '#/config/env';
import { api } from '#/lib/api';
import type { CustomerFilters } from '../types';
import { customerQueryOptions, customersListQueryOptions } from '../queries';

type ListResult = { data: any[]; meta: { total: number; page: number; perPage: number; pageCount: number } };

const getApiBase = () => (env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : ''));

export function useCustomers(filters?: CustomerFilters) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    ...customersListQueryOptions(filters),
    queryKey: ['customers', filters],
  });

  const result = (data as ListResult) ?? { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };
  const customers = result.data ?? [];
  const meta = result.meta ?? { total: 0, page: 1, perPage: 20, pageCount: 0 };

  const createMutation = useMutation({
    mutationFn: async (body: { name: string; phone?: string; email?: string }) => {
      const base = getApiBase();
      const res = await fetch(`${base}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as { message?: string }).message ?? (res.status === 401 ? 'Giriş yapmanız gerekiyor.' : 'Müşteri eklenemedi.');
        throw new Error(msg);
      }
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  return {
    customers,
    meta,
    isLoading: isLoading || isFetching,
    createCustomer: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useCustomer(id: string | undefined) {
  return useQuery(customerQueryOptions(id ?? ''));
}
