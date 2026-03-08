import { Elysia } from 'elysia';
import { PaginationService } from '#utils/pagination';
import { auth, authSwagger } from '../auth';
import {
  reservationCheckInDto,
  reservationCheckInInfoDto,
  reservationCheckOutDto,
  reservationCreateDto,
  reservationIndexDto,
  reservationShowDto,
  reservationUpdateStatusDto,
} from './dtos';
import { ReservationFormatter } from './formatters';
import { ReservationsService } from './service';

let app = new Elysia({
  prefix: '/reservations',
  detail: { tags: ['Reservations'] },
});

// QR check-in: her zaman public (link ile gelen müşteri check-in yapabilsin)
app = app
  .get(
    '/:id/check-in-info',
    async ({ params }) => {
      const reservation = await ReservationsService.show(params.id);
      return ReservationFormatter.checkInInfo(reservation);
    },
    reservationCheckInInfoDto,
  )
  .patch(
    '/:id/check-in',
    async ({ params, body }) => {
      const reservation = await ReservationsService.checkIn(params.id, body?.roomId);
      return ReservationFormatter.response(reservation);
    },
    reservationCheckInDto,
  );

const registerReadRoutes = (app: Elysia) =>
  app
    .get(
      '/',
      async ({ query }) => {
        const { data, total } = await ReservationsService.index(query);
        return PaginationService.createPaginatedResponse({
          data,
          total,
          query,
          formatter: ReservationFormatter.response,
        });
      },
      reservationIndexDto,
    )
    .get(
      '/:id',
      async ({ params }) => {
        const reservation = await ReservationsService.show(params.id);
        return ReservationFormatter.response(reservation);
      },
      reservationShowDto,
    )
    .patch(
      '/:id/check-out',
      async ({ params }) => {
        const reservation = await ReservationsService.checkOut(params.id);
        return ReservationFormatter.response(reservation);
      },
      reservationCheckOutDto,
    );

if (process.env.NODE_ENV !== 'production') {
  // Development'ta dashboard verisini gorebilmek icin listeleme okumalarini auth'suz ac.
  app = registerReadRoutes(app)
    .post(
      '/',
      async ({ body }) => {
        const reservation = await ReservationsService.store({
          entityId: body.entityId,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          dateTime: new Date(body.dateTime),
          partySize: body.partySize,
        });
        return ReservationFormatter.response(reservation);
      },
      reservationCreateDto,
    )
    .patch(
    '/:id/status',
    async ({ params, body }) => {
      const reservation = await ReservationsService.updateStatus(params.id, body.status);
      return ReservationFormatter.response(reservation);
    },
    reservationUpdateStatusDto,
  );
} else {
  app = app.guard(authSwagger, (app) =>
    registerReadRoutes(app.use(auth()))
      .post(
        '/',
        async ({ body }) => {
          const reservation = await ReservationsService.store({
            entityId: body.entityId,
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.customerPhone,
            dateTime: new Date(body.dateTime),
            partySize: body.partySize,
          });
          return ReservationFormatter.response(reservation);
        },
        reservationCreateDto,
      )
      .patch(
        '/:id/status',
        async ({ params, body }) => {
          const reservation = await ReservationsService.updateStatus(params.id, body.status);
          return ReservationFormatter.response(reservation);
        },
        reservationUpdateStatusDto,
      ),
  );
}

export default app;
