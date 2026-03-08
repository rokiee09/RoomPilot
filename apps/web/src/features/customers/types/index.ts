export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerWithReservations = Customer & {
  reservations: Array<{
    id: string;
    entityId: string;
    entity?: { id: string; name: string; type: string; city: string };
    dateTime: string;
    partySize: number;
    status: string;
    createdAt: string;
  }>;
};

export type CustomerFilters = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};
