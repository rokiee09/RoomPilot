import { AvailabilityPage } from '#/features/availability';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/availability/')({
  component: AvailabilityPage,
});
