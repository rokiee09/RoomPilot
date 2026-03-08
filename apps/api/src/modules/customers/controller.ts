import { Elysia } from 'elysia';
import { PaginationService } from '#utils/pagination';
import { auth, authSwagger } from '../auth';
import { customerCreateDto, customerIndexDto, customerShowDto } from './dtos';
import { CustomerFormatter } from './formatters';
import { CustomersService } from './service';

const app = new Elysia({
  prefix: '/customers',
  detail: { tags: ['Customers'] },
})
  .guard(authSwagger, (app) =>
    app
      .use(auth())
      .get(
        '/',
        async ({ query }) => {
          const { data, total } = await CustomersService.index(query);
          return PaginationService.createPaginatedResponse({
            data,
            total,
            query,
            formatter: CustomerFormatter.response,
          });
        },
        customerIndexDto,
      )
      .post(
        '/',
        async ({ body }) => {
          const customer = await CustomersService.store(body);
          return CustomerFormatter.response(customer);
        },
        customerCreateDto,
      )
      .get(
        '/:id',
        async ({ params }) => {
          const customer = await CustomersService.show(params.id, true);
          return CustomerFormatter.response(customer);
        },
        customerShowDto,
      ),
  );

export default app;
