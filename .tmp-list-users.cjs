const { PrismaClient } = require('@onlyjs/db/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, isActive: true }, take: 20, orderBy: { createdAt: 'asc' } });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
