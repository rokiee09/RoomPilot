import { NotFoundException } from '#utils/http-errors';
import type { PaginationQuery } from '#utils/pagination';
import prisma from '@onlyjs/db';
import { Prisma } from '@onlyjs/db/client';
import { PrismaClientKnownRequestError } from '@onlyjs/db/client/runtime/library';

export abstract class CustomersService {
  static async index(
    query: PaginationQuery & { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {},
  ) {
    const { page = 1, perPage = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.CustomerWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    const orderBy: Prisma.CustomerOrderByWithRelationInput =
      sortBy === 'name' ? { name: sortOrder } : { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  static async store(data: { name: string; phone?: string; email?: string }) {
    return prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
      },
    });
  }

  static async show(id: string, includeReservations = true) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: includeReservations
        ? {
            reservations: {
              orderBy: { dateTime: 'desc' },
              take: 50,
              include: {
                entity: { select: { id: true, name: true, type: true, city: true } },
              },
            },
          }
        : undefined,
    });
    if (!customer) throw new NotFoundException('Müşteri bulunamadı');
    return customer;
  }
}
