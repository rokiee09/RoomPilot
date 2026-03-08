import { ReservationsIndexPage, reservationsListQueryOptions } from '#/features/reservations';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reservations/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(reservationsListQueryOptions({})),
  component: ReservationsIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen text-muted-foreground">Yükleniyor...</div>
  ),
});
