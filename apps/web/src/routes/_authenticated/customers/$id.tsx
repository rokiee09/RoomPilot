import { CustomerDetailPage, customerQueryOptions } from '#/features/customers';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/customers/$id')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(customerQueryOptions(params.id)),
  component: CustomerDetailPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen text-muted-foreground">Yükleniyor...</div>
  ),
});
