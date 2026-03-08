import { createFileRoute } from '@tanstack/react-router';
import PaymentsIndexPage from '#/features/payments/pages/PaymentsIndexPage';

export const Route = createFileRoute('/_authenticated/payments/')({
  component: PaymentsIndexPage,
});
