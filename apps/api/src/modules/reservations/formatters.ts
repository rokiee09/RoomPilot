import type { Reservation } from '@onlyjs/db/client';

type ReservationWithEntity = Reservation & {
  entity?: { id: string; name: string; type: string; city: string };
  customer?: { id: string; name: string; email: string | null; phone: string | null } | null;
  room?: { uuid: string; status: string; roomType: { name: string } };
};

export abstract class ReservationFormatter {
  static response(r: ReservationWithEntity) {
    return {
      id: r.id,
      entityId: r.entityId,
      entity: r.entity
        ? { id: r.entity.id, name: r.entity.name, type: r.entity.type, city: r.entity.city }
        : undefined,
      customerId: r.customerId,
      customer: r.customer
        ? { id: r.customer.id, name: r.customer.name, email: r.customer.email, phone: r.customer.phone }
        : undefined,
      customerName: r.customerName,
      dateTime: r.dateTime,
      partySize: r.partySize,
      status: r.status,
      roomId: r.roomId ?? undefined,
      room: r.room
        ? { uuid: r.room.uuid, status: r.room.status, roomTypeName: r.room.roomType?.name }
        : undefined,
      checkInTime: r.checkInTime ?? undefined,
      checkOutTime: r.checkOutTime ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  /** QR / public sayfa için minimal bilgi (check-in yapılmamış mı gösterir) */
  static checkInInfo(r: ReservationWithEntity) {
    return {
      id: r.id,
      customerName: r.customerName,
      dateTime: r.dateTime,
      partySize: r.partySize,
      status: r.status,
      checkInTime: r.checkInTime ?? undefined,
      checkOutTime: r.checkOutTime ?? undefined,
      entityName: r.entity?.name,
    };
  }
}
