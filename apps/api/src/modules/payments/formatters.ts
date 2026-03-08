import type { Payment } from '@onlyjs/db/client';

type PaymentWithReservation = Payment & {
  reservation?: {
    id: string;
    customerName?: string;
    dateTime?: Date;
    status?: string;
    entityId?: string;
    entity?: { id: string; name: string };
  };
};

export abstract class PaymentFormatter {
  static response(p: PaymentWithReservation) {
    return {
      id: p.id,
      reservationId: p.reservationId,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paymentMethod: p.paymentMethod,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      ...(p.reservation && {
        reservation: {
          id: p.reservation.id,
          customerName: p.reservation.customerName,
          dateTime: p.reservation.dateTime,
          status: p.reservation.status,
          entityId: p.reservation.entityId,
          entity: p.reservation.entity,
        },
      }),
    };
  }
}
