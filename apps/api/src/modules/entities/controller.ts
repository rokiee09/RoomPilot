import { Elysia } from 'elysia';
import { PaginationService } from '#utils/pagination';
import { auth, authSwagger } from '../auth';
import {
  entityAvailabilityDto,
  entityCreateDto,
  entityDestroyDto,
  entityImageCreateDto,
  entityImageDestroyDto,
  entityImagesIndexDto,
  entityIndexDto,
  entityShowDto,
  entityUpdateDto,
  roomCreateDto,
  roomDestroyDto,
  roomTypeCreateDto,
  roomTypeDestroyDto,
  roomTypesIndexDto,
  roomTypeUpdateDto,
  roomsIndexDto,
  roomUpdateDto,
  staffCreateDto,
  staffDestroyDto,
  staffIndexDto,
  staffUpdateDto,
  stockBulkCreateDto,
  stockCreateDto,
  stockDestroyDto,
  stockIndexDto,
  stockUpdateDto,
} from './dtos';
import { EntityFormatter } from './formatters';
import { EntitiesService } from './service';

function roomTypeToResponse(rt: { id: string; entityId: string; name: string; kind: string; capacity: number; quantity: number; pricePerNight: unknown; weekendPrice?: unknown }) {
  return {
    id: rt.id,
    entityId: rt.entityId,
    name: rt.name,
    kind: rt.kind,
    capacity: rt.capacity,
    quantity: rt.quantity,
    pricePerNight: rt.pricePerNight != null ? Number(rt.pricePerNight) : null,
    weekendPrice: rt.weekendPrice != null ? Number(rt.weekendPrice) : null,
  };
}

