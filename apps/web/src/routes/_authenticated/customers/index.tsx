import { CustomersIndexPage, customersListQueryOptions } from '#/features/customers';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/customers/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(customersListQueryOptions({})),
  component: CustomersIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen text-muted-foreground">Yükleniyor...</div>
  ),
});
