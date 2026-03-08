import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { env } from '#/config/env';
import { useEntities } from '#/features/entities';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { IconCheck, IconX, IconBucket } from '@tabler/icons-react';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

type AvailabilityItem = { uuid: string; roomTypeName: string; status: string; label: string };

export default function AvailabilityPage() {
  const [entityId, setEntityId] = useState<string>('');
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const { entities } = useEntities({ perPage: 200 });

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'availability', date],
    queryFn: async () => {
      const res = await fetch(
        `${getApiBase()}/entities/${entityId}/availability?date=${date}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<AvailabilityItem[]>;
    },
    enabled: !!entityId,
  });

  const statusIcon = (status: string) => {
    if (status === 'AVAILABLE_CLEAN') return <IconCheck className="h-5 w-5 text-green-600" />;
    if (status === 'OCCUPIED') return <IconX className="h-5 w-5 text-red-600" />;
    if (status === 'AVAILABLE_DIRTY') return <IconBucket className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Doluluk / Uygunluk</h1>
          <p className="text-muted-foreground">
            İşletmeye ve tarihe göre oda/masa durumunu görüntüleyin (✔ boş, ❌ dolu, 🧹 temizlik).
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Durum Özeti</CardTitle>
            <CardDescription>İşletme ve tarih seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">İşletme</label>
                <Select value={entityId} onValueChange={setEntityId}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="İşletme seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} ({e.type === 'RESTAURANT' ? 'Restoran' : 'Otel'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarih</label>
                <input
                  type="date"
                  className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            {!entityId ? (
              <p className="text-sm text-muted-foreground">Önce bir işletme seçin.</p>
            ) : isLoading ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : availability.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bu işletmede oda/masa kaydı yok.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {availability.map((item) => (
                  <li
                    key={item.uuid}
                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                  >
                    {statusIcon(item.status)}
                    <span className="font-medium">
                      {item.roomTypeName} ({item.uuid.slice(0, 8)})
                    </span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
