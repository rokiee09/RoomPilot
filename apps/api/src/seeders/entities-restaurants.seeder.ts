/* eslint-disable no-console */
import { createSeeder } from '@onlyjs/db/seeder/utils';

const SAMPLE_ENTITIES = [
  {
    type: 'RESTAURANT' as const,
    name: 'Adana Kebap Evi',
    description: 'Geleneksel Adana usulü kebap ve et yemekleri. Taze malzemeler, özenli sunum.',
    city: 'İstanbul',
    status: 'PUBLISHED' as const,
    address: 'Kadıköy Mah. Kebap Sok. No:5, Kadıköy',
    phone: '0216 345 6789',
    capacity: 80,
    cuisineType: 'Kebap, Türk Mutfağı',
    amenities: ['WiFi', 'Park Alanı', 'Paket Servis'],
    stockItems: [
      { name: 'Kıyma (Adana)', quantity: 50, unit: 'kg', minQuantity: 10 },
      { name: 'Domates', quantity: 30, unit: 'kg', minQuantity: 5 },
      { name: 'Soğan', quantity: 25, unit: 'kg', minQuantity: 5 },
      { name: 'Biber (isot)', quantity: 5, unit: 'kg', minQuantity: 1 },
      { name: 'Pirinç', quantity: 20, unit: 'kg', minQuantity: 5 },
      { name: 'Ayran', quantity: 100, unit: 'adet', minQuantity: 20 },
      { name: 'Lavaş', quantity: 200, unit: 'adet', minQuantity: 50 },
      { name: 'Zeytinyağı', quantity: 15, unit: 'lt', minQuantity: 3 },
    ],
    tables: 12,
  },
  {
    type: 'RESTAURANT' as const,
    name: 'İstanbul Balıkçı',
    description: 'Taze deniz ürünleri, balık ve deniz mahsulleri. Deniz manzaralı teras.',
    city: 'İstanbul',
    status: 'PUBLISHED' as const,
    address: 'Bebek Sahil Cad. No:12, Beşiktaş',
    phone: '0212 234 5678',
    capacity: 120,
    cuisineType: 'Deniz Ürünleri, Akdeniz',
    amenities: ['WiFi', 'Deniz Manzarası', 'Canlı Müzik'],
    stockItems: [
      { name: 'Çipura', quantity: 15, unit: 'kg', minQuantity: 5 },
      { name: 'Levrek', quantity: 12, unit: 'kg', minQuantity: 3 },
      { name: 'Karides', quantity: 8, unit: 'kg', minQuantity: 2 },
      { name: 'Kalamar', quantity: 6, unit: 'kg', minQuantity: 2 },
      { name: 'Limon', quantity: 20, unit: 'kg', minQuantity: 5 },
      { name: 'Zeytinyağı', quantity: 25, unit: 'lt', minQuantity: 5 },
      { name: 'Sarımsak', quantity: 3, unit: 'kg', minQuantity: 1 },
      { name: 'Maydanoz', quantity: 5, unit: 'kg', minQuantity: 1 },
      { name: 'Roka', quantity: 4, unit: 'kg', minQuantity: 1 },
    ],
    tables: 18,
  },
  {
    type: 'RESTAURANT' as const,
    name: 'Ankara Köfte Salonu',
    description: 'El yapımı köfteler, çorbalar ve mezesi bol Ankara usulü sofralar.',
    city: 'Ankara',
    status: 'PUBLISHED' as const,
    address: 'Tunalı Hilmi Cad. No:88, Çankaya',
    phone: '0312 456 7890',
    capacity: 60,
    cuisineType: 'Türk Mutfağı, Köfte',
    amenities: ['WiFi', 'Paket Servis'],
    stockItems: [
      { name: 'Kıyma (köftelik)', quantity: 40, unit: 'kg', minQuantity: 10 },
      { name: 'Ekmek İçi', quantity: 5, unit: 'kg', minQuantity: 1 },
      { name: 'Soğan', quantity: 20, unit: 'kg', minQuantity: 5 },
      { name: 'Domates', quantity: 25, unit: 'kg', minQuantity: 5 },
      { name: 'Mercimek', quantity: 10, unit: 'kg', minQuantity: 2 },
      { name: 'Makarna', quantity: 15, unit: 'kg', minQuantity: 3 },
      { name: 'Yoğurt', quantity: 20, unit: 'kg', minQuantity: 5 },
      { name: 'Salatalık', quantity: 15, unit: 'kg', minQuantity: 3 },
    ],
    tables: 10,
  },
  {
    type: 'HOTEL' as const,
    name: 'Otel Sultanoğlu',
    description: '3 yıldızlı konaklama tesisi. Denize yakın, temiz ve konforlu odalar.',
    city: 'Antalya',
    status: 'PUBLISHED' as const,
    address: 'Lara Sahil Yolu No:150, Muratpaşa',
    phone: '0242 312 3456',
    roomCount: 24,
    starRating: 3,
    amenities: ['WiFi', 'Havuz', 'Kahvaltı', 'Bar'],
    rooms: [
      { typeName: 'Standart Oda', count: 12, price: 1200 },
      { typeName: 'Deniz Manzaralı', count: 8, price: 1800 },
      { typeName: 'Suite', count: 4, price: 2800 },
    ],
  },
];

