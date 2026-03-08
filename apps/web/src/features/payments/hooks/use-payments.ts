import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { env } from '#/config/env';
import type { PaymentFilters } from '../types';
import { paymentsListQueryOptions } from '../queries/payment-queries';

type ListResult = {
  data: unknown[];
  meta: { total: number; page: number; perPage: number; pageCount: number };
};

const getBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function usePayments(filters?: PaymentFilters) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    ...paymentsListQueryOptions(filters),
    queryKey: ['payments', filters],
  });

  const result = (data as ListResult) ?? { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };
  const payments = result.data ?? [];
  const meta = result.meta ?? { total: 0, page: 1, perPage: 20, pageCount: 0 };

  const createMutation = useMutation({
    mutationFn: async (body: {
      reservationId: string;
      amount: number;
      currency?: string;
      status?: string;
      paymentMethod: string;
    }) => {
      const res = await fetch(`${getBase()}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Ödeme eklenemedi');
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  return {
    payments,
    meta,
    isLoading: isLoading || isFetching,
    createPayment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
