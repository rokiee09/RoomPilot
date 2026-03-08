import { type ControllerHook, errorResponseDto, uuidValidation } from '#utils';
import { paginationQueryDto, paginationResponseDto } from '#utils/pagination';
import { t } from 'elysia';

const entityType = t.Union([t.Literal('HOTEL'), t.Literal('RESTAURANT')]);
const entityStatus = t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED')]);

const siteSummaryDto = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
});

export const entityResponseDto = t.Object({
  id: t.String(),
  type: entityType,
  name: t.String(),
  description: t.Nullable(t.String()),
  city: t.String(),
  status: entityStatus,
  siteId: t.Nullable(t.String()),
  site: t.Nullable(siteSummaryDto),
  address: t.Nullable(t.String()),
  phone: t.Nullable(t.String()),
  roomCount: t.Nullable(t.Number()),
  capacity: t.Nullable(t.Number()),
  starRating: t.Nullable(t.Number()),
  cuisineType: t.Nullable(t.String()),
  expenseInfo: t.Nullable(t.String()),
  kitchenInfo: t.Nullable(t.String()),
  amenities: t.Array(t.String()),
  workingHours: t.Nullable(t.Any()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const entityIndexDto = {
  query: t.Composite([
    paginationQueryDto,
    t.Object({
      search: t.Optional(t.String()),
      city: t.Optional(t.String()),
      status: t.Optional(entityStatus),
      type: t.Optional(entityType),
      siteId: t.Optional(t.String()),
      sortBy: t.Optional(t.Union([t.Literal('name'), t.Literal('city'), t.Literal('createdAt'), t.Literal('updatedAt')])),
      sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
    }),
  ]),
  response: { 200: paginationResponseDto(entityResponseDto) },
  detail: { summary: 'List entities (hotels/restaurants)' },
} satisfies ControllerHook;

export const entityShowDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: entityResponseDto, 404: errorResponseDto[404] },
  detail: { summary: 'Get single entity' },
} satisfies ControllerHook;

export const entityCreateDto = {
  body: t.Object({
    type: entityType,
    name: t.String({ minLength: 1, maxLength: 255 }),
    description: t.Optional(t.String()),
    city: t.String({ minLength: 1, maxLength: 128 }),
    status: t.Optional(entityStatus),
    siteId: t.Optional(t.Nullable(t.String())),
    address: t.Optional(t.String({ maxLength: 512 })),
    phone: t.Optional(t.String({ maxLength: 64 })),
    roomCount: t.Optional(t.Number()),
    capacity: t.Optional(t.Number()),
    starRating: t.Optional(t.Number()),
    cuisineType: t.Optional(t.String({ maxLength: 128 })),
    expenseInfo: t.Optional(t.String()),
    kitchenInfo: t.Optional(t.String()),
    amenities: t.Optional(t.Array(t.String())),
    workingHours: t.Optional(t.Any()),
  }),
  response: { 200: entityResponseDto, 422: errorResponseDto[422] },
  detail: { summary: 'Create entity' },
} satisfies ControllerHook;

export const entityUpdateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    type: t.Optional(entityType),
    name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    description: t.Optional(t.String()),
    city: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
    status: t.Optional(entityStatus),
    siteId: t.Optional(t.Nullable(t.String())),
    address: t.Optional(t.String({ maxLength: 512 })),
    phone: t.Optional(t.String({ maxLength: 64 })),
    roomCount: t.Optional(t.Number()),
    capacity: t.Optional(t.Number()),
    starRating: t.Optional(t.Number()),
    cuisineType: t.Optional(t.String({ maxLength: 128 })),
    expenseInfo: t.Optional(t.String()),
    kitchenInfo: t.Optional(t.String()),
    amenities: t.Optional(t.Array(t.String())),
    workingHours: t.Optional(t.Any()),
  }),
  response: { 200: entityResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update entity' },
} satisfies ControllerHook;

