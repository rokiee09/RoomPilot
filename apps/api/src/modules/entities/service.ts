import { NotFoundException } from '#utils/http-errors';
import type { PaginationQuery } from '#utils/pagination';
import prisma from '@onlyjs/db';
import { Prisma } from '@onlyjs/db/client';
import { PrismaClientKnownRequestError } from '@onlyjs/db/client/runtime/library';
import type { EntityCreatePayload, EntityUpdatePayload } from './types';

export abstract class EntitiesService {
  static async index(
    query: PaginationQuery & {
      search?: string;
      city?: string;
      status?: string;
      type?: string;
      siteId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<{ data: Awaited<ReturnType<typeof prisma.entity.findMany>>; total: number }> {
    const { page = 1, perPage = 20, search, city, status, type, siteId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.EntityWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }
    if (city) where.city = { equals: city, mode: Prisma.QueryMode.insensitive };
    if (status) where.status = status as 'DRAFT' | 'PUBLISHED';
    if (type) where.type = type as 'HOTEL' | 'RESTAURANT';
    if (siteId) where.siteId = siteId;

    const orderBy: Prisma.EntityOrderByWithRelationInput =
      sortBy === 'name' ? { name: sortOrder } : sortBy === 'city' ? { city: sortOrder } : { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: { site: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.entity.count({ where }),
    ]);

    return { data, total };
  }

  static async show(id: string) {
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: { site: { select: { id: true, name: true, slug: true } } },
    });
    if (!entity) throw new NotFoundException('İşletme bulunamadı');
    return entity;
  }

  static async store(data: EntityCreatePayload) {
    return prisma.entity.create({
      data: {
        type: data.type as 'HOTEL' | 'RESTAURANT',
        name: data.name,
        description: data.description ?? null,
        city: data.city,
        status: (data.status ?? 'DRAFT') as 'DRAFT' | 'PUBLISHED',
        siteId: data.siteId ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
        roomCount: data.roomCount ?? null,
        capacity: data.capacity ?? null,
        starRating: data.starRating ?? null,
        cuisineType: data.cuisineType ?? null,
        expenseInfo: data.expenseInfo ?? null,
        kitchenInfo: data.kitchenInfo ?? null,
        amenities: data.amenities ?? [],
        workingHours: data.workingHours ?? undefined,
      },
    });
  }

  static async update(id: string, data: EntityUpdatePayload) {
    try {
      return await prisma.entity.update({
        where: { id },
        data: {
          ...(data.type && { type: data.type as 'HOTEL' | 'RESTAURANT' }),
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.city && { city: data.city }),
          ...(data.status && { status: data.status as 'DRAFT' | 'PUBLISHED' }),
          ...(data.siteId !== undefined && { siteId: data.siteId }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.roomCount !== undefined && { roomCount: data.roomCount }),
          ...(data.capacity !== undefined && { capacity: data.capacity }),
          ...(data.starRating !== undefined && { starRating: data.starRating }),
          ...(data.cuisineType !== undefined && { cuisineType: data.cuisineType }),
          ...(data.expenseInfo !== undefined && { expenseInfo: data.expenseInfo }),
          ...(data.kitchenInfo !== undefined && { kitchenInfo: data.kitchenInfo }),
          ...(data.amenities !== undefined && { amenities: data.amenities }),
          ...(data.workingHours !== undefined && { workingHours: data.workingHours as object }),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('İşletme bulunamadı');
      }
      throw error;
    }
  }

  static async destroy(id: string) {
    try {
      await prisma.entity.delete({ where: { id } });
      return { deleted: true };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('İşletme bulunamadı');
      }
      throw error;
    }
  }

  static async getRoomTypes(entityId: string) {
    await this.show(entityId);
    return prisma.roomType.findMany({
      where: { entityId },
      orderBy: { name: 'asc' },
    });
  }

