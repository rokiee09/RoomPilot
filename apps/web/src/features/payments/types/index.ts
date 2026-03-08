export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'STRIPE';

export type Payment = {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  reservation?: {
    id: string;
    customerName: string;
    dateTime: string;
    status: string;
    entityId: string;
    entity?: { id: string; name: string };
  };
};

export type PaymentFilters = {
  page?: number;
  perPage?: number;
  reservationId?: string;
  status?: PaymentStatus;
  entityId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
};
