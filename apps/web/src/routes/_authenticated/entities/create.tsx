import { EntityCreatePage } from '#/features/entities';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/entities/create')({
  component: EntityCreatePage,
});