export const entityDestroyDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Object({ message: t.String() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete entity' },
} satisfies ControllerHook;

const roomTypeKind = t.Union([t.Literal('ROOM'), t.Literal('TABLE')]);
export const roomTypeResponseDto = t.Object({
  id: t.String(),
  entityId: t.String(),
  name: t.String(),
  kind: roomTypeKind,
  capacity: t.Number(),
  quantity: t.Number(),
  pricePerNight: t.Nullable(t.Number()),
  weekendPrice: t.Nullable(t.Number()),
});

export const roomTypesIndexDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Array(roomTypeResponseDto), 404: errorResponseDto[404] },
  detail: { summary: 'List room types for entity' },
} satisfies ControllerHook;

export const roomTypeCreateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    name: t.String({ minLength: 1, maxLength: 128 }),
    kind: t.Optional(roomTypeKind),
    capacity: t.Optional(t.Number()),
    quantity: t.Optional(t.Number()),
    pricePerNight: t.Optional(t.Number()),
    weekendPrice: t.Optional(t.Number()),
  }),
  response: { 200: roomTypeResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Create room type' },
} satisfies ControllerHook;

export const roomTypeUpdateDto = {
  params: t.Object({ id: uuidValidation, rtId: t.String() }),
  body: t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
    kind: t.Optional(roomTypeKind),
    capacity: t.Optional(t.Number()),
    quantity: t.Optional(t.Number()),
    pricePerNight: t.Optional(t.Nullable(t.Number())),
    weekendPrice: t.Optional(t.Nullable(t.Number())),
  }),
  response: { 200: roomTypeResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update room type' },
} satisfies ControllerHook;

export const roomTypeDestroyDto = {
  params: t.Object({ id: uuidValidation, rtId: t.String() }),
  response: { 200: t.Object({ deleted: t.Boolean() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete room type' },
} satisfies ControllerHook;

const entityImageResponseDto = t.Object({
  id: t.String(),
  entityId: t.String(),
  url: t.String(),
  caption: t.Nullable(t.String()),
  sortOrder: t.Number(),
});

export const entityImagesIndexDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Array(entityImageResponseDto), 404: errorResponseDto[404] },
  detail: { summary: 'List entity images' },
} satisfies ControllerHook;

export const entityImageCreateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    url: t.String({ maxLength: 1024 }),
    caption: t.Optional(t.String({ maxLength: 255 })),
    sortOrder: t.Optional(t.Number()),
  }),
  response: { 200: entityImageResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Add entity image' },
} satisfies ControllerHook;

