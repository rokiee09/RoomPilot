import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '#/lib/api';
import { env } from '#/config/env';
import type { ReservationFilters, ReservationStatus } from '../types';
import { reservationQueryOptions, reservationsListQueryOptions } from '../queries';

type ListResult = { data: any[]; meta: { total: number; page: number; perPage: number; pageCount: number } };

export function useReservations(filters?: ReservationFilters) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({
    ...reservationsListQueryOptions(filters),
    queryKey: ['reservations', filters],
  });

  const result = (data as ListResult) ?? { data: [], meta: { total: 0, page: 1, perPage: 20, pageCount: 0 } };
  const reservations = result.data ?? [];
  const meta = result.meta ?? { total: 0, page: 1, perPage: 20, pageCount: 0 };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const res = await fetch(`${env.apiUrl}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', id] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: {
      entityId: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      dateTime: string;
      partySize: number;
    }) => {
      const res = await fetch(`${env.apiUrl}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? 'Rezervasyon oluşturulamadı');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async ({ id, roomId }: { id: string; roomId?: string }) => {
      const res = await fetch(`${env.apiUrl}/reservations/${id}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roomId ? { roomId } : {}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? 'Check-in yapılamadı');
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', id] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${env.apiUrl}/reservations/${id}/check-out`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? 'Check-out yapılamadı');
      }
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', id] });
    },
  });

  return {
    reservations,
    meta,
    isLoading: isLoading || isFetching,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    createReservation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    checkIn: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    checkOut: checkOutMutation.mutateAsync,
    isCheckingOut: checkOutMutation.isPending,
  };
}

export function useReservation(id: string | undefined) {
  return useQuery(reservationQueryOptions(id ?? ''));
}
