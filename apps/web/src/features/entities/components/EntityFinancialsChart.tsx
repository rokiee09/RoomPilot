import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { env } from '#/config/env';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  NEW_YEAR: 'Yılbaşı',
  BAYRAM: 'Bayram',
  SEASONAL: 'Sezonluk',
  CUSTOM: 'Özel',
};

export function EntityFinancialsChart({ entityId }: { entityId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['entity', entityId, 'financials'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/financials`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<{
        entityType: 'HOTEL' | 'RESTAURANT';
        totalRevenue: number;
        totalExpenses: number;
        profit: number;
        occupancyRate: number | null;
        stockSummary: { totalItems: number; lowStockCount: number; items: Array<{ name: string; quantity: number; minQuantity: number | null; unit: string }> } | null;
        campaigns: Array<{ id: string; name: string; type: string; discountPercent: number | null; startDate: string; endDate: string; isActive: boolean }>;
        chartData: Array<{ month: number; monthName: string; revenue: number; expenses: number; profit: number }>;
      }>;
    },
    enabled: !!entityId,
  });

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kar / Zarar</CardTitle>
          <CardDescription>Gelir ve gider grafiği</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  const { entityType, totalRevenue, totalExpenses, profit, occupancyRate, stockSummary, campaigns, chartData } = data;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gelir Tablosu</CardTitle>
          <CardDescription>
            {entityType === 'HOTEL' ? 'Otel – doluluk, gelir, gider' : 'Restoran – stok, gelir, gider'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Otel: Doluluk | Restoran: Stok özeti */}
          {entityType === 'HOTEL' && occupancyRate != null && (
            <div className="rounded-lg border bg-indigo-50 dark:bg-indigo-950/30 p-3">
              <p className="text-sm text-muted-foreground">Doluluk Oranı</p>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${occupancyRate}%` }} />
              </div>
              <p className="mt-1 text-xl font-bold text-indigo-600">%{occupancyRate}</p>
            </div>
          )}
          {entityType === 'RESTAURANT' && stockSummary && (
            <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-sm text-muted-foreground">Stok Özeti</p>
              <p className="text-lg font-medium">{stockSummary.totalItems} ürün · {stockSummary.lowStockCount} düşük stok</p>
              {stockSummary.items.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {stockSummary.items.slice(0, 5).map((s, i) => (
                    <li key={i}>
                      {s.name}: {s.quantity} {s.unit}
                      {s.minQuantity != null && s.quantity <= s.minQuantity && (
                        <Badge variant="destructive" className="ml-2 text-xs">Düşük</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Kampanyalar */}
          {campaigns && campaigns.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium text-muted-foreground">Kampanyalar</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {campaigns.map((c) => (
                  <Badge key={c.id} variant={c.isActive ? 'default' : 'secondary'}>
                    {CAMPAIGN_TYPE_LABELS[c.type] || c.type}: {c.name}
                    {c.discountPercent != null && ` %${c.discountPercent}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 p-3">
            <p className="text-sm text-muted-foreground">Toplam Gelir</p>
            <p className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="rounded-lg border bg-red-50 dark:bg-red-950/30 p-3">
            <p className="text-sm text-muted-foreground">Toplam Gider</p>
            <p className="text-xl font-bold text-red-600">{totalExpenses.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className={`rounded-lg border p-3 ${profit >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
            <p className="text-sm text-muted-foreground">Kar / Zarar</p>
            <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData}>
              <XAxis dataKey="monthName" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} ₺`} />
              <Tooltip formatter={(v: number) => v.toLocaleString('tr-TR') + ' ₺'} />
              <Legend />
              <Bar dataKey="revenue" name="Gelir" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" name="Kar/Zarar" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        </CardContent>
      </Card>
    </>
  );
}
