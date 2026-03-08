import { type ColumnDef } from '@tanstack/react-table';
import type { Customer } from '../types';

export const customersColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Ad',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: 'E-posta',
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('email') ?? '-'}</span>,
  },
  {
    accessorKey: 'phone',
    header: 'Telefon',
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('phone') ?? '-'}</span>,
  },
  {
    id: 'actions',
    header: '',
    cell: () => null,
  },
];
