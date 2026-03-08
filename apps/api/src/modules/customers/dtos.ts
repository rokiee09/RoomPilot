import { type ControllerHook, errorResponseDto, uuidValidation } from '#utils';
import { paginationQueryDto, paginationResponseDto } from '#utils/pagination';
import { t } from 'elysia';

export const customerResponseDto = t.Object({
  id: t.String(),
  name: t.String(),
  phone: t.Nullable(t.String()),
  email: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

const reservationSummaryDto = t.Object({
  id: t.String(),
  entityId: t.String(),
  entity: t.Optional(
    t.Object({
      id: t.String(),
      name: t.String(),
      type: t.String(),
      city: t.String(),
    }),
  ),
  dateTime: t.Date(),
  partySize: t.Number(),
  status: t.String(),
  createdAt: t.Date(),
});

export const customerWithReservationsResponseDto = t.Composite([
  customerResponseDto,
  t.Object({
    reservations: t.Array(reservationSummaryDto),
  }),
]);

export const customerIndexDto = {
  query: t.Composite([
    paginationQueryDto,
    t.Object({
      search: t.Optional(t.String()),
      sortBy: t.Optional(t.Union([t.Literal('name'), t.Literal('createdAt'), t.Literal('updatedAt')])),
      sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
    }),
  ]),
  response: { 200: paginationResponseDto(customerResponseDto) },
  detail: { summary: 'List customers' },
} satisfies ControllerHook;

export const customerCreateDto = {
  body: t.Object({
    name: t.String({ minLength: 1, maxLength: 255 }),
    phone: t.Optional(t.String({ maxLength: 64 })),
    email: t.Optional(t.String({ maxLength: 255 })),
  }),
  response: { 200: customerResponseDto, 422: errorResponseDto[422] },
  detail: { summary: 'Create customer' },
} satisfies ControllerHook;

export const customerShowDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: customerWithReservationsResponseDto, 404: errorResponseDto[404] },
  detail: { summary: 'Get customer with reservation history' },
} satisfies ControllerHook;
