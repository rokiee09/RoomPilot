import { createFileRoute } from '@tanstack/react-router';
import { env } from '#/config/env';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/check-in/$id')({
  component: CheckInPage,
});

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

function CheckInPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [done, setDone] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reservation', id, 'check-in-info'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/reservations/${id}/check-in-info`, { credentials: 'include' });
      if (!res.ok) throw new Error('Rezervasyon bulunamadı');
      return res.json();
    },
    enabled: !!id && !done,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/reservations/${id}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? 'Check-in yapılamadı');
      }
      return res.json();
    },
    onSuccess: () => {
      setDone(true);
      toast.success('Check-in başarılı!');
      queryClient.invalidateQueries({ queryKey: ['reservation', id, 'check-in-info'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Hata'),
  });

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-muted/30 p-4">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-muted/30 p-4">
        <div className="text-center">
          <p className="text-destructive font-medium">Rezervasyon bulunamadı veya link geçersiz.</p>
        </div>
      </div>
    );
  }

  const alreadyCheckedIn = !!data.checkInTime;
  const alreadyCheckedOut = !!data.checkOutTime;

  return (
    <div className="min-h-svh flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold">QR Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">{data.entityName}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Müşteri</dt>
            <dd className="font-medium">{data.customerName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tarih / Saat</dt>
            <dd className="font-medium">
              {data.dateTime ? format(new Date(data.dateTime), 'dd.MM.yyyy HH:mm') : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Kişi sayısı</dt>
            <dd className="font-medium">{data.partySize}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Durum</dt>
            <dd className="font-medium">{data.status}</dd>
          </div>
        </dl>
        <div className="mt-6">
          {alreadyCheckedOut ? (
            <p className="text-sm text-muted-foreground">Bu rezervasyon için check-out yapılmış.</p>
          ) : alreadyCheckedIn || done ? (
            <p className="text-sm text-green-600 font-medium">✓ Check-in yapıldı.</p>
          ) : (
            <button
              type="button"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
            >
              {checkInMutation.isPending ? 'İşleniyor…' : 'Check-in Yap'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
