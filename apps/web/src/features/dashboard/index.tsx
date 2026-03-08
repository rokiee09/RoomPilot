import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { Button } from '#/components/ui/button';
import { env } from '#/config/env';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useReservations } from '#/features/reservations';
import { useEntities } from '#/features/entities';
import { useCustomers } from '#/features/customers';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import {
  Calendar,
  Users,
  TrendingUp,
  LayoutGrid,
  Plus,
  Hotel,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

function useDashboardStats() {
  const today = new Date();
  const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

  const { meta: todayMeta, isLoading: todayLoading } = useReservations({
    fromDate,
    toDate,
    perPage: 1,
  });
  const { reservations: recentReservations, isLoading: recentLoading } = useReservations({
    perPage: 10,
    sortBy: 'dateTime',
    sortOrder: 'desc',
  });
  const { meta: customersMeta, isLoading: customersLoading } = useCustomers({ perPage: 1 });

  const { data: reportSummary, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/reports/summary`, { credentials: 'include' });
      if (!res.ok) throw new Error('Rapor yüklenemedi');
      return res.json() as Promise<{
        totalReservations?: number;
        totalRevenue?: number;
        weeklyRevenue?: number;
        dailyReservations?: { day: string; count: number; label: string }[];
        revenueByMonth?: { monthName: string; total: number }[];
        occupancyRate?: number;
      }>;
    },
  });

  return {
    todayCount: todayMeta?.total ?? 0,
    totalReservations: reportSummary?.totalReservations ?? 0,
    customersCount: customersMeta?.total ?? 0,
    occupancyRate: reportSummary?.occupancyRate ?? 0,
    recentReservations: Array.isArray(recentReservations) ? recentReservations : [],
    totalRevenue: reportSummary?.totalRevenue ?? 0,
    revenueByMonth: reportSummary?.revenueByMonth ?? [],
    dailyReservations: reportSummary?.dailyReservations ?? [],
    isLoading:
      todayLoading || recentLoading || customersLoading || reportLoading,
  };
}

type AvailabilityItem = { uuid: string; roomTypeName: string; status: string; label: string };

export default function Dashboard() {
  const navigate = useNavigate();
  const { entities, meta: entitiesMeta } = useEntities({ perPage: 5 });
  const firstEntityId = entities[0]?.id ?? '';
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { data: lowStockAlerts = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ['entities', 'low-stock-alerts'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/low-stock-alerts`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json() as Promise<
        Array<{ id: string; name: string; quantity: number; minQuantity: number | null; unit: string; entity?: { id: string; name: string; type: string } }>
      >;
    },
  });

  const { data: occupancyMap = [], isLoading: occupancyLoading } = useQuery({
    queryKey: ['entity', firstEntityId, 'availability', todayStr],
    queryFn: async () => {
      const res = await fetch(
        `${getApiBase()}/entities/${firstEntityId}/availability?date=${todayStr}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<AvailabilityItem[]>;
    },
    enabled: !!firstEntityId,
  });

  const statusDot = (status: string) => {
    if (status === 'AVAILABLE_CLEAN') return <span className="text-green-600">🟢</span>;
    if (status === 'OCCUPIED') return <span className="text-red-600">🔴</span>;
    if (status === 'AVAILABLE_DIRTY') return <span className="text-amber-600">🟡</span>;
    return <span className="text-muted-foreground">⚪</span>;
  };

  const {
    todayCount,
    totalReservations,
    customersCount,
    occupancyRate,
    recentReservations,
    totalRevenue,
    revenueByMonth,
    dailyReservations,
    isLoading,
  } = useDashboardStats();


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-indigo-600 bg-clip-text font-semibold text-transparent">
            RoomPilot
          </span>
          {' – '}Otel ve rezervasyon yönetim paneli
        </p>
      </div>

      {/* Hızlı Aksiyon Butonları */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => navigate({ to: '/reservations/create' })}>
          <Plus className="mr-2 h-5 w-5" />
          Yeni Rezervasyon
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate({ to: '/customers/create' })}>
          <Plus className="mr-2 h-5 w-5" />
          Müşteri Ekle
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate({ to: '/entities/create' })}>
          <Plus className="mr-2 h-5 w-5" />
          İşletme Ekle
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate({ to: '/availability' })}>
          <LayoutGrid className="mr-2 h-5 w-5" />
          Doluluk
        </Button>
      </div>

      {/* Ana İstatistik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Rezervasyon 🟦 */}
        <Card
          className="cursor-pointer border-l-4 border-l-blue-500 bg-blue-500/5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
          onClick={() => navigate({ to: '/reservations' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rezervasyon</CardTitle>
            <Calendar className="h-10 w-10 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <span className="text-muted-foreground">Yükleniyor...</span>
            ) : (
              <span className="text-3xl font-bold">{totalReservations}</span>
            )}
          </CardContent>
        </Card>

        {/* Müşteri 🟩 */}
        <Card
          className="cursor-pointer border-l-4 border-l-green-500 bg-green-500/5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
          onClick={() => navigate({ to: '/customers' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri</CardTitle>
            <Users className="h-10 w-10 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <span className="text-muted-foreground">Yükleniyor...</span>
            ) : (
              <span className="text-3xl font-bold">{customersCount}</span>
            )}
          </CardContent>
        </Card>

        {/* Gelir 🟨 */}
        <Card
          className="cursor-pointer border-l-4 border-l-amber-500 bg-amber-500/5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
          onClick={() => navigate({ to: '/payments' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gelir</CardTitle>
            <TrendingUp className="h-10 w-10 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <span className="text-muted-foreground">Yükleniyor...</span>
            ) : (
              <span className="text-3xl font-bold">
                {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue} ₺
              </span>
            )}
          </CardContent>
        </Card>

        {/* İşletme 🟪 */}
        <Card
          className="cursor-pointer border-l-4 border-l-violet-500 bg-violet-500/5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
          onClick={() => navigate({ to: '/entities' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşletme</CardTitle>
            <Hotel className="h-10 w-10 text-violet-500" />
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{entitiesMeta?.total ?? entities.length}</span>
          </CardContent>
        </Card>

        {/* Stok Uyarıları */}
        <Card
          className={`cursor-pointer border-l-4 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${
            lowStockAlerts.length > 0
              ? 'border-l-red-500 bg-red-500/10'
              : 'border-l-emerald-500 bg-emerald-500/5'
          }`}
          onClick={() => navigate({ to: '/entities' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Uyarısı</CardTitle>
            <AlertTriangle
              className={`h-10 w-10 ${lowStockAlerts.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}
            />
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <span className="text-muted-foreground">Yükleniyor...</span>
            ) : lowStockAlerts.length > 0 ? (
              <span className="text-2xl font-bold text-red-600">{lowStockAlerts.length}</span>
            ) : (
              <span className="text-2xl font-bold text-emerald-600">0</span>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockAlerts.length > 0 ? 'Düşük stoklu ürün var' : 'Stok normal'}
            </p>
          </CardContent>
        </Card>

        {/* Doluluk - Occupancy Rate with progress bar */}
        <Card
          className="cursor-pointer border-l-4 border-l-indigo-500 bg-indigo-500/5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
          onClick={() => navigate({ to: '/availability' })}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <LayoutGrid className="h-10 w-10 text-indigo-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Doluluk</p>
            {isLoading ? (
              <span className="text-muted-foreground">Yükleniyor...</span>
            ) : (
              <>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, occupancyRate)}%` }}
                  />
                </div>
                <span className="text-2xl font-bold">%{occupancyRate}</span>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grafikler ve Occupancy Radar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Günlük Rezervasyon Grafiği */}
        {dailyReservations.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Günlük Rezervasyon</CardTitle>
              <p className="text-sm text-muted-foreground">Son 7 gün</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyReservations}>
                  <XAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Occupancy Radar - Doluluk Oranı */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Radar</CardTitle>
            <p className="text-sm text-muted-foreground">Oda doluluk oranı</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={[
                  { subject: 'Rezervasyon', A: Math.min(100, totalReservations), fullMark: 100 },
                  { subject: 'Doluluk', A: occupancyRate, fullMark: 100 },
                  { subject: 'Müşteri', A: Math.min(100, customersCount * 2), fullMark: 100 },
                  { subject: 'Bugün', A: Math.min(100, todayCount * 20), fullMark: 100 },
                ]}
              >
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Oran" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-2xl font-bold text-primary">Doluluk %{occupancyRate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stok Uyarıları Listesi - Düşük stok varsa */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Düşük Stok Uyarıları</CardTitle>
            <p className="text-sm text-muted-foreground">Minimum stok seviyesinin altına düşen ürünler</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lowStockAlerts.slice(0, 8).map((a: any) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-white dark:bg-background px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {a.entity?.name} · {a.quantity} / {a.minQuantity} {a.unit}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/entities/$id', params: { id: a.entity?.id } })}
                  >
                    İşletmeye Git
                  </Button>
                </li>
              ))}
            </ul>
            {lowStockAlerts.length > 8 && (
              <p className="mt-2 text-sm text-muted-foreground">+{lowStockAlerts.length - 8} daha</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Doluluk Haritası - Oda grid */}
      <Card
        className="cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
        onClick={() => navigate({ to: '/availability' })}
      >
        <CardHeader>
          <CardTitle>Doluluk Haritası</CardTitle>
          <p className="text-sm text-muted-foreground">
            {firstEntityId ? `${entities[0]?.name ?? 'İşletme'} · Bugün` : 'Önce bir işletme ekleyin'}
          </p>
        </CardHeader>
        <CardContent>
          {!firstEntityId ? (
            <p className="text-sm text-muted-foreground">İşletme yok. Doluluk görüntülemek için işletme ekleyin.</p>
          ) : occupancyLoading ? (
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          ) : occupancyMap.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bu işletmede oda/masa kaydı yok.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {occupancyMap.map((item) => (
                <span
                  key={item.uuid}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
                >
                  {statusDot(item.status)}
                  <span>
                    {item.roomTypeName} {item.uuid.slice(0, 6)}
                  </span>
                  <span className="text-muted-foreground text-xs">({item.label})</span>
                </span>
              ))}
            </div>
          )}
          {firstEntityId && occupancyMap.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">Tümünü görmek için Doluluk sayfasına gidin.</p>
          )}
        </CardContent>
      </Card>

      {/* Aylık Gelir + Activity Feed */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {revenueByMonth.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Aylık Gelir</CardTitle>
              <p className="text-sm text-muted-foreground">Bu yıl tamamlanan ödemeler</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByMonth}>
                  <XAxis dataKey="monthName" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} ₺`} />
                  <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Son Hareketler</CardTitle>
            <p className="text-sm text-muted-foreground">Recent Activity</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Yükleniyor...</p>
            ) : recentReservations.length === 0 ? (
              <p className="text-muted-foreground">Henüz hareket yok.</p>
            ) : (
              <ul className="space-y-3">
                {recentReservations.slice(0, 5).map((r: any) => (
                  <li
                    key={r.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm hover:bg-muted/40 transition-colors"
                    onClick={() => navigate({ to: '/reservations/$id', params: { id: r.id } })}
                  >
                    <span className="text-green-600 mt-0.5">✔</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{r.customerName || 'Adsız'}</span>
                      <span className="text-muted-foreground"> rezervasyon yaptı</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.entity?.name} · {r.dateTime ? format(new Date(r.dateTime), 'dd.MM HH:mm') : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Son Rezervasyonlar + Hızlı Linkler */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son Rezervasyonlar</CardTitle>
            <p className="text-sm text-muted-foreground">Sistemdeki son 10 rezervasyon</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Yükleniyor...</p>
            ) : recentReservations.length === 0 ? (
              <p className="text-muted-foreground">Henüz rezervasyon yok.</p>
            ) : (
              <ul className="space-y-2">
                {recentReservations.map((r: any) => (
                  <li
                    key={r.id}
                    className="flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm hover:bg-muted/40 transition-colors sm:flex-row sm:items-center sm:justify-between"
                    onClick={() => navigate({ to: '/reservations/$id', params: { id: r.id } })}
                  >
                    <div>
                      <p className="font-medium">{r.customerName || 'Adsız müşteri'}</p>
                      <p className="text-muted-foreground">
                        {r.entity?.name} · {r.dateTime ? format(new Date(r.dateTime), 'dd.MM.yyyy HH:mm') : '-'}
                      </p>
                    </div>
                    <span className="text-muted-foreground">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı Erişim</CardTitle>
            <p className="text-sm text-muted-foreground">Sayfalara hızlı geçiş</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" className="justify-start" onClick={() => navigate({ to: '/entities' })}>
                <Hotel className="mr-2 h-4 w-4" />
                İşletmeler
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate({ to: '/reservations' })}>
                <Calendar className="mr-2 h-4 w-4" />
                Rezervasyonlar
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate({ to: '/customers' })}>
                <Users className="mr-2 h-4 w-4" />
                Müşteriler
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate({ to: '/payments' })}>
                <CreditCard className="mr-2 h-4 w-4" />
                Ödemeler
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
