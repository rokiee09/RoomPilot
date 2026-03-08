import { EntitiesIndexPage, entitiesListQueryOptions } from '#/features/entities';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/entities/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(entitiesListQueryOptions({})),
  component: EntitiesIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen text-muted-foreground">Yükleniyor...</div>
  ),
});
