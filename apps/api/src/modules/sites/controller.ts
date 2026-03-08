import { Elysia } from 'elysia';
import { auth, authSwagger } from '../auth';
import {
  siteCreateDto,
  siteDestroyDto,
  siteShowDto,
  siteUpdateDto,
  sitesIndexDto,
} from './dtos';
import { SitesService } from './service';

function siteToResponse(s: { id: string; name: string; slug: string }) {
  return { id: s.id, name: s.name, slug: s.slug };
}

const app = new Elysia({
  prefix: '/sites',
  detail: { tags: ['Sites'] },
})
  .guard(authSwagger, (app) =>
    app
      .use(auth())
      .get(
        '/',
        async () => {
          const list = await SitesService.index();
          return list.map((s) => ({ ...siteToResponse(s), _count: s._count }));
        },
        sitesIndexDto,
      )
      .get(
        '/:id',
        async ({ params }) => {
          const site = await SitesService.show(params.id);
          return siteToResponse(site);
        },
        siteShowDto,
      )
      .post(
        '/',
        async ({ body }) => {
          const site = await SitesService.store({
            name: body.name,
            slug: body.slug ?? body.name.trim().toLowerCase().replace(/\s+/g, '-'),
          });
          return siteToResponse(site);
        },
        siteCreateDto,
      )
      .put(
        '/:id',
        async ({ params, body }) => {
          const site = await SitesService.update(params.id, body);
          return siteToResponse(site);
        },
        siteUpdateDto,
      )
      .delete(
        '/:id',
        async ({ params }) => {
          await SitesService.destroy(params.id);
          return { deleted: true };
        },
        siteDestroyDto,
      ),
  );

export default app;
