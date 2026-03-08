import ReservationCreatePage from '#/features/reservations/pages/ReservationCreatePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reservations/create')({
  component: ReservationCreatePage,
});
