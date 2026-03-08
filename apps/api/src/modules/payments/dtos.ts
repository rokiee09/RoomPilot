import { type ControllerHook, errorResponseDto, uuidValidation } from '#utils';
import { paginationQueryDto, paginationResponseDto } from '#utils/pagination';
import { t } from 'elysia';

const paymentStatus = t.Union([
  t.Literal('PENDING'),
  t.Literal('COMPLETED'),
  t.Literal('FAILED'),
  t.Literal('REFUNDED'),
]);
const paymentMethod = t.Union([
  t.Literal('CREDIT_CARD'),
  t.Literal('CASH'),
  t.Literal('BANK_TRANSFER'),
  t.Literal('STRIPE'),
]);

const reservationSummaryDto = t.Object({
  id: t.String(),
  customerName: t.String(),
  dateTime: t.Date(),
  status: t.String(),
  entityId: t.String(),
  entity: t.Optional(t.Object({ id: t.String(), name: t.String() })),
});

export const paymentResponseDto = t.Object({
  id: t.String(),
  reservationId: t.String(),
  amount: t.Number(),
  currency: t.String(),
  status: paymentStatus,
  paymentMethod: paymentMethod,
  createdAt: t.Date(),
  updatedAt: t.Date(),
  reservation: t.Optional(reservationSummaryDto),
});

export const paymentIndexDto = {
  query: t.Composite([
    paginationQueryDto,
    t.Object({
      reservationId: t.Optional(t.String()),
      status: t.Optional(paymentStatus),
      entityId: t.Optional(t.String()),
      sortBy: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('updatedAt'), t.Literal('amount')])),
      sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
    }),
  ]),
  response: { 200: paginationResponseDto(paymentResponseDto) },
  detail: { summary: 'List payments' },
} satisfies ControllerHook;

export const paymentShowDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: paymentResponseDto, 404: errorResponseDto[404] },
  detail: { summary: 'Get payment' },
} satisfies ControllerHook;

export const paymentCreateDto = {
  body: t.Object({
    reservationId: t.String(),
    amount: t.Number({ minimum: 0 }),
    currency: t.Optional(t.String({ maxLength: 3 })),
    status: t.Optional(paymentStatus),
    paymentMethod: paymentMethod,
  }),
  response: { 200: paymentResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Create payment' },
} satisfies ControllerHook;

export const paymentUpdateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    status: t.Optional(paymentStatus),
    amount: t.Optional(t.Number({ minimum: 0 })),
  }),
  response: { 200: paymentResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update payment' },
} satisfies ControllerHook;
