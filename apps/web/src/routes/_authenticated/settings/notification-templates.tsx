import { NotificationTemplatesPage } from '#/features/settings/pages/NotificationTemplatesPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/notification-templates')({
  component: NotificationTemplatesPage,
});
