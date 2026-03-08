import { DataTable } from '#/components/data-table';
import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { env } from '#/config/env';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { entitiesColumns } from '../columns';
import { useEntities } from '../hooks';
import type { Entity } from '../types';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export default function EntitiesIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [siteId, setSiteId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/sites`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<{ id: string; name: string; slug: string }[]>;
    },
  });

  const {
    entities,
    meta,
    isLoading,
    deleteEntity,
    isDeleting,
  } = useEntities({
    page,
    perPage: 10,
    search: search || undefined,
    city: city || undefined,
    status: status as 'DRAFT' | 'PUBLISHED' | undefined,
    type: type as 'HOTEL' | 'RESTAURANT' | undefined,
    siteId: siteId || undefined,
    sortBy: sortBy as any,
    sortOrder,
  });

  const handleCreate = () => navigate({ to: '/entities/create' });
  const handleEdit = (entity: Entity) => navigate({ to: '/entities/$id', params: { id: entity.id } });
  const handleDelete = (id: string) => {
    if (confirm('Bu işletmeyi silmek istediğinize emin misiniz?')) deleteEntity(id);
  };

  const columnsWithActions = useMemo(
    () =>
      entitiesColumns.map((col) => {
        if (col.id === 'actions')
          return {
            ...col,
            cell: ({ row }: { row: { original: Entity } }) => (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)} disabled={isDeleting}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(row.original.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ),
          };
        return col;
      }),
    [isDeleting],
  );

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">İşletmeler</h1>
          </div>
          <p className="text-muted-foreground">
            Otel ve restoran işletmelerini yönetin. Yeni işletme ekleyebilir, düzenleyebilir veya silebilirsiniz.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni İşletme
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Şehir"
              className="w-[120px]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Select value={type ?? 'all'} onValueChange={(v) => setType(v === 'all' ? undefined : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="HOTEL">Otel</SelectItem>
                <SelectItem value="RESTAURANT">Restoran</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status ?? 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="DRAFT">Taslak</SelectItem>
                <SelectItem value="PUBLISHED">Yayında</SelectItem>
              </SelectContent>
            </Select>
            <Select value={siteId ?? 'all'} onValueChange={(v) => setSiteId(v === 'all' ? undefined : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Bölge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm bölgeler</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy ?? 'createdAt'} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Ad</SelectItem>
                <SelectItem value="city">Şehir</SelectItem>
                <SelectItem value="createdAt">Oluşturulma</SelectItem>
                <SelectItem value="updatedAt">Güncellenme</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Artan</SelectItem>
                <SelectItem value="desc">Azalan</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                className="pl-9 w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columnsWithActions}
              data={entities}
              isLoading={isLoading}
              manualPagination
              pageCount={meta.pageCount}
              pagination={{ pageIndex: page - 1, pageSize: 10 }}
              onPaginationChange={(updater) => {
                const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: 10 }) : { pageIndex: 0, pageSize: 10 };
                setPage(next.pageIndex + 1);
              }}
              onRowClick={(row) => handleEdit(row)}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
