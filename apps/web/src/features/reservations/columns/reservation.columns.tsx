import { Badge } from '#/components/ui/badge';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import type { Reservation } from '../types';

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal',
  COMPLETED: 'Tamamlandı',
};

export const reservationsColumns: ColumnDef<Reservation>[] = [
  {
    accessorKey: 'customerName',
    header: 'Müşteri',
    cell: ({ row }) => <div className="font-medium">{row.getValue('customerName')}</div>,
  },
  {
    accessorKey: 'entity',
    header: 'İşletme',
    cell: ({ row }) => {
      const entity = row.original.entity;
      return <span className="text-muted-foreground">{entity?.name ?? '-'}</span>;
    },
  },
  {
    accessorKey: 'dateTime',
    header: 'Tarih / Saat',
    cell: ({ row }) => {
      const dt = row.getValue('dateTime') as string;
      return <span>{dt ? format(new Date(dt), 'dd.MM.yyyy HH:mm') : '-'}</span>;
    },
  },
  {
    accessorKey: 'partySize',
    header: 'Kişi',
    cell: ({ row }) => row.getValue('partySize'),
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'APPROVED' ? 'default' : status === 'REJECTED' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{statusLabels[status] ?? status}</Badge>;
    },
  },
  { id: 'actions', header: '', cell: () => null },
];
