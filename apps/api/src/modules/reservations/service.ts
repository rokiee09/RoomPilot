import { NotFoundException } from '#utils/http-errors';
import type { PaginationQuery } from '#utils/pagination';
import prisma from '@onlyjs/db';
import { Prisma } from '@onlyjs/db/client';
import { PrismaClientKnownRequestError } from '@onlyjs/db/client/runtime/library';
import type { ReservationStatus } from './types';

const statusList = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] as const;

export abstract class ReservationsService {
  static async index(
    query: PaginationQuery & {
      status?: string;
      entityId?: string;
      entityType?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      page = 1,
      perPage = 20,
      status,
      entityId,
      entityType,
      fromDate,
      toDate,
      sortBy = 'dateTime',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.ReservationWhereInput = {};
    if (status && statusList.includes(status as (typeof statusList)[number])) {
      where.status = status as (typeof statusList)[number];
    }
    if (entityId) where.entityId = entityId;
    if (entityType && (entityType === 'HOTEL' || entityType === 'RESTAURANT')) {
      where.entity = { type: entityType };
    }
    if (fromDate || toDate) {
      where.dateTime = {};
      if (fromDate) (where.dateTime as Prisma.DateTimeFilter).gte = new Date(fromDate);
      if (toDate) (where.dateTime as Prisma.DateTimeFilter).lte = new Date(toDate);
    }

    const orderBy: Prisma.ReservationOrderByWithRelationInput =
      sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dateTime'
        ? { [sortBy]: sortOrder }
        : { dateTime: sortOrder };

    const [data, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          entity: { select: { id: true, name: true, type: true, city: true } },
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      prisma.reservation.count({ where }),
    ]);

    return { data, total };
  }

  static async show(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        entity: true,
        customer: true,
        room: { select: { uuid: true, status: true, roomType: { select: { name: true } } } },
      },
    });
    if (!reservation) throw new NotFoundException('Rezervasyon bulunamadı');
    return reservation;
  }

  /** Rezervasyon için check-in (oda atanabilir). Oda varsa room.status → OCCUPIED. */
  static async checkIn(id: string, roomId?: string) {
    const reservation = await prisma.reservation.findUnique({ where: { id }, include: { entity: true } });
    if (!reservation) throw new NotFoundException('Rezervasyon bulunamadı');
    if (reservation.checkInTime) throw new Error('Bu rezervasyon zaten check-in yapılmış');

    const now = new Date();
    if (roomId) {
      const room = await prisma.room.findFirst({
        where: { uuid: roomId, deletedAt: null, roomType: { entityId: reservation.entityId } },
      });
      if (!room) throw new NotFoundException('Oda bulunamadı');
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id },
          data: { checkInTime: now, roomId: room.uuid, status: 'APPROVED' },
        }),
        prisma.room.update({ where: { id: room.id }, data: { status: 'OCCUPIED' } }),
      ]);
    } else {
      await prisma.reservation.update({
        where: { id },
        data: { checkInTime: now, status: 'APPROVED' },
      });
    }
    return this.show(id);
  }

  /** Rezervasyon için check-out. Oda atanmışsa room.status → AVAILABLE_DIRTY. */
  static async checkOut(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!reservation) throw new NotFoundException('Rezervasyon bulunamadı');
    if (!reservation.checkInTime) throw new Error('Önce check-in yapılmalı');
    if (reservation.checkOutTime) throw new Error('Bu rezervasyon zaten check-out yapılmış');

    const now = new Date();
    if (reservation.roomId && reservation.room) {
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id },
          data: { checkOutTime: now, status: 'COMPLETED' },
        }),
        prisma.room.update({
          where: { id: reservation.room.id },
          data: { status: 'AVAILABLE_DIRTY' },
        }),
      ]);
    } else {
      await prisma.reservation.update({
        where: { id },
        data: { checkOutTime: now, status: 'COMPLETED' },
      });
    }
    return this.show(id);
  }

  static async store(data: {
    entityId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    dateTime: Date;
    partySize: number;
  }) {
    let customerId: string | null = null;
    if (data.customerEmail || data.customerPhone) {
      const existing = await prisma.customer.findFirst({
        where: {
          OR: [
            ...(data.customerEmail ? [{ email: data.customerEmail }] : []),
            ...(data.customerPhone ? [{ phone: data.customerPhone }] : []),
          ].filter(Boolean),
        },
      });
      if (existing) {
        customerId = existing.id;
        await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: data.customerName,
            ...(data.customerEmail && { email: data.customerEmail }),
            ...(data.customerPhone && { phone: data.customerPhone }),
          },
        });
      } else {
        const created = await prisma.customer.create({
          data: {
            name: data.customerName,
            email: data.customerEmail ?? null,
            phone: data.customerPhone ?? null,
          },
        });
        customerId = created.id;
      }
    }
    return prisma.reservation.create({
      data: {
        entityId: data.entityId,
        customerId,
        customerName: data.customerName,
        dateTime: data.dateTime,
        partySize: data.partySize,
      },
      include: {
        entity: { select: { id: true, name: true, type: true, city: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  static async updateStatus(id: string, status: ReservationStatus) {
    if (!statusList.includes(status)) {
      throw new Error('Invalid status');
    }
    try {
      const reservation = await prisma.reservation.update({
        where: { id },
        data: { status: status as (typeof statusList)[number] },
        include: {
          entity: { select: { id: true, name: true, type: true, city: true } },
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
      return reservation;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Rezervasyon bulunamadı');
      }
      throw error;
    }
  }
}
