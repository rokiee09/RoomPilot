import CustomerCreatePage from '#/features/customers/pages/CustomerCreatePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/customers/create')({
  component: CustomerCreatePage,
});
