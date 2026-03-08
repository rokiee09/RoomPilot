import { type ControllerHook, errorResponseDto, uuidValidation } from '#utils';
import { paginationQueryDto, paginationResponseDto } from '#utils/pagination';
import { t } from 'elysia';

const reservationStatus = t.Union([
  t.Literal('PENDING'),
  t.Literal('APPROVED'),
  t.Literal('REJECTED'),
  t.Literal('CANCELLED'),
  t.Literal('COMPLETED'),
]);

export const reservationResponseDto = t.Object({
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
  customerId: t.Nullable(t.String()),
  customer: t.Optional(
    t.Nullable(
      t.Object({
        id: t.String(),
        name: t.String(),
        email: t.Nullable(t.String()),
        phone: t.Nullable(t.String()),
      }),
    ),
  ),
  customerName: t.String(),
  dateTime: t.Date(),
  partySize: t.Number(),
  status: reservationStatus,
  roomId: t.Optional(t.String()),
  room: t.Optional(
    t.Object({
      uuid: t.String(),
      status: t.String(),
      roomTypeName: t.String(),
    }),
  ),
  checkInTime: t.Optional(t.Date()),
  checkOutTime: t.Optional(t.Date()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const reservationCheckInInfoDto = {
  params: t.Object({ id: uuidValidation }),
  response: {
    200: t.Object({
      id: t.String(),
      customerName: t.String(),
      dateTime: t.Date(),
      partySize: t.Number(),
      status: t.String(),
      checkInTime: t.Optional(t.Date()),
      checkOutTime: t.Optional(t.Date()),
      entityName: t.Optional(t.String()),
    }),
    404: errorResponseDto[404],
  },
  detail: { summary: 'Get reservation info for QR check-in page (public)' },
} satisfies ControllerHook;

export const reservationCheckInDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({ roomId: t.Optional(t.String()) }),
  response: { 200: reservationResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Check-in reservation (optional room assign)' },
} satisfies ControllerHook;

export const reservationCheckOutDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: reservationResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Check-out reservation' },
} satisfies ControllerHook;

export const reservationIndexDto = {
  query: t.Composite([
    paginationQueryDto,
    t.Object({
      status: t.Optional(reservationStatus),
      entityId: t.Optional(t.String()),
      entityType: t.Optional(t.Union([t.Literal('HOTEL'), t.Literal('RESTAURANT')])),
      fromDate: t.Optional(t.String()),
      toDate: t.Optional(t.String()),
      sortBy: t.Optional(t.Union([t.Literal('dateTime'), t.Literal('createdAt'), t.Literal('updatedAt')])),
      sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
    }),
  ]),
  response: { 200: paginationResponseDto(reservationResponseDto) },
  detail: { summary: 'List reservations' },
} satisfies ControllerHook;

export const reservationShowDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: reservationResponseDto, 404: errorResponseDto[404] },
  detail: { summary: 'Get reservation detail' },
} satisfies ControllerHook;

export const reservationCreateDto = {
  body: t.Object({
    entityId: t.String(),
    customerName: t.String({ minLength: 1, maxLength: 255 }),
    customerEmail: t.Optional(t.String({ maxLength: 255 })),
    customerPhone: t.Optional(t.String({ maxLength: 64 })),
    dateTime: t.String(), // ISO date string
    partySize: t.Number({ minimum: 1 }),
  }),
  response: { 200: reservationResponseDto, 422: errorResponseDto[422] },
  detail: { summary: 'Create reservation' },
} satisfies ControllerHook;

export const reservationUpdateStatusDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({ status: reservationStatus }),
  response: { 200: reservationResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update reservation status' },
} satisfies ControllerHook;
