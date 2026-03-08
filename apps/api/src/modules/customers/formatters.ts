import type { Customer } from '@onlyjs/db/client';

type CustomerWithReservations = Customer & {
  reservations?: Array<{
    id: string;
    entityId: string;
    entity?: { id: string; name: string; type: string; city: string };
    dateTime: Date;
    partySize: number;
    status: string;
    createdAt: Date;
  }>;
};

export abstract class CustomerFormatter {
  static response(c: CustomerWithReservations) {
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      ...(c.reservations && {
        reservations: c.reservations.map((r) => ({
          id: r.id,
          entityId: r.entityId,
          entity: r.entity,
          dateTime: r.dateTime,
          partySize: r.partySize,
          status: r.status,
          createdAt: r.createdAt,
        })),
      }),
    };
  }
}
