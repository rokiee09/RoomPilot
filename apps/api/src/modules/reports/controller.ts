import { Elysia } from 'elysia';
import prisma from '@onlyjs/db';
import { auth, authSwagger } from '../auth';

const app = new Elysia({
  prefix: '/reports',
  detail: { tags: ['Reports'] },
})
  .guard(authSwagger, (app) =>
    app.use(auth()).get(
      '/summary',
      async () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

        const [reservationsInYear, byEntity, totals, paymentsInYear, totalRevenue] = await Promise.all([
          prisma.reservation.findMany({
            where: {
              dateTime: { gte: startOfYear, lte: endOfYear },
            },
            select: { dateTime: true },
          }),
          prisma.reservation.groupBy({
            by: ['entityId'],
            _count: true,
          }).then(async (rows: { entityId: string; _count: number }[]) => {
            const entityIds = rows.map((r) => r.entityId);
            const entities = await prisma.entity.findMany({
              where: { id: { in: entityIds } },
              select: { id: true, name: true },
            });
            const nameMap = Object.fromEntries(entities.map((e) => [e.id, e.name]));
            return rows.map((r) => ({
              entityId: r.entityId,
              entityName: nameMap[r.entityId] ?? r.entityId,
              count: r._count,
            }));
          }),
          prisma.reservation.aggregate({
            _count: true,
            where: { status: 'APPROVED' },
          }).then((r) => r._count),
          prisma.payment.findMany({
            where: {
              status: 'COMPLETED',
              createdAt: { gte: startOfYear, lte: endOfYear },
            },
            select: { amount: true, createdAt: true },
          }),
          prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' },
          }).then((r) => Number(r._sum.amount ?? 0)),
        ]);

        const byMonthMap: Record<number, number> = {};
        for (let m = 1; m <= 12; m++) byMonthMap[m] = 0;
        reservationsInYear.forEach((r) => {
          const month = new Date(r.dateTime).getMonth() + 1;
          byMonthMap[month]++;
        });
        const reservationsByMonth = Object.entries(byMonthMap).map(([month, count]) => ({
          month: Number(month),
          monthName: new Date(now.getFullYear(), Number(month) - 1, 1).toLocaleString('tr-TR', { month: 'short' }),
          count,
        }));

        const revenueByMonthMap: Record<number, number> = {};
        for (let m = 1; m <= 12; m++) revenueByMonthMap[m] = 0;
        paymentsInYear.forEach((p) => {
          const month = new Date(p.createdAt).getMonth() + 1;
          revenueByMonthMap[month] += Number(p.amount);
        });
        const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, total]) => ({
          month: Number(month),
          monthName: new Date(now.getFullYear(), Number(month) - 1, 1).toLocaleString('tr-TR', { month: 'short' }),
          total,
        }));

        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);
        const weeklyRevenue = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfWeek, lte: now },
          },
        }).then((r) => Number(r._sum.amount ?? 0));

        const totalReservations = await prisma.reservation.count();
        const dailyReservations: { day: string; count: number; label: string }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const next = new Date(d);
          next.setDate(next.getDate() + 1);
          const count = await prisma.reservation.count({
            where: { dateTime: { gte: d, lt: next } },
          });
          dailyReservations.push({
            day: d.toISOString().slice(0, 10),
            count,
            label: d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
          });
        }

        const totalRooms = await prisma.room.count({ where: { deletedAt: null } });
        const occupiedRooms = await prisma.room.count({
          where: { deletedAt: null, status: 'OCCUPIED' },
        });
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        return {
          reservationsByMonth,
          reservationsByEntity: byEntity,
          totalApproved: totals,
          totalReservations,
          dailyReservations,
          occupancyRate,
          totalRooms,
          occupiedRooms,
          year: now.getFullYear(),
          revenueByMonth,
          totalRevenue,
          weeklyRevenue,
        };
      },
      {
        response: { 200: 'application/json' },
        detail: { summary: 'Get report summary for dashboard' },
      },
    ),
  );

export default app;
