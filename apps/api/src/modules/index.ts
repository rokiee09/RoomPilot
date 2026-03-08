import Elysia from 'elysia';
import authController from './auth/controller';
import { companiesController } from './companies';
import { entitiesController } from './entities';
import { reservationsController } from './reservations';
import { customersController } from './customers';
import { fileLibraryAssetsController } from './file-library-assets';
import reportsController from './reports/controller';
import notificationTemplatesController from './notification-templates/controller';
import paymentsController from './payments/controller';
import sitesController from './sites/controller';
import { locationsController } from './locations';
import { postsController } from './posts';
import { systemAdministrationController } from './system-administration';
import { usersController } from './users';
import projectsController from './projects';

const app = new Elysia()
  .use(systemAdministrationController)
  .use(usersController)
  .use(authController)
  .use(postsController)
  .use(projectsController)
  .use(locationsController)
  .use(companiesController)
  .use(entitiesController)
  .use(reservationsController)
  .use(customersController)
  .use(reportsController)
  .use(notificationTemplatesController)
  .use(paymentsController)
  .use(sitesController)
  .use(fileLibraryAssetsController);

// GET / index.ts'te - loadEnv sonrası değerlendirilir (modül import sırasında NODE_ENV henüz yok)

export const swaggerTags: { name: string; description: string }[] = [
  {
    name: 'System Administration',
    description: 'System Administration endpoints',
  },
  { name: 'Audit Logs', description: 'Audit Logs endpoints' },
  { name: 'User', description: 'User endpoints' },
  { name: 'Auth', description: 'Auth endpoints' },
  { name: 'Role', description: 'Role endpoints' },
  { name: 'Post', description: 'Post endpoints' },
  { name: 'Projects', description: 'Project management endpoints - demonstrates different permission levels (System Admin, Company Admin, Company Member)' },
  { name: 'Country', description: 'Country endpoints' },
  { name: 'State', description: 'State endpoints' },
  { name: 'City', description: 'City endpoints' },
  { name: 'Region', description: 'Region endpoints' },
  { name: 'Subregion', description: 'Subregion endpoints' },
  { name: 'File Library Assets', description: 'File Library Assets endpoints' },
  { name: 'Entities', description: 'Hotel/Restaurant entities (CRUD)' },
  { name: 'Reservations', description: 'Reservation management' },
  { name: 'Customers', description: 'Customer list and history' },
  { name: 'Payments', description: 'Payment management for reservations' },
  { name: 'Sites', description: 'Sites/regions for hotel chains (Istanbul, Antalya, Izmir)' },
];

export default app;
