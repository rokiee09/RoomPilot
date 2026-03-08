import { type ControllerHook, errorResponseDto, uuidValidation } from '#utils';
import { t } from 'elysia';

export const siteResponseDto = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
});

const siteWithCountDto = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
  _count: t.Object({ entities: t.Number() }),
});

export const sitesIndexDto = {
  response: { 200: t.Array(siteWithCountDto) },
  detail: { summary: 'List all sites (regions)' },
} satisfies ControllerHook;

export const siteShowDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: siteResponseDto, 404: errorResponseDto[404] },
  detail: { summary: 'Get site with entities' },
} satisfies ControllerHook;

export const siteCreateDto = {
  body: t.Object({
    name: t.String({ minLength: 1, maxLength: 128 }),
    slug: t.Optional(t.String({ maxLength: 64 })),
  }),
  response: { 200: siteResponseDto, 422: errorResponseDto[422] },
  detail: { summary: 'Create site' },
} satisfies ControllerHook;

export const siteUpdateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
    slug: t.Optional(t.String({ maxLength: 64 })),
  }),
  response: { 200: siteResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update site' },
} satisfies ControllerHook;

export const siteDestroyDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Object({ deleted: t.Boolean() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete site' },
} satisfies ControllerHook;