function roomToResponse(r: {
  id: number;
  uuid: string;
  roomTypeId: string;
  roomType: { id: string; name: string; kind: string };
  guestCount: number;
  price: unknown;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: r.id,
    uuid: r.uuid,
    roomTypeId: r.roomTypeId,
    roomType: r.roomType,
    guestCount: r.guestCount,
    price: r.price != null ? Number(r.price) : null,
    status: r.status,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

const app = new Elysia({
  prefix: '/entities',
  detail: { tags: ['Entities'] },
})
  .guard(authSwagger, (app) =>
    app
      .use(auth())
      .get(
        '/',
        async ({ query }) => {
          const { data, total } = await EntitiesService.index(query);
          return PaginationService.createPaginatedResponse({
            data,
            total,
            query,
            formatter: EntityFormatter.response,
          });
        },
        entityIndexDto,
      )
      .get(
        '/low-stock-alerts',
        async () => {
          const alerts = await EntitiesService.getLowStockAlerts();
          return alerts.map((a) => ({
            ...a,
            quantity: Number(a.quantity),
            minQuantity: a.minQuantity != null ? Number(a.minQuantity) : null,
          }));
        },
        { detail: { summary: 'Get low stock alerts across entities' } },
      )
      .get(
        '/:id',
        async ({ params }) => {
          const entity = await EntitiesService.show(params.id);
          return EntityFormatter.response(entity);
        },
        entityShowDto,
      )
      .post(
        '/',
        async ({ body }) => {
          const entity = await EntitiesService.store(body);
          return EntityFormatter.response(entity);
        },
        entityCreateDto,
      )
      .put(
        '/:id',
        async ({ params, body }) => {
          const entity = await EntitiesService.update(params.id, body);
          return EntityFormatter.response(entity);
        },
        entityUpdateDto,
      )
      .delete(
        '/:id',
        async ({ params }) => {
          await EntitiesService.destroy(params.id);
          return { message: 'İşletme silindi' };
        },
        entityDestroyDto,
      )
      .get(
        '/:id/room-types',
        async ({ params }) => {
          const list = await EntitiesService.getRoomTypes(params.id);
          return list.map(roomTypeToResponse);
        },
        roomTypesIndexDto,
      )
      .post(
        '/:id/room-types',
        async ({ params, body }) => {
          const rt = await EntitiesService.createRoomType(params.id, body);
          return roomTypeToResponse(rt);
        },
        roomTypeCreateDto,
      )
      .put(
        '/:id/room-types/:rtId',
        async ({ params, body }) => {
          const rt = await EntitiesService.updateRoomType(params.id, params.rtId, body);
          return roomTypeToResponse(rt);
        },
        roomTypeUpdateDto,
      )
      .delete(
        '/:id/room-types/:rtId',
        async ({ params }) => {
          await EntitiesService.deleteRoomType(params.id, params.rtId);
          return { deleted: true };
        },
        roomTypeDestroyDto,
      )
      .get(
        '/:id/rooms',
        async ({ params }) => {
          const list = await EntitiesService.getRooms(params.id);
          return list.map(roomToResponse);
        },
        roomsIndexDto,
      )
      .get(
        '/:id/availability',
        async ({ params, query }) => {
          const date = query.date ?? new Date().toISOString().slice(0, 10);
          return EntitiesService.getAvailability(params.id, date);
        },
        entityAvailabilityDto,
      )
      .post(
        '/:id/rooms',
        async ({ params, body }) => {
          const room = await EntitiesService.createRoom(params.id, body);
          return roomToResponse(room);
        },
        roomCreateDto,
      )
      .put(
        '/:id/rooms/:roomId',
        async ({ params, body }) => {
          const room = await EntitiesService.updateRoom(params.id, params.roomId, body);
          return roomToResponse(room);
        },
        roomUpdateDto,
      )
      .delete(
        '/:id/rooms/:roomId',
        async ({ params }) => {
          await EntitiesService.deleteRoom(params.id, params.roomId);
          return { deleted: true };
        },
        roomDestroyDto,
      )
      .get(
        '/:id/staff',
        async ({ params }) => EntitiesService.getStaff(params.id),
        staffIndexDto,
      )
      .post(
        '/:id/staff',
        async ({ params, body }) => EntitiesService.createStaff(params.id, body),
        staffCreateDto,
      )
      .put(
        '/:id/staff/:staffId',
        async ({ params, body }) => EntitiesService.updateStaff(params.id, params.staffId, body),
        staffUpdateDto,
      )
      .delete(
        '/:id/staff/:staffId',
        async ({ params }) => {
          await EntitiesService.deleteStaff(params.id, params.staffId);
          return { deleted: true };
        },
        staffDestroyDto,
      )
      .get(
        '/:id/stock',
        async ({ params }) => {
          const list = await EntitiesService.getStock(params.id);
          return list.map((s) => ({
            id: s.id,
            entityId: s.entityId,
            name: s.name,
            quantity: Number(s.quantity),
            unit: s.unit,
            minQuantity: s.minQuantity != null ? Number(s.minQuantity) : null,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          }));
        },
        stockIndexDto,
      )
      .post(
        '/:id/stock/bulk',
        async ({ params, body }) => {
          const created = await EntitiesService.createStockBulk(params.id, body.items);
          return created.map((item) => ({
            id: item.id,
            entityId: item.entityId,
            name: item.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            minQuantity: item.minQuantity != null ? Number(item.minQuantity) : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
        },
        stockBulkCreateDto,
      )
      .post(
        '/:id/stock',
        async ({ params, body }) => {
          const item = await EntitiesService.createStock(params.id, body);
          return {
            id: item.id,
            entityId: item.entityId,
            name: item.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            minQuantity: item.minQuantity != null ? Number(item.minQuantity) : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        },
        stockCreateDto,
      )
      .put(
        '/:id/stock/:stockId',
        async ({ params, body }) => {
          const item = await EntitiesService.updateStock(params.id, params.stockId, body);
          return {
            id: item.id,
            entityId: item.entityId,
            name: item.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            minQuantity: item.minQuantity != null ? Number(item.minQuantity) : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        },
        stockUpdateDto,
      )
      .delete(
        '/:id/stock/:stockId',
        async ({ params }) => {
          await EntitiesService.deleteStock(params.id, params.stockId);
          return { deleted: true };
        },
        stockDestroyDto,
      )
      .get(
        '/:id/images',
        async ({ params }) => EntitiesService.getImages(params.id),
        entityImagesIndexDto,
      )
      .post(
        '/:id/images',
        async ({ params, body }) => EntitiesService.addImage(params.id, body),
        entityImageCreateDto,
      )
      .delete(
        '/:id/images/:imgId',
        async ({ params }) => {
          await EntitiesService.deleteImage(params.id, params.imgId);
          return { deleted: true };
        },
        entityImageDestroyDto,
      )
      .get(
        '/:id/campaigns',
        async ({ params }) => {
          const list = await EntitiesService.getCampaigns(params.id);
          return list.map((c) => ({
            ...c,
            discountPercent: c.discountPercent != null ? Number(c.discountPercent) : null,
          }));
        },
        { detail: { summary: 'List campaigns for entity' } },
      )
      .post(
        '/:id/campaigns',
        async ({ params, body }) => EntitiesService.createCampaign(params.id, body as any),
        { body: 'json', detail: { summary: 'Create campaign' } },
      )
      .get(
        '/:id/expenses',
        async ({ params }) => {
          const list = await EntitiesService.getExpenses(params.id);
          return list.map((e) => ({
            ...e,
            quantity: Number(e.quantity),
            amount: Number(e.amount),
          }));
        },
        { detail: { summary: 'List expenses/supply orders for entity' } },
      )
      .post(
        '/:id/expenses',
        async ({ params, body }) => EntitiesService.createExpense(params.id, body as any),
        { body: 'json', detail: { summary: 'Create expense' } },
      )
      .get(
        '/:id/equipment',
        async ({ params }) => EntitiesService.getEquipment(params.id),
        { detail: { summary: 'List equipment for entity' } },
      )
      .get(
        '/:id/financials',
        async ({ params }) => {
          const f = await EntitiesService.getFinancials(params.id);
          return {
            ...f,
            totalRevenue: Number(f.totalRevenue),
            totalExpenses: Number(f.totalExpenses),
            profit: Number(f.profit),
            occupancyRate: f.occupancyRate,
            stockSummary: f.stockSummary,
            campaigns: f.campaigns,
            chartData: f.chartData.map((r) => ({
              ...r,
              revenue: Number(r.revenue),
              expenses: Number(r.expenses),
              profit: Number(r.profit),
            })),
          };
        },
        { detail: { summary: 'Get entity financials (revenue, expenses, profit)' } },
      )
      .post(
        '/:id/equipment',
        async ({ params, body }) => EntitiesService.createEquipment(params.id, body as any),
        { body: 'json', detail: { summary: 'Create equipment' } },
      )
      .put(
        '/:id/equipment/:equipId',
        async ({ params, body }) => EntitiesService.updateEquipment(params.id, params.equipId, body as any),
        { body: 'json', detail: { summary: 'Update equipment' } },
      ),
  );

export default app;
