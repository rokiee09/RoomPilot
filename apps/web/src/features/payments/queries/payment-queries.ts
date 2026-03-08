import { env } from '#/config/env';
import type { PaymentFilters } from '../types';

const getBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function paymentsListQueryOptions(filters?: PaymentFilters) {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.perPage) params.set('perPage', String(filters.perPage));
  if (filters?.reservationId) params.set('reservationId', filters.reservationId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.entityId) params.set('entityId', filters.entityId);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

  return {
    queryKey: ['payments', filters] as const,
    queryFn: async () => {
      const res = await fetch(`${getBase()}/payments?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Ödemeler yüklenemedi');
      return res.json() as Promise<{ data: unknown[]; meta: { total: number; page: number; perPage: number; pageCount: number } }>;
    },
  };
}
