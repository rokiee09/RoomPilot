/* eslint-disable no-console */
import { Gender, RoleType, UserScope } from '@onlyjs/db/enums';
import { createSeeder } from '@onlyjs/db/seeder/utils';
import { UsersService } from '../modules/users';

const DEMO_EMAIL = 'burakavcii@hotmail.com';
const DEMO_PASSWORD = '09Buraq32';

const demoUserSeeder = createSeeder(
  {
    name: 'demo-user',
    description: 'Örnek giriş kullanıcısı (burakavcii@hotmail.com)',
    priority: 2,
    dependencies: ['system-initialization'],
  },
  async (prisma) => {
    const existing = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });
    if (existing) {
      console.log(`✅ Örnek kullanıcı zaten mevcut: ${DEMO_EMAIL}`);
      return;
    }

    const adminRole = await prisma.role.findFirst({
      where: { type: RoleType.ADMIN, organizationId: null },
    });
    if (!adminRole) {
      throw new Error('ADMIN rolü bulunamadı. Önce system-initialization seeder çalıştırılmalı.');
    }

    await UsersService.store(
      {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        firstName: 'Burak',
        lastName: 'Avcı',
        gender: Gender.MALE,
        scope: UserScope.SYSTEM,
        roleUuids: [adminRole.uuid],
      },
      prisma,
      true,
    );
    console.log(`✅ Örnek kullanıcı oluşturuldu: ${DEMO_EMAIL}`);
  },
);

export default demoUserSeeder;
