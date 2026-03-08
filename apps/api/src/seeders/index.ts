// API Seeders - Dynamic Exports
// Tüm API seeder'ları dinamik import ile yüklenir (circular dependency önlemek için)

import type { Seeder } from '@onlyjs/db/seeder/interfaces';

// Dinamik import ile seeder'ları yükle
export async function loadApiSeeders(): Promise<Seeder[]> {
  const seeders: Seeder[] = [];

  try {
    const systemAdminModule = await import('./system-initialization.seeder');
    seeders.push(systemAdminModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load system-initialization seeder:', error);
  }

  try {
    const demoUserModule = await import('./demo-user.seeder');
    seeders.push(demoUserModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load demo-user seeder:', error);
  }

  try {
    const worldDataModule = await import('./world-data.seeder');
    seeders.push(worldDataModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load world-data seeder:', error);
  }

  try {
    const usersModule = await import('./users.seeder');
    seeders.push(usersModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load users seeder:', error);
  }

  try {
    const companyModule = await import('./company.seeder');
    seeders.push(companyModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load company seeder:', error);
  }

  try {
    const replaceDemoModule = await import('./replace-demo.seeder');
    seeders.push(replaceDemoModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load replace-demo seeder:', error);
  }

  try {
    const customersModule = await import('./customers.seeder');
    seeders.push(customersModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load customers seeder:', error);
  }

  try {
    const entitiesRestaurantsModule = await import('./entities-restaurants.seeder');
    seeders.push(entitiesRestaurantsModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load entities-restaurants seeder:', error);
  }

  try {
    const entitiesExtendedModule = await import('./entities-extended.seeder');
    seeders.push(entitiesExtendedModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load entities-extended seeder:', error);
  }

  try {
    const reservationsModule = await import('./reservations.seeder');
    seeders.push(reservationsModule.default);
  } catch (error) {
    console.warn('⚠️ Failed to load reservations seeder:', error);
  }

  return seeders.filter(Boolean);
}
