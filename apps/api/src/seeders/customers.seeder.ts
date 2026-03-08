/* eslint-disable no-console */
import { createSeeder } from '@onlyjs/db/seeder/utils';

const TURKISH_CUSTOMERS: Array<{ name: string; phone?: string; email?: string }> = [
  { name: 'Ahmet Yılmaz', phone: '0532 111 2233', email: 'ahmet.yilmaz@email.com' },
  { name: 'Ayşe Demir', phone: '0533 222 3344', email: 'ayse.demir@email.com' },
  { name: 'Mehmet Kaya', phone: '0534 333 4455', email: 'mehmet.kaya@email.com' },
  { name: 'Fatma Şahin', phone: '0535 444 5566', email: 'fatma.sahin@email.com' },
  { name: 'Mustafa Çelik', phone: '0536 555 6677', email: 'mustafa.celik@email.com' },
  { name: 'Zeynep Arslan', phone: '0537 666 7788', email: 'zeynep.arslan@email.com' },
  { name: 'Ali Öztürk', phone: '0538 777 8899', email: 'ali.ozturk@email.com' },
  { name: 'Elif Yıldız', phone: '0539 888 9900', email: 'elif.yildiz@email.com' },
  { name: 'Hüseyin Aydın', phone: '0541 999 0011', email: 'huseyin.aydin@email.com' },
  { name: 'Merve Koç', phone: '0542 100 1122', email: 'merve.koc@email.com' },
  { name: 'Emre Polat', phone: '0543 211 2233', email: 'emre.polat@email.com' },
  { name: 'Selin Yılmaz', phone: '0544 322 3344', email: 'selin.yilmaz@email.com' },
  { name: 'Can Aksoy', phone: '0545 433 4455', email: 'can.aksoy@email.com' },
  { name: 'Deniz Özdemir', phone: '0546 544 5566', email: 'deniz.ozdemir@email.com' },
  { name: 'Ece Korkmaz', phone: '0547 655 6677', email: 'ece.korkmaz@email.com' },
  { name: 'Burak Avcı', phone: '0548 766 7788', email: 'burak.avci@email.com' },
  { name: 'Seda Erdoğan', phone: '0549 877 8899', email: 'seda.erdogan@email.com' },
  { name: 'Kerem Güneş', phone: '0550 988 9900', email: 'kerem.gunes@email.com' },
  { name: 'Esra Doğan', phone: '0551 099 0011', email: 'esra.dogan@email.com' },
  { name: 'Oğuz Kara', phone: '0552 110 1122', email: 'oguz.kara@email.com' },
  { name: 'Pınar Yavuz', phone: '0553 221 2233', email: 'pinar.yavuz@email.com' },
  { name: 'Serkan Acar', phone: '0554 332 3344', email: 'serkan.acar@email.com' },
  { name: 'Gizem Özkan', phone: '0555 443 4455', email: 'gizem.ozkan@email.com' },
  { name: 'Volkan Durmaz', phone: '0556 554 5566', email: 'volkan.durmaz@email.com' },
  { name: 'Derya Tekin', phone: '0557 665 6677', email: 'derya.tekin@email.com' },
  { name: 'Murat Şimşek', phone: '0558 776 7788', email: 'murat.simsek@email.com' },
  { name: 'Burcu Atakan', phone: '0559 887 8899', email: 'burcu.atakan@email.com' },
  { name: 'Kaan Karataş', phone: '0501 998 9900', email: 'kaan.karatas@email.com' },
  { name: 'Melis Özer', phone: '0502 009 0011', email: 'melis.ozer@email.com' },
  { name: 'Tolga Bayrak', phone: '0503 110 1122', email: 'tolga.bayrak@email.com' },
  { name: 'İpek Yalçın', phone: '0504 221 2233', email: 'ipek.yalcin@email.com' },
  { name: 'Efe Demirbaş', phone: '0505 332 3344', email: 'efe.demirbas@email.com' },
  { name: 'Defne Kılıç', phone: '0506 443 4455', email: 'defne.kilic@email.com' },
  { name: 'Utku Eren', phone: '0507 554 5566', email: 'utku.eren@email.com' },
  { name: 'Asya Yılmaz', phone: '0508 665 6677', email: 'asya.yilmaz@email.com' },
  { name: 'Arda Şahin', phone: '0509 776 7788', email: 'arda.sahin@email.com' },
  { name: 'Dila Aydın', phone: '0530 887 8899', email: 'dila.aydin@email.com' },
  { name: 'Kuzey Özkan', phone: '0531 998 9900', email: 'kuzey.ozkan@email.com' },
  { name: 'Nehir Çetin', phone: '0532 009 0011', email: 'nehir.cetin@email.com' },
];

const customersSeeder = createSeeder(
  {
    name: 'customers',
    description: 'Gerçek Türk isimli müşteri verilerini oluşturur',
    priority: 25,
    dependencies: ['system-initialization'],
  },
  async (prisma) => {
    const count = await prisma.customer.count();
    if (count > 0) {
      console.log('✅ Müşteriler zaten mevcut, seeder atlanıyor.');
      return;
    }

    await prisma.customer.createMany({
      data: TURKISH_CUSTOMERS.map((c) => ({
        name: c.name.slice(0, 255),
        phone: c.phone?.slice(0, 64) ?? null,
        email: c.email?.slice(0, 255) ?? null,
      })),
    });

    console.log(`✅ ${TURKISH_CUSTOMERS.length} müşteri oluşturuldu (Türk isimleri).`);
  },
  async (prisma) => {
    await prisma.reservation.updateMany({ data: { customerId: null } });
    await prisma.customer.deleteMany({
      where: {
        name: { in: TURKISH_CUSTOMERS.map((c) => c.name) },
      },
    });
    console.log('✅ Customers rollback completed!');
  },
);

export default customersSeeder;
