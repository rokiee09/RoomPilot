import { ReservationDetailPage, reservationQueryOptions } from '#/features/reservations';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reservations/$id')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(reservationQueryOptions(params.id)),
  component: ReservationDetailPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen text-muted-foreground">Yükleniyor...</div>
  ),
});
