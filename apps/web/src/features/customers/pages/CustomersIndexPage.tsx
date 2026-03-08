import { DataTable } from '#/components/data-table';
import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { customersColumns } from '../columns';
import { useCustomers } from '../hooks';
import type { Customer } from '../types';

export default function CustomersIndexPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { customers, meta, isLoading } = useCustomers({
    page,
    perPage: 10,
    search: search || undefined,
  });

  const columnsWithActions = useMemo(
    () =>
      customersColumns.map((col) => {
        if (col.id === 'actions')
          return {
            ...col,
            cell: ({ row }: { row: { original: Customer } }) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/customers/$id', params: { id: row.original.id } })}
              >
                <Eye className="w-4 h-4" />
              </Button>
            ),
          };
        return col;
      }),
    [navigate],
  );

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Müşteriler</h1>
            <p className="text-muted-foreground">Müşteri listesi ve rezervasyon geçmişi.</p>
          </div>
          <Button asChild>
            <Link to="/customers/create">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="İsim veya e-posta ara..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columnsWithActions}
              data={customers}
              isLoading={isLoading}
              manualPagination
              pageCount={meta.pageCount}
              pagination={{ pageIndex: page - 1, pageSize: 10 }}
              onPaginationChange={(updater) => {
                const next =
                  typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: 10 }) : { pageIndex: 0, pageSize: 10 };
                setPage(next.pageIndex + 1);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
