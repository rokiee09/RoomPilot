import { PrismaClient } from '@onlyjs/db/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, isActive: true },
  take: 20,
  orderBy: { createdAt: 'asc' },
});
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
