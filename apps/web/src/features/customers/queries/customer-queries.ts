import { api } from '#/lib/api';
import { queryOptions } from '@tanstack/react-query';
import type { Customer, CustomerFilters, CustomerWithReservations } from '../types';

type Paginated = { data: Customer[]; meta: { total: number; page: number; perPage: number; pageCount: number } };

export const customersListQueryOptions = (filters?: CustomerFilters) =>
  queryOptions({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const response = await (api as any).customers.get({ query: filters || {} });
      if (response.error) throw new Error('Failed to fetch customers');
      return (response.data as Paginated) ?? { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };
    },
  });

export const customerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await (api as any).customers({ id }).get();
      if (response.error) throw new Error('Failed to fetch customer');
      return response.data as CustomerWithReservations;
    },
    enabled: !!id,
  });
