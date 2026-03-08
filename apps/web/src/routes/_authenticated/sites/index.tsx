import { createFileRoute } from '@tanstack/react-router';
import SitesIndexPage from '#/features/sites/pages/SitesIndexPage';

export const Route = createFileRoute('/_authenticated/sites/')({
  component: SitesIndexPage,
});