export const entityImageDestroyDto = {
  params: t.Object({ id: uuidValidation, imgId: t.String() }),
  response: { 200: t.Object({ deleted: t.Boolean() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete entity image' },
} satisfies ControllerHook;

const roomStatus = t.Union([
  t.Literal('AVAILABLE_CLEAN'),
  t.Literal('AVAILABLE_DIRTY'),
  t.Literal('RESERVED'),
  t.Literal('OCCUPIED'),
  t.Literal('STAYOVER'),
  t.Literal('OUT_OF_SERVICE'),
]);

export const roomResponseDto = t.Object({
  id: t.Number(),
  uuid: t.String(),
  roomTypeId: t.String(),
  roomType: t.Object({ id: t.String(), name: t.String(), kind: roomTypeKind }),
  guestCount: t.Number(),
  price: t.Nullable(t.Number()),
  status: roomStatus,
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const roomsIndexDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Array(roomResponseDto), 404: errorResponseDto[404] },
  detail: { summary: 'List rooms for entity' },
} satisfies ControllerHook;

const availabilityItemDto = t.Object({
  uuid: t.String(),
  roomTypeName: t.String(),
  status: t.String(),
  label: t.String(),
});

export const entityAvailabilityDto = {
  params: t.Object({ id: uuidValidation }),
  query: t.Object({ date: t.Optional(t.String()) }),
  response: { 200: t.Array(availabilityItemDto), 404: errorResponseDto[404] },
  detail: { summary: 'Get room/table availability for a date (doluluk)' },
} satisfies ControllerHook;

export const roomCreateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    roomTypeId: t.String(),
    guestCount: t.Optional(t.Number()),
    price: t.Optional(t.Number()),
    status: t.Optional(roomStatus),
    isActive: t.Optional(t.Boolean()),
  }),
  response: { 200: roomResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Create room' },
} satisfies ControllerHook;

export const roomUpdateDto = {
  params: t.Object({ id: uuidValidation, roomId: t.String() }),
  body: t.Object({
    guestCount: t.Optional(t.Number()),
    price: t.Optional(t.Nullable(t.Number())),
    status: t.Optional(roomStatus),
    isActive: t.Optional(t.Boolean()),
  }),
  response: { 200: roomResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update room' },
} satisfies ControllerHook;

export const roomDestroyDto = {
  params: t.Object({ id: uuidValidation, roomId: t.String() }),
  response: { 200: t.Object({ deleted: t.Boolean() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete room (soft)' },
} satisfies ControllerHook;

const staffResponseDto = t.Object({
  id: t.String(),
  entityId: t.String(),
  name: t.String(),
  role: t.String(),
  phone: t.Nullable(t.String()),
  email: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const staffIndexDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Array(staffResponseDto), 404: errorResponseDto[404] },
  detail: { summary: 'List staff for entity' },
} satisfies ControllerHook;

export const staffCreateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    name: t.String({ minLength: 1, maxLength: 255 }),
    role: t.String({ minLength: 1, maxLength: 128 }),
    phone: t.Optional(t.String({ maxLength: 64 })),
    email: t.Optional(t.String({ maxLength: 255 })),
  }),
  response: { 200: staffResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Create staff' },
} satisfies ControllerHook;

export const staffUpdateDto = {
  params: t.Object({ id: uuidValidation, staffId: uuidValidation }),
  body: t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    role: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
    phone: t.Optional(t.String({ maxLength: 64 })),
    email: t.Optional(t.String({ maxLength: 255 })),
  }),
  response: { 200: staffResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update staff' },
} satisfies ControllerHook;

export const staffDestroyDto = {
  params: t.Object({ id: uuidValidation, staffId: uuidValidation }),
  response: { 200: t.Object({ deleted: t.Boolean() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete staff' },
} satisfies ControllerHook;

const stockItemResponseDto = t.Object({
  id: t.String(),
  entityId: t.String(),
  name: t.String(),
  quantity: t.Number(),
  unit: t.String(),
  minQuantity: t.Nullable(t.Number()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const stockIndexDto = {
  params: t.Object({ id: uuidValidation }),
  response: { 200: t.Array(stockItemResponseDto), 404: errorResponseDto[404] },
  detail: { summary: 'List stock items for entity (restaurant)' },
} satisfies ControllerHook;

const stockItemCreateDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  quantity: t.Number({ minimum: 0 }),
  unit: t.String({ minLength: 1, maxLength: 32 }),
  minQuantity: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
});

export const stockCreateDto = {
  params: t.Object({ id: uuidValidation }),
  body: stockItemCreateDto,
  response: { 200: stockItemResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Create stock item' },
} satisfies ControllerHook;

export const stockBulkCreateDto = {
  params: t.Object({ id: uuidValidation }),
  body: t.Object({
    items: t.Array(stockItemCreateDto, { minItems: 1, maxItems: 200 }),
  }),
  response: { 200: t.Array(stockItemResponseDto), 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Create many stock items at once' },
} satisfies ControllerHook;

export const stockUpdateDto = {
  params: t.Object({ id: uuidValidation, stockId: uuidValidation }),
  body: t.Object({
    name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    quantity: t.Optional(t.Number({ minimum: 0 })),
    unit: t.Optional(t.String({ minLength: 1, maxLength: 32 })),
    minQuantity: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
  }),
  response: { 200: stockItemResponseDto, 404: errorResponseDto[404], 422: errorResponseDto[422] },
  detail: { summary: 'Update stock item' },
} satisfies ControllerHook;

export const stockDestroyDto = {
  params: t.Object({ id: uuidValidation, stockId: uuidValidation }),
  response: { 200: t.Object({ deleted: t.Boolean() }), 404: errorResponseDto[404] },
  detail: { summary: 'Delete stock item' },
} satisfies ControllerHook;
