import { EntityEditPage, entityQueryOptions } from '#/features/entities';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/entities/$id')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(entityQueryOptions(params.id)),
  component: EntityEditPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen text-muted-foreground">Yükleniyor...</div>
  ),
});
