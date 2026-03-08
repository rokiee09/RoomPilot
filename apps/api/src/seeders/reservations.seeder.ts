/* eslint-disable no-console */
import { createSeeder } from '@onlyjs/db/seeder/utils';

const reservationsSeeder = createSeeder(
  {
    name: 'reservations',
    description: 'Örnek rezervasyonlar: müşteri-işletme eşleşmeleri',
    priority: 27,
    dependencies: ['customers', 'entities-restaurants'],
  },
  async (prisma) => {
    const count = await prisma.reservation.count();
    if (count > 0) {
      console.log('✅ Rezervasyonlar zaten mevcut, seeder atlanıyor.');
      return;
    }

    const [customers, entities] = await Promise.all([
      prisma.customer.findMany({ take: 15 }),
      prisma.entity.findMany(),
    ]);

    if (customers.length === 0 || entities.length === 0) {
      console.log('⚠️ Müşteri veya işletme bulunamadı, rezervasyon seeder atlanıyor.');
      return;
    }

    const now = new Date();
    const reservations: Array<{
      entityId: string;
      customerId: string;
      customerName: string;
      dateTime: Date;
      partySize: number;
      status: 'PENDING' | 'APPROVED' | 'COMPLETED';
    }> = [];

    // Geçmiş 7 gün + bugün + gelecek 3 gün için rezervasyonlar
    for (let dayOffset = -7; dayOffset <= 3; dayOffset++) {
      for (let i = 0; i < 3; i++) {
        const c = customers[(dayOffset + i + 10) % customers.length];
        const e = entities[i % entities.length];
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        date.setHours(12 + (i % 3) * 2, 0, 0, 0);

        reservations.push({
          entityId: e.id,
          customerId: c.id,
          customerName: c.name,
          dateTime: date,
          partySize: 1 + (i % 4),
          status:
            dayOffset < 0 ? 'COMPLETED' : dayOffset === 0 ? (i === 0 ? 'APPROVED' : 'PENDING') : 'PENDING',
        });
      }
    }

    await prisma.reservation.createMany({
      data: reservations,
    });

    console.log(`✅ ${reservations.length} örnek rezervasyon oluşturuldu.`);
  },
  async (prisma) => {
    // Sadece seeder ile oluşturulan rezervasyonları temizle (yeni olanları korumak zor - hepsini sil)
    await prisma.payment.deleteMany();
    await prisma.reservation.deleteMany();
    console.log('✅ Reservations rollback completed!');
  },
);

export default reservationsSeeder;
