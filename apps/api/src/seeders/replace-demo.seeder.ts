/* eslint-disable no-console */
import { createSeeder } from '@onlyjs/db/seeder/utils';

/**
 * Demo verileri temizler: "Demo Restaurant", "Demo Musteri", "Ab-ı Hayat" gibi
 * placeholder verileri siler. Ardından customers, entities-restaurants,
 * reservations seed'leri gerçek verileri ekleyecek.
 */
const replaceDemoSeeder = createSeeder(
  {
    name: 'replace-demo',
    description: 'Demo işletme ve müşteri verilerini siler, gerçek verilerin eklenmesine zemin hazırlar',
    priority: 24,
    dependencies: ['system-initialization'],
  },
  async (prisma) => {
    const demoEntityPatterns = ['demo', 'ab-ı hayat', 'abı hayat'];
    const demoCustomerPatterns = ['demo'];

    const entities = await prisma.entity.findMany({ select: { id: true, name: true } });
    const customers = await prisma.customer.findMany({ select: { id: true, name: true } });

    const demoEntityIds = entities
      .filter((e) => demoEntityPatterns.some((p) => e.name.toLowerCase().includes(p)))
      .map((e) => e.id);

    const demoCustomerIds = customers
      .filter((c) => demoCustomerPatterns.some((p) => c.name.toLowerCase().includes(p)))
      .map((c) => c.id);

    // 1. Önce rezervasyonları ve ödemeleri sil
    await prisma.payment.deleteMany();
    await prisma.reservation.deleteMany();

    // 2. Demo entity'leri sil (cascade ile rooms, stock, roomTypes silinir)
    let entDeleted = 0;
    if (demoEntityIds.length > 0) {
      const r = await prisma.entity.deleteMany({ where: { id: { in: demoEntityIds } } });
      entDeleted = r.count;
    }

    // 3. Demo customer'ları sil
    let custDeleted = 0;
    if (demoCustomerIds.length > 0) {
      const r = await prisma.customer.deleteMany({ where: { id: { in: demoCustomerIds } } });
      custDeleted = r.count;
    }

    if (entDeleted > 0 || custDeleted > 0) {
      console.log(`✅ Demo veriler temizlendi: ${entDeleted} işletme, ${custDeleted} müşteri`);
    } else {
      console.log('✅ Demo veri bulunamadı veya zaten temiz.');
    }
  },
);

export default replaceDemoSeeder;