  static async createRoomType(
    entityId: string,
    data: { name: string; kind: 'ROOM' | 'TABLE'; capacity?: number; quantity?: number; pricePerNight?: number; weekendPrice?: number },
  ) {
    await this.show(entityId);
    return prisma.roomType.create({
      data: {
        entityId,
        name: data.name,
        kind: data.kind as 'ROOM' | 'TABLE',
        capacity: data.capacity ?? 1,
        quantity: data.quantity ?? 1,
        pricePerNight: data.pricePerNight != null ? data.pricePerNight : null,
        weekendPrice: data.weekendPrice != null ? data.weekendPrice : null,
      },
    });
  }

  static async updateRoomType(
    entityId: string,
    rtId: string,
    data: { name?: string; kind?: 'ROOM' | 'TABLE'; capacity?: number; quantity?: number; pricePerNight?: number | null; weekendPrice?: number | null },
  ) {
    const rt = await prisma.roomType.findFirst({ where: { id: rtId, entityId } });
    if (!rt) throw new NotFoundException('Oda/masa tipi bulunamadı');
    return prisma.roomType.update({
      where: { id: rtId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.kind && { kind: data.kind as 'ROOM' | 'TABLE' }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.pricePerNight !== undefined && { pricePerNight: data.pricePerNight }),
        ...(data.weekendPrice !== undefined && { weekendPrice: data.weekendPrice }),
      },
    });
  }

  static async deleteRoomType(entityId: string, rtId: string) {
    const rt = await prisma.roomType.findFirst({ where: { id: rtId, entityId } });
    if (!rt) throw new NotFoundException('Oda/masa tipi bulunamadı');
    await prisma.roomType.delete({ where: { id: rtId } });
    return { deleted: true };
  }

  static async getImages(entityId: string) {
    await this.show(entityId);
    return prisma.entityImage.findMany({
      where: { entityId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async addImage(entityId: string, data: { url: string; caption?: string; sortOrder?: number }) {
    await this.show(entityId);
    const maxOrder = await prisma.entityImage.aggregate({
      where: { entityId },
      _max: { sortOrder: true },
    });
    return prisma.entityImage.create({
      data: {
        entityId,
        url: data.url,
        caption: data.caption ?? null,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  static async deleteImage(entityId: string, imgId: string) {
    const img = await prisma.entityImage.findFirst({ where: { id: imgId, entityId } });
    if (!img) throw new NotFoundException('Görsel bulunamadı');
    await prisma.entityImage.delete({ where: { id: imgId } });
    return { deleted: true };
  }

  static async getRooms(entityId: string) {
    await this.show(entityId);
    return prisma.room.findMany({
      where: { deletedAt: null, roomType: { entityId } },
      include: { roomType: { select: { id: true, name: true, kind: true } } },
      orderBy: [{ roomType: { name: 'asc' } }, { id: 'asc' }],
    });
  }

  /** Seçilen tarih için oda/masa doluluk listesi (Room 101 ✔ boş, Room 102 ❌ dolu, vb.) */
  static async getAvailability(entityId: string, dateStr: string) {
    await this.show(entityId);
    const date = new Date(dateStr);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    const isToday =
      dayStart <= new Date() && dayEnd >= new Date();

    const rooms = await prisma.room.findMany({
      where: { deletedAt: null, roomType: { entityId } },
      include: { roomType: { select: { id: true, name: true, kind: true } } },
      orderBy: [{ roomType: { name: 'asc' } }, { id: 'asc' }],
    });

    const reservationsOnDay = await prisma.reservation.findMany({
      where: {
        entityId,
        roomId: { not: null },
        checkInTime: { not: null, lte: dayEnd },
        OR: [
          { checkOutTime: { gte: dayStart } },
          { checkOutTime: null },
        ],
      },
      select: { roomId: true },
    });
    const occupiedRoomIds = new Set((reservationsOnDay.map((r) => r.roomId).filter(Boolean) as string[]));

    return rooms.map((r) => {
      let status = r.status;
      if (occupiedRoomIds.has(r.uuid)) status = 'OCCUPIED';
      else if (!isToday) status = 'AVAILABLE_CLEAN';
      const label =
        status === 'AVAILABLE_CLEAN'
          ? 'boş'
          : status === 'OCCUPIED'
            ? 'dolu'
            : status === 'AVAILABLE_DIRTY'
              ? 'temizlik'
              : status === 'RESERVED'
                ? 'rezerve'
                : status === 'OUT_OF_SERVICE'
                  ? 'bakımda'
                  : status;
      return {
        uuid: r.uuid,
        roomTypeName: r.roomType.name,
        status,
        label,
      };
    });
  }

  static async createRoom(
    entityId: string,
    data: {
      roomTypeId: string;
      guestCount?: number;
      price?: number;
      status?: string;
      isActive?: boolean;
    },
  ) {
    const rt = await prisma.roomType.findFirst({ where: { id: data.roomTypeId, entityId } });
    if (!rt) throw new NotFoundException('Oda tipi bulunamadı');
    return prisma.room.create({
      data: {
        roomTypeId: data.roomTypeId,
        guestCount: data.guestCount ?? 0,
        price: data.price != null ? data.price : null,
        status: (data.status as 'AVAILABLE_CLEAN' | 'AVAILABLE_DIRTY' | 'RESERVED' | 'OCCUPIED' | 'STAYOVER' | 'OUT_OF_SERVICE') ?? 'AVAILABLE_CLEAN',
        isActive: data.isActive ?? true,
      },
      include: { roomType: { select: { id: true, name: true, kind: true } } },
    });
  }

  static async updateRoom(
    entityId: string,
    roomId: string,
    data: { guestCount?: number; price?: number | null; status?: string; isActive?: boolean },
  ) {
    const room = await prisma.room.findFirst({
      where: { uuid: roomId, deletedAt: null, roomType: { entityId } },
      include: { roomType: true },
    });
    if (!room) throw new NotFoundException('Oda bulunamadı');
    return prisma.room.update({
      where: { id: room.id },
      data: {
        ...(data.guestCount !== undefined && { guestCount: data.guestCount }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.status && {
          status: data.status as 'AVAILABLE_CLEAN' | 'AVAILABLE_DIRTY' | 'RESERVED' | 'OCCUPIED' | 'STAYOVER' | 'OUT_OF_SERVICE',
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: { roomType: { select: { id: true, name: true, kind: true } } },
    });
  }

  static async deleteRoom(entityId: string, roomId: string) {
    const room = await prisma.room.findFirst({
      where: { uuid: roomId, deletedAt: null, roomType: { entityId } },
    });
    if (!room) throw new NotFoundException('Oda bulunamadı');
    await prisma.room.update({
      where: { id: room.id },
      data: { deletedAt: new Date() },
    });
    return { deleted: true };
  }

  static async getStaff(entityId: string) {
    await this.show(entityId);
    return prisma.staff.findMany({
      where: { entityId },
      orderBy: { name: 'asc' },
    });
  }

  static async createStaff(
    entityId: string,
    data: { name: string; role: string; phone?: string; email?: string },
  ) {
    await this.show(entityId);
    return prisma.staff.create({
      data: {
        entityId,
        name: data.name,
        role: data.role,
        phone: data.phone ?? null,
        email: data.email ?? null,
      },
    });
  }

  static async updateStaff(
    entityId: string,
    staffId: string,
    data: { name?: string; role?: string; phone?: string; email?: string },
  ) {
    const staff = await prisma.staff.findFirst({ where: { id: staffId, entityId } });
    if (!staff) throw new NotFoundException('Çalışan bulunamadı');
    return prisma.staff.update({
      where: { id: staffId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });
  }

  static async deleteStaff(entityId: string, staffId: string) {
    const staff = await prisma.staff.findFirst({ where: { id: staffId, entityId } });
    if (!staff) throw new NotFoundException('Çalışan bulunamadı');
    await prisma.staff.delete({ where: { id: staffId } });
    return { deleted: true };
  }

  static async getStock(entityId: string) {
    await this.show(entityId);
    return prisma.stockItem.findMany({
      where: { entityId },
      orderBy: { name: 'asc' },
    });
  }

  static async createStock(
    entityId: string,
    data: { name: string; quantity: number; unit: string; minQuantity?: number },
  ) {
    await this.show(entityId);
    return prisma.stockItem.create({
      data: {
        entityId,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        minQuantity: data.minQuantity != null ? data.minQuantity : null,
      },
    });
  }

  static async createStockBulk(
    entityId: string,
    items: Array<{ name: string; quantity: number; unit: string; minQuantity?: number | null }>,
  ) {
    await this.show(entityId);
    if (!items.length) return [];
    const created = await prisma.$transaction(
      items.map((item) =>
        prisma.stockItem.create({
          data: {
            entityId,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            minQuantity: item.minQuantity != null ? item.minQuantity : null,
          },
        }),
      ),
    );
    return created;
  }

  static async updateStock(
    entityId: string,
    stockId: string,
    data: { name?: string; quantity?: number; unit?: string; minQuantity?: number | null },
  ) {
    const item = await prisma.stockItem.findFirst({ where: { id: stockId, entityId } });
    if (!item) throw new NotFoundException('Stok kalemi bulunamadı');
    return prisma.stockItem.update({
      where: { id: stockId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.unit && { unit: data.unit }),
        ...(data.minQuantity !== undefined && { minQuantity: data.minQuantity }),
      },
    });
  }

  static async deleteStock(entityId: string, stockId: string) {
    const item = await prisma.stockItem.findFirst({ where: { id: stockId, entityId } });
    if (!item) throw new NotFoundException('Stok kalemi bulunamadı');
    await prisma.stockItem.delete({ where: { id: stockId } });
    return { deleted: true };
  }

  static async getCampaigns(entityId: string) {
    await this.show(entityId);
    return prisma.campaign.findMany({
      where: { entityId },
      orderBy: { startDate: 'desc' },
    });
  }

  static async createCampaign(
    entityId: string,
    data: {
      name: string;
      type?: string;
      description?: string;
      discountPercent?: number;
      startDate: Date | string;
      endDate: Date | string;
      isActive?: boolean;
    },
  ) {
    await this.show(entityId);
    return prisma.campaign.create({
      data: {
        entityId,
        name: data.name,
        type: (data.type as any) ?? 'CUSTOM',
        description: data.description ?? null,
        discountPercent: data.discountPercent ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      },
    });
  }

  static async getExpenses(entityId: string, limit = 50) {
    await this.show(entityId);
    return prisma.expense.findMany({
      where: { entityId },
      orderBy: { expenseDate: 'desc' },
      take: limit,
    });
  }

  static async createExpense(
    entityId: string,
    data: {
      productName: string;
      quantity: number;
      unit: string;
      amount: number;
      expenseDate: Date | string;
      notes?: string;
    },
  ) {
    await this.show(entityId);
    return prisma.expense.create({
      data: {
        entityId,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit,
        amount: data.amount,
        expenseDate: new Date(data.expenseDate),
        notes: data.notes ?? null,
      },
    });
  }

  static async getEquipment(entityId: string) {
    await this.show(entityId);
    return prisma.entityEquipment.findMany({
      where: { entityId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  static async createEquipment(
    entityId: string,
    data: {
      name: string;
      category?: string;
      quantity?: number;
      minQuantity?: number;
      unit?: string;
      notes?: string;
    },
  ) {
    await this.show(entityId);
    return prisma.entityEquipment.create({
      data: {
        entityId,
        name: data.name,
        category: (data.category as any) ?? 'OTHER',
        quantity: data.quantity ?? 0,
        minQuantity: data.minQuantity ?? null,
        unit: data.unit ?? 'adet',
        notes: data.notes ?? null,
      },
    });
  }

  static async updateEquipment(
    entityId: string,
    equipId: string,
    data: { name?: string; category?: string; quantity?: number; minQuantity?: number | null; unit?: string; notes?: string },
  ) {
    const item = await prisma.entityEquipment.findFirst({ where: { id: equipId, entityId } });
    if (!item) throw new NotFoundException('Ekipman bulunamadı');
    return prisma.entityEquipment.update({
      where: { id: equipId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category as any }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.minQuantity !== undefined && { minQuantity: data.minQuantity }),
        ...(data.unit && { unit: data.unit }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  /** İşletme kar/zarar: gelir, gider, doluluk (otel), stok özeti (restoran), kampanyalar */
  static async getFinancials(entityId: string) {
    const entity = await this.show(entityId);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const [payments, expenses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          reservation: { entityId },
          createdAt: { gte: startOfYear, lte: endOfYear },
        },
        select: { amount: true, createdAt: true },
      }),
      prisma.expense.findMany({
        where: { entityId, expenseDate: { gte: startOfYear, lte: endOfYear } },
        select: { amount: true, expenseDate: true },
      }),
    ]);

    const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const profit = totalRevenue - totalExpenses;

    const revenueByMonth: Record<number, number> = {};
    const expensesByMonth: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) {
      revenueByMonth[m] = 0;
      expensesByMonth[m] = 0;
    }
    payments.forEach((p) => {
      const m = new Date(p.createdAt).getMonth() + 1;
      revenueByMonth[m] += Number(p.amount);
    });
    expenses.forEach((e) => {
      const m = new Date(e.expenseDate).getMonth() + 1;
      expensesByMonth[m] += Number(e.amount);
    });

    const chartData = Object.entries(revenueByMonth).map(([month, rev]) => ({
      month: Number(month),
      monthName: new Date(now.getFullYear(), Number(month) - 1, 1).toLocaleString('tr-TR', { month: 'short' }),
      revenue: rev,
      expenses: expensesByMonth[Number(month)],
      profit: rev - expensesByMonth[Number(month)],
    }));

    let occupancyRate: number | null = null;
    let stockSummary: { totalItems: number; lowStockCount: number; items: Array<{ name: string; quantity: number; minQuantity: number | null; unit: string }> } | null = null;

    if (entity.type === 'HOTEL') {
      const rooms = await prisma.room.count({ where: { deletedAt: null, roomType: { entityId } } });
      const occupied = await prisma.room.count({
        where: { deletedAt: null, status: 'OCCUPIED', roomType: { entityId } },
      });
      occupancyRate = rooms > 0 ? Math.round((occupied / rooms) * 100) : 0;
    } else if (entity.type === 'RESTAURANT') {
      const stockItems = await prisma.stockItem.findMany({
        where: { entityId },
        select: { name: true, quantity: true, minQuantity: true, unit: true },
      });
      const lowStock = stockItems.filter((s) => s.minQuantity != null && Number(s.quantity) <= Number(s.minQuantity));
      stockSummary = {
        totalItems: stockItems.length,
        lowStockCount: lowStock.length,
        items: stockItems.slice(0, 10).map((s) => ({
          name: s.name,
          quantity: Number(s.quantity),
          minQuantity: s.minQuantity != null ? Number(s.minQuantity) : null,
          unit: s.unit,
        })),
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where: { entityId },
      orderBy: { startDate: 'desc' },
      take: 5,
      select: { id: true, name: true, type: true, discountPercent: true, startDate: true, endDate: true, isActive: true },
    });

    return {
      entityType: entity.type,
      totalRevenue,
      totalExpenses,
      profit,
      chartData,
      occupancyRate,
      stockSummary,
      campaigns: campaigns.map((c) => ({
        ...c,
        discountPercent: c.discountPercent != null ? Number(c.discountPercent) : null,
        startDate: c.startDate,
        endDate: c.endDate,
      })),
    };
  }

  static async getLowStockAlerts() {
    const items = await prisma.stockItem.findMany({
      where: { minQuantity: { not: null }, entity: { status: 'PUBLISHED' } },
      include: { entity: { select: { id: true, name: true, type: true } } },
    });
    return items.filter((s) => s.minQuantity != null && Number(s.quantity) <= Number(s.minQuantity));
  }
}
