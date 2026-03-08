export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type Reservation = {
  id: string;
  entityId: string;
  entity?: { id: string; name: string; type: string; city: string };
  customerId: string | null;
  customer?: { id: string; name: string; email: string | null; phone: string | null } | null;
  customerName: string;
  dateTime: string;
  partySize: number;
  status: ReservationStatus;
  roomId?: string;
  room?: { uuid: string; status: string; roomTypeName: string };
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
};

export type EntityTypeFilter = 'HOTEL' | 'RESTAURANT';

export type ReservationFilters = {
  page?: number;
  perPage?: number;
  status?: ReservationStatus;
  entityId?: string;
  entityType?: EntityTypeFilter;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'dateTime' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};
