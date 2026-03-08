import { Elysia } from 'elysia';
import { PaginationService } from '#utils/pagination';
import { auth, authSwagger } from '../auth';
import {
  paymentCreateDto,
  paymentIndexDto,
  paymentShowDto,
  paymentUpdateDto,
} from './dtos';
import { PaymentFormatter } from './formatters';
import { PaymentsService } from './service';

const app = new Elysia({
  prefix: '/payments',
  detail: { tags: ['Payments'] },
})
  .guard(authSwagger, (app) =>
    app
      .use(auth())
      .get(
        '/',
        async ({ query }) => {
          const { data, total } = await PaymentsService.index(query);
          return PaginationService.createPaginatedResponse({
            data,
            total,
            query,
            formatter: PaymentFormatter.response,
          });
        },
        paymentIndexDto,
      )
      .get(
        '/:id',
        async ({ params }) => {
          const payment = await PaymentsService.show(params.id);
          return PaymentFormatter.response(payment);
        },
        paymentShowDto,
      )
      .post(
        '/',
        async ({ body }) => {
          const payment = await PaymentsService.store({
            reservationId: body.reservationId,
            amount: body.amount,
            currency: body.currency,
            status: body.status,
            paymentMethod: body.paymentMethod,
          });
          return PaymentFormatter.response(payment);
        },
        paymentCreateDto,
      )
      .put(
        '/:id',
        async ({ params, body }) => {
          const payment = await PaymentsService.update(params.id, {
            status: body.status,
            amount: body.amount,
          });
          return PaymentFormatter.response(payment);
        },
        paymentUpdateDto,
      ),
  );

export default app;
