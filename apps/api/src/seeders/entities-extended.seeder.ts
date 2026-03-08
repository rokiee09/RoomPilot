/* eslint-disable no-console */
import { createSeeder } from '@onlyjs/db/seeder/utils';

const HOTEL_STAFF_ROLES = [
  { role: 'Garson', count: 4 },
  { role: 'Komi', count: 3 },
  { role: 'Belboy', count: 2 },
  { role: 'Chef', count: 2 },
  { role: 'Alakart Sorumlusu', count: 1 },
  { role: 'House Keeping', count: 8 },
  { role: 'Resepsiyonist', count: 4 },
  { role: 'Güvenlik', count: 2 },
  { role: 'Aşçı', count: 3 },
  { role: 'Barista', count: 1 },
];

const entitiesExtendedSeeder = createSeeder(
  {
    name: 'entities-extended',
    description: 'Kampanyalar, çalışanlar (türe göre), ekipman, giderler - otel/restoran ayrımı',
    priority: 27,
    dependencies: ['entities-restaurants'],
  },
  async (prisma) => {
    const entities = await prisma.entity.findMany({ where: { status: 'PUBLISHED' } });
    if (entities.length === 0) {
      console.log('⚠️ İşletme bulunamadı, entities-extended atlanıyor.');
      return;
    }

    let staffAdded = 0;
    let campaignsAdded = 0;
    let equipmentAdded = 0;
    let expensesAdded = 0;

    const now = new Date();
    const thisYear = now.getFullYear();

    for (const entity of entities) {
      // 1. Kampanyalar - türe göre
      const existingCampaigns = await prisma.campaign.count({ where: { entityId: entity.id } });
      if (existingCampaigns === 0) {
        if (entity.type === 'HOTEL') {
          await prisma.campaign.createMany({
            data: [
              { entityId: entity.id, name: 'Bayram Kampanyası', type: 'BAYRAM', discountPercent: 15, startDate: new Date(thisYear, 2, 1), endDate: new Date(thisYear, 2, 15) },
              { entityId: entity.id, name: 'Yaz Sezonu', type: 'SEASONAL', discountPercent: 10, startDate: new Date(thisYear, 5, 1), endDate: new Date(thisYear, 8, 31) },
            ],
          });
          campaignsAdded += 2;
        } else {
          await prisma.campaign.createMany({
            data: [
              { entityId: entity.id, name: 'Yılbaşı Kampanyası', type: 'NEW_YEAR', discountPercent: 20, startDate: new Date(thisYear, 11, 20), endDate: new Date(thisYear, 11, 31) },
              entity.name.includes('İstanbul') || entity.name.includes('Balıkçı')
                ? { entityId: entity.id, name: 'Hafta Sonu Kampanyası', type: 'CUSTOM', discountPercent: 10, startDate: new Date(thisYear, 0, 1), endDate: new Date(thisYear, 11, 31) }
                : null,
            ].filter(Boolean) as any[],
          });
          campaignsAdded += entity.name.includes('İstanbul') || entity.name.includes('Balıkçı') ? 2 : 1;
        }
      }

      // 2. Çalışanlar - türe göre (otel ~30, restoran kapasiteye göre)
      const existingStaff = await prisma.staff.count({ where: { entityId: entity.id } });
      if (existingStaff === 0) {
        const names = ['Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Zeynep', 'Emre', 'Can', 'Elif', 'Selin', 'Burak', 'Deniz', 'Cem', 'Ece', 'Mert', 'Seda', 'Oğuz', 'Leyla', 'Kaan', 'Derya', 'Arda', 'Naz', 'Berk', 'İpek', 'Cemre', 'Eren', 'Defne', 'Kutay', 'Asya', 'Doruk'];
        if (entity.type === 'HOTEL') {
          let idx = 0;
          for (const { role, count } of HOTEL_STAFF_ROLES) {
            for (let i = 0; i < count; i++) {
              await prisma.staff.create({
                data: { entityId: entity.id, name: `${names[idx % names.length]} ${idx + 1}`, role },
              });
              idx++;
              staffAdded++;
            }
          }
        } else {
          const capacity = entity.capacity ?? 60;
          const staffCount = Math.max(5, Math.min(20, Math.ceil(capacity / 6)));
          const garsonCount = Math.ceil(staffCount * 0.35);
          const asciCount = Math.ceil(staffCount * 0.25);
          const temizlikCount = Math.max(1, staffCount - 1 - 1 - garsonCount - asciCount);
          const roleCounts: Array<{ role: string; count: number }> = [
            { role: 'Chef', count: 1 },
            { role: 'Garson', count: garsonCount },
            { role: 'Aşçı', count: asciCount },
            { role: 'Barista', count: 1 },
            { role: 'Temizlik', count: temizlikCount },
          ];
          let idx = 0;
          for (const { role, count } of roleCounts) {
            for (let i = 0; i < count; i++) {
              await prisma.staff.create({
                data: { entityId: entity.id, name: `${names[idx % names.length]} ${idx + 1}`, role },
              });
              idx++;
              staffAdded++;
            }
          }
        }
      }

      // 3. Ekipman - türe göre
      const existingEquip = await prisma.entityEquipment.count({ where: { entityId: entity.id } });
      if (existingEquip === 0) {
        if (entity.type === 'HOTEL') {
          const hotelEquip = [
            { name: 'Çarşaf', category: 'HOTEL', quantity: 80, unit: 'adet', minQuantity: 20 },
            { name: 'Yastık', category: 'HOTEL', quantity: 60, unit: 'adet', minQuantity: 15 },
            { name: 'Havlu', category: 'HOTEL', quantity: 100, unit: 'adet', minQuantity: 25 },
            { name: 'Battaniye', category: 'HOTEL', quantity: 30, unit: 'adet', minQuantity: 10 },
            { name: 'Tabak', category: 'KITCHEN', quantity: 150, unit: 'adet', minQuantity: 30 },
            { name: 'Çatal', category: 'RESTAURANT', quantity: 120, unit: 'adet', minQuantity: 25 },
            { name: 'Bıçak', category: 'RESTAURANT', quantity: 120, unit: 'adet', minQuantity: 25 },
          ];
          for (const e of hotelEquip) {
            await prisma.entityEquipment.create({
              data: { entityId: entity.id, ...e },
            });
            equipmentAdded++;
          }
        } else {
          const restEquip = [
            { name: 'Tabak', category: 'RESTAURANT', quantity: 120, unit: 'adet', minQuantity: 25 },
            { name: 'Çatal', category: 'RESTAURANT', quantity: 100, unit: 'adet', minQuantity: 20 },
            { name: 'Bıçak', category: 'RESTAURANT', quantity: 100, unit: 'adet', minQuantity: 20 },
            { name: 'Bardak', category: 'RESTAURANT', quantity: 80, unit: 'adet', minQuantity: 15 },
          ];
          for (const e of restEquip) {
            await prisma.entityEquipment.create({
              data: { entityId: entity.id, ...e },
            });
            equipmentAdded++;
          }
        }
      }

      // 4. Örnek giderler
      const existingExp = await prisma.expense.count({ where: { entityId: entity.id } });
      if (existingExp === 0) {
        const expenses: Array<{ productName: string; quantity: number; unit: string; amount: number; expenseDate: Date }> = entity.type === 'HOTEL'
          ? [
              { productName: 'Çarşaf', quantity: 50, unit: 'adet', amount: 2500, expenseDate: new Date(thisYear, 1, 15) },
              { productName: 'Temizlik malzemesi', quantity: 20, unit: 'kutu', amount: 800, expenseDate: new Date(thisYear, 2, 1) },
              { productName: 'Zeytinyağı', quantity: 50, unit: 'lt', amount: 3500, expenseDate: new Date(thisYear, 2, 10) },
            ]
          : [
              { productName: 'Zeytinyağı', quantity: 100, unit: 'lt', amount: 2500, expenseDate: new Date(thisYear, 2, 5) },
              { productName: 'Domates', quantity: 80, unit: 'kg', amount: 1200, expenseDate: new Date(thisYear, 2, 3) },
              { productName: 'Et', quantity: 40, unit: 'kg', amount: 6000, expenseDate: new Date(thisYear, 2, 1) },
            ];
        for (const ex of expenses) {
          await prisma.expense.create({ data: { entityId: entity.id, ...ex } });
          expensesAdded++;
        }
      }
    }

    console.log(`✅ entities-extended: ${campaignsAdded} kampanya, ${staffAdded} çalışan, ${equipmentAdded} ekipman, ${expensesAdded} gider eklendi.`);
  },
  async (prisma) => {
    await prisma.campaign.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.entityEquipment.deleteMany();
    await prisma.staff.deleteMany();
    console.log('✅ entities-extended rollback completed!');
  },
);

export default entitiesExtendedSeeder;
