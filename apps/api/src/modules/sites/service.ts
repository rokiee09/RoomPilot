import { NotFoundException } from '#utils/http-errors';
import prisma from '@onlyjs/db';
import { Prisma } from '@onlyjs/db/client';
import { PrismaClientKnownRequestError } from '@onlyjs/db/client/runtime/library';

export abstract class SitesService {
  static async index() {
    return prisma.site.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { entities: true } } },
    });
  }

  static async show(id: string) {
    const site = await prisma.site.findUnique({
      where: { id },
      include: { entities: { select: { id: true, name: true, type: true, city: true } } },
    });
    if (!site) throw new NotFoundException('Bölge bulunamadı');
    return site;
  }

  static async store(data: { name: string; slug: string }) {
    const slug = data.slug.trim().toLowerCase().replace(/\s+/g, '-') || data.name.trim().toLowerCase().replace(/\s+/g, '-');
    return prisma.site.create({
      data: { name: data.name.trim(), slug },
    });
  }

  static async update(id: string, data: { name?: string; slug?: string }) {
    try {
      const update: Prisma.SiteUpdateInput = {};
      if (data.name) update.name = data.name.trim();
      if (data.slug !== undefined) update.slug = data.slug.trim().toLowerCase().replace(/\s+/g, '-');
      return await prisma.site.update({
        where: { id },
        data: update,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Bölge bulunamadı');
      }
      throw error;
    }
  }

  static async destroy(id: string) {
    try {
      await prisma.site.delete({ where: { id } });
      return { deleted: true };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Bölge bulunamadı');
      }
      throw error;
    }
  }
}