const entitiesSeeder = createSeeder(
  {
    name: 'entities-restaurants',
    description: 'Örnek restoran ve otel işletmeleri ile stok takibi, masa ve oda verileri',
    priority: 26,
    dependencies: ['system-initialization'],
  },
  async (prisma) => {
    const count = await prisma.entity.count();
    if (count > 0) {
      console.log('✅ İşletmeler zaten mevcut, seeder atlanıyor.');
      return;
    }

    let created = 0;

    for (const ent of SAMPLE_ENTITIES) {
      const entity = await prisma.entity.create({
        data: {
          type: ent.type,
          name: ent.name,
          description: ent.description ?? null,
          city: ent.city,
          status: ent.status,
          address: ent.address ?? null,
          phone: ent.phone ?? null,
          roomCount: 'roomCount' in ent ? ent.roomCount ?? null : null,
          capacity: 'capacity' in ent ? ent.capacity ?? null : null,
          starRating: 'starRating' in ent ? ent.starRating ?? null : null,
          cuisineType: 'cuisineType' in ent ? ent.cuisineType ?? null : null,
          amenities: ent.amenities ?? [],
        },
      });
      created++;

      // Restoran: stok + masalar
      if (ent.type === 'RESTAURANT' && 'stockItems' in ent && 'tables' in ent) {
        const stockItems = ent.stockItems as Array<{
          name: string;
          quantity: number;
          unit: string;
          minQuantity?: number;
        }>;
        await prisma.stockItem.createMany({
          data: stockItems.map((s) => ({
            entityId: entity.id,
            name: s.name,
            quantity: s.quantity,
            unit: s.unit,
            minQuantity: s.minQuantity ?? null,
          })),
        });

        // Masa tipi ve masalar (restoran için TABLE)
        const rt = await prisma.roomType.create({
          data: {
            entityId: entity.id,
            name: '4 Kişilik Masa',
            kind: 'TABLE',
            capacity: 4,
            quantity: ent.tables,
          },
        });

        for (let i = 0; i < ent.tables; i++) {
          await prisma.room.create({
            data: {
              roomTypeId: rt.id,
              guestCount: 0,
              status: 'AVAILABLE_CLEAN',
              isActive: true,
            },
          });
        }
      }

      // Otel: oda tipleri ve odalar
      if (ent.type === 'HOTEL' && 'rooms' in ent) {
        const roomSpecs = ent.rooms as Array<{ typeName: string; count: number; price: number }>;
        for (const rs of roomSpecs) {
          const rt = await prisma.roomType.create({
            data: {
              entityId: entity.id,
              name: rs.typeName,
              kind: 'ROOM',
              capacity: rs.typeName.includes('Suite') ? 4 : 2,
              quantity: rs.count,
              pricePerNight: rs.price,
              weekendPrice: Math.round(rs.price * 1.2),
            },
          });

          for (let i = 0; i < rs.count; i++) {
            await prisma.room.create({
              data: {
                roomTypeId: rt.id,
                guestCount: 0,
                price: rs.price,
                status: 'AVAILABLE_CLEAN',
                isActive: true,
              },
            });
          }
        }
      }
    }

    const stockTotal = await prisma.stockItem.count();
    const roomTotal = await prisma.room.count();
    console.log(`✅ ${created} işletme oluşturuldu (3 restoran, 1 otel)`);
    console.log(`✅ ${stockTotal} stok kalemi eklendi`);
    console.log(`✅ ${roomTotal} masa/oda eklendi`);
  },
  async (prisma) => {
    await prisma.reservation.updateMany({ data: { roomId: null } });
    await prisma.payment.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.stockItem.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.entityImage.deleteMany();
    await prisma.room.deleteMany();
    await prisma.roomType.deleteMany();
    await prisma.entity.deleteMany();
    console.log('✅ Entities-restaurants rollback completed!');
  },
);

export default entitiesSeeder;
