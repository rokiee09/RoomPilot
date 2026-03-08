import { PageContainer } from '#/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { env } from '#/config/env';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type Summary = {
  reservationsByMonth: { month: number; monthName: string; count: number }[];
  reservationsByEntity: { entityId: string; entityName: string; count: number }[];
  totalApproved: number;
  year: number;
  revenueByMonth?: { month: number; monthName: string; total: number }[];
  totalRevenue?: number;
};

export default function ReportsPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => {
      const res = await fetch(`${env.apiUrl}/reports/summary`, { credentials: 'include' });
      if (!res.ok) throw new Error('Rapor yüklenemedi');
      return res.json() as Promise<Summary>;
    },
  });

  if (isLoading || !summary) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-48 text-muted-foreground">Yükleniyor...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">
            Rezervasyon özeti ve işletme bazlı istatistikler ({summary.year})
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Onaylanan Rezervasyonlar (Toplam)</CardTitle>
              <CardDescription>Bu yıl onaylanan rezervasyon sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{summary.totalApproved}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toplam Gelir</CardTitle>
              <CardDescription>Tamamlanan ödemeler (bu yıl dahil tüm zamanlar)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {(summary.totalRevenue ?? 0).toLocaleString('tr-TR')} ₺
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İşletme Bazlı Rezervasyonlar</CardTitle>
              <CardDescription>Toplam rezervasyon sayısı (tüm durumlar)</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.reservationsByEntity.length === 0 ? (
                <p className="text-muted-foreground text-sm">Henüz veri yok.</p>
              ) : (
                <ul className="space-y-2">
                  {summary.reservationsByEntity.map((e) => (
                    <li key={e.entityId} className="flex justify-between text-sm">
                      <span>{e.entityName}</span>
                      <span className="font-medium">{e.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Rezervasyon Sayısı</CardTitle>
              <CardDescription>{summary.year} yılı aylara göre rezervasyonlar</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.reservationsByMonth}>
                  <XAxis dataKey="monthName" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aylık Gelir</CardTitle>
              <CardDescription>{summary.year} yılı aylara göre tamamlanan ödemeler (₺)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.revenueByMonth ?? []}>
                  <XAxis dataKey="monthName" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} ₺`} />
                  <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} name="Gelir" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
