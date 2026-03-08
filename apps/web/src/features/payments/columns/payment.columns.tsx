import { Badge } from '#/components/ui/badge';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import type { Payment } from '../types';

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  COMPLETED: 'Tamamlandı',
  FAILED: 'Başarısız',
  REFUNDED: 'İade',
};

const methodLabels: Record<string, string> = {
  CREDIT_CARD: 'Kredi Kartı',
  CASH: 'Nakit',
  BANK_TRANSFER: 'Havale',
  STRIPE: 'Stripe',
};

export const paymentsColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'reservation',
    header: 'Rezervasyon / Müşteri',
    cell: ({ row }) => {
      const r = row.original.reservation;
      return (
        <div>
          <div className="font-medium">{r?.customerName ?? '-'}</div>
          <div className="text-xs text-muted-foreground">
            {r?.dateTime ? format(new Date(r.dateTime), 'dd.MM.yyyy HH:mm') : ''} · {r?.entity?.name ?? ''}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Tutar',
    cell: ({ row }) => {
      const amount = row.original.amount;
      const currency = row.original.currency || 'TRY';
      return (
        <span className="font-medium">
          {Number(amount).toLocaleString('tr-TR')} {currency}
        </span>
      );
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Yöntem',
    cell: ({ row }) => methodLabels[row.original.paymentMethod] ?? row.original.paymentMethod,
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === 'COMPLETED' ? 'default' : status === 'FAILED' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{statusLabels[status] ?? status}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Tarih',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'dd.MM.yyyy HH:mm'),
  },
];
