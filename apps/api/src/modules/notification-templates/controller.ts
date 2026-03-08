import { Elysia, t } from 'elysia';
import prisma from '@onlyjs/db';
import { auth, authSwagger } from '../auth';

const app = new Elysia({
  prefix: '/settings/notification-templates',
  detail: { tags: ['Settings'] },
})
  .guard(authSwagger, (app) =>
    app
      .use(auth())
      .get(
        '/',
        async () => {
          const list = await prisma.notificationTemplate.findMany({ orderBy: { key: 'asc' } });
          return list;
        },
        {
          response: { 200: 'application/json' },
          detail: { summary: 'List notification templates' },
        },
      )
      .post(
        '/',
        async ({ body }) => {
          return prisma.notificationTemplate.create({
            data: { key: body.key, subject: body.subject, bodyHtml: body.bodyHtml },
          });
        },
        {
          body: t.Object({
            key: t.String({ maxLength: 64 }),
            subject: t.String({ maxLength: 255 }),
            bodyHtml: t.String(),
          }),
          response: { 200: 'application/json' },
          detail: { summary: 'Create template' },
        },
      )
      .get(
        '/:key',
        async ({ params }) => {
          const t = await prisma.notificationTemplate.findUnique({ where: { key: params.key } });
          if (!t) return { error: 'Not found' };
          return t;
        },
        {
          params: t.Object({ key: t.String() }),
          response: { 200: 'application/json' },
          detail: { summary: 'Get template by key' },
        },
      )
      .put(
        '/:key',
        async ({ params, body }) => {
          const t = await prisma.notificationTemplate.upsert({
            where: { key: params.key },
            create: { key: params.key, subject: body.subject, bodyHtml: body.bodyHtml },
            update: { subject: body.subject, bodyHtml: body.bodyHtml },
          });
          return t;
        },
        {
          params: t.Object({ key: t.String() }),
          body: t.Object({
            subject: t.String({ maxLength: 255 }),
            bodyHtml: t.String(),
          }),
          response: { 200: 'application/json' },
          detail: { summary: 'Update template' },
        },
      ),
  );

export default app;
