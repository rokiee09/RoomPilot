import { api } from '#/lib/api';
import { queryOptions } from '@tanstack/react-query';
import type { Reservation, ReservationFilters } from '../types';

type Paginated = { data: Reservation[]; meta: { total: number; page: number; perPage: number; pageCount: number } };

const emptyReservations: Paginated = { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };

export const reservationsListQueryOptions = (filters?: ReservationFilters) =>
  queryOptions({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      try {
        const response = await (api as any).reservations.get({ query: filters || {} });
        if (response.error) return emptyReservations;
        return (response.data as Paginated) ?? emptyReservations;
      } catch {
        return emptyReservations;
      }
    },
  });

export const reservationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['reservation', id],
    queryFn: async () => {
      const response = await (api as any).reservations({ id }).get();
      if (response.error) throw new Error('Failed to fetch reservation');
      return response.data as Reservation;
    },
    enabled: !!id,
  });
