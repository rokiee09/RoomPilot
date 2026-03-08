import { Badge } from '#/components/ui/badge';
import { type ColumnDef } from '@tanstack/react-table';
import type { Entity } from '../types';

export const entitiesColumns: ColumnDef<Entity>[] = [
  {
    accessorKey: 'name',
    header: 'İşletme Adı',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Tür',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'HOTEL' ? 'default' : 'secondary'}>
          {type === 'HOTEL' ? 'Otel' : 'Restoran'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'Şehir',
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('city')}</span>,
  },
  {
    accessorKey: 'site',
    header: 'Bölge',
    cell: ({ row }) => {
      const site = row.original.site;
      return <span className="text-muted-foreground">{site?.name ?? '–'}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'PUBLISHED' ? 'default' : 'outline'}>
          {status === 'PUBLISHED' ? 'Yayında' : 'Taslak'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: () => null,
  },
];
