import { NotFoundException } from '#utils/http-errors';
import type { PaginationQuery } from '#utils/pagination';
import prisma from '@onlyjs/db';
import { Prisma } from '@onlyjs/db/client';
import { PrismaClientKnownRequestError } from '@onlyjs/db/client/runtime/library';

const statusList = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const;
const methodList = ['CREDIT_CARD', 'CASH', 'BANK_TRANSFER', 'STRIPE'] as const;

export abstract class PaymentsService {
  static async index(
    query: PaginationQuery & {
      reservationId?: string;
      status?: string;
      entityId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      page = 1,
      perPage = 20,
      reservationId,
      status,
      entityId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.PaymentWhereInput = {};
    if (reservationId) where.reservationId = reservationId;
    if (status && statusList.includes(status as (typeof statusList)[number])) {
      where.status = status as (typeof statusList)[number];
    }
    if (entityId) {
      where.reservation = { entityId };
    }

    const orderBy: Prisma.PaymentOrderByWithRelationInput =
      sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'amount'
        ? { [sortBy]: sortOrder }
        : { createdAt: sortOrder };

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          reservation: {
            select: {
              id: true,
              customerName: true,
              dateTime: true,
              status: true,
              entityId: true,
              entity: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total };
  }

  static async show(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            entity: { select: { id: true, name: true, type: true } },
            customer: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Ödeme bulunamadı');
    return payment;
  }

  static async store(data: {
    reservationId: string;
    amount: number;
    currency?: string;
    status?: string;
    paymentMethod: string;
  }) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
    });
    if (!reservation) throw new NotFoundException('Rezervasyon bulunamadı');

    return prisma.payment.create({
      data: {
        reservationId: data.reservationId,
        amount: data.amount,
        currency: data.currency ?? 'TRY',
        status: (data.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED') ?? 'PENDING',
        paymentMethod: data.paymentMethod as 'CREDIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'STRIPE',
      },
      include: {
        reservation: {
          select: {
            id: true,
            customerName: true,
            dateTime: true,
            entity: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  static async update(
    id: string,
    data: { status?: string; amount?: number },
  ) {
    try {
      return await prisma.payment.update({
        where: { id },
        data: {
          ...(data.status &&
            statusList.includes(data.status as (typeof statusList)[number]) && {
              status: data.status as (typeof statusList)[number],
            }),
          ...(data.amount !== undefined && { amount: data.amount }),
        },
        include: {
          reservation: {
            select: {
              id: true,
              customerName: true,
              dateTime: true,
              entity: { select: { id: true, name: true } },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Ödeme bulunamadı');
      }
      throw error;
    }
  }
}
