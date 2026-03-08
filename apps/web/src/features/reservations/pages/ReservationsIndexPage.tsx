import { DataTable } from '#/components/data-table';
import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { Link, useNavigate } from '@tanstack/react-router';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Eye, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEntities } from '#/features/entities';
import { ReservationsCalendar } from '../components/ReservationsCalendar';
import { reservationsColumns } from '../columns';
import { useReservations } from '../hooks';
import type { Reservation, ReservationStatus } from '../types';

const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'CANCELLED', label: 'İptal' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
];

const ENTITY_TYPE_OPTIONS: { value: 'all' | 'HOTEL' | 'RESTAURANT'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'RESTAURANT', label: 'Restoran' },
  { value: 'HOTEL', label: 'Otel' },
];

export default function ReservationsIndexPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [entityType, setEntityType] = useState<'all' | 'HOTEL' | 'RESTAURANT'>('all');
  const [entityId, setEntityId] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>('dateTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const { entities } = useEntities({
    perPage: 200,
    type: entityType === 'all' ? undefined : entityType,
  });

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);

  const { reservations, meta, isLoading } = useReservations({
    page,
    perPage: 10,
    status: status as ReservationStatus | undefined,
    entityId: entityId || undefined,
    entityType: entityType === 'all' ? undefined : entityType,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sortBy: sortBy as any,
    sortOrder,
  });

  const { reservations: calendarReservations, isLoading: calendarLoading } = useReservations({
    fromDate: format(monthStart, 'yyyy-MM-dd'),
    toDate: format(monthEnd, 'yyyy-MM-dd'),
    perPage: 500,
  });

  const handleCalendarDayClick = (date: Date) => {
    const d = format(date, 'yyyy-MM-dd');
    setFromDate(d);
    setToDate(d);
    setActiveTab('list');
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_OPTIONS.forEach((o) => { counts[o.value] = 0; });
    reservations.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
    return counts;
  }, [reservations]);

  const columnsWithActions = useMemo(
    () =>
      reservationsColumns.map((col) => {
        if (col.id === 'actions')
          return {
            ...col,
            cell: ({ row }: { row: { original: Reservation } }) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/reservations/$id', params: { id: row.original.id } })}
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
            <h1 className="text-2xl font-bold">Rezervasyonlar</h1>
            <p className="text-muted-foreground">
              Rezervasyonları listeleyin, filtreleyin ve durumlarını güncelleyin.
            </p>
          </div>
          <Button asChild>
            <Link to="/reservations/create">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Rezervasyon
            </Link>
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="calendar">Takvim</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-4">
            <ReservationsCalendar
              reservations={calendarReservations}
              isLoading={calendarLoading}
              onDayClick={handleCalendarDayClick}
              viewMonth={calendarMonth}
              onMonthChange={setCalendarMonth}
            />
            <p className="text-sm text-muted-foreground">
              Bir güne tıklayarak liste görünümünde o günü filtreleyebilirsiniz.
            </p>
          </TabsContent>
          <TabsContent value="list" className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={entityType}
            onValueChange={(v: 'all' | 'HOTEL' | 'RESTAURANT') => {
              setEntityType(v);
              setEntityId('');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="İşletme türü" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={entityId || 'all'}
            onValueChange={(v) => {
              setEntityId(v === 'all' ? '' : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="İşletme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm işletmeler</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name} ({e.type === 'RESTAURANT' ? 'Restoran' : 'Otel'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">Tarih:</span>
          <input
            type="date"
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="date"
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Select value={status ?? 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy ?? 'dateTime'} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateTime">Tarih</SelectItem>
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
        </div>
        <p className="text-sm text-muted-foreground">
          Toplam <strong>{meta.total}</strong> rezervasyon
          {reservations.length > 0 && (
            <> · Bu sayfada: {STATUS_OPTIONS.map((o) => `${o.label}: ${statusCounts[o.value] ?? 0}`).join(', ')}</>
          )}
        </p>
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columnsWithActions}
              data={reservations}
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
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
