import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { env } from '#/config/env';
import { useQuery } from '@tanstack/react-query';
import { useReservation, useReservations } from '../hooks';
import type { ReservationStatus } from '../types';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'CANCELLED', label: 'İptal' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
];

export default function ReservationDetailPage() {
  const { id } = useParams({ from: '/_authenticated/reservations/$id' });
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const { data: reservation, isLoading } = useReservation(id);
  const { updateStatus, isUpdating, checkIn, checkOut, isCheckingIn, isCheckingOut } = useReservations({});

  const { data: rooms = [] } = useQuery({
    queryKey: ['entity', reservation?.entityId, 'rooms'],
    queryFn: async () => {
      if (!reservation?.entityId) return [];
      const res = await fetch(`${getApiBase()}/entities/${reservation.entityId}/rooms`, { credentials: 'include' });
      if (!res.ok) return [];
      const list = await res.json();
      return list as { uuid: string; roomType: { name: string }; status: string }[];
    },
    enabled: !!reservation?.entityId && reservation.entity?.type === 'HOTEL' && !reservation.checkInTime,
  });

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (!id) return;
    await updateStatus({ id, status: newStatus });
  };

  const handleCheckIn = async () => {
    if (!id) return;
    try {
      await checkIn({ id, roomId: selectedRoomId || undefined });
      toast.success('Check-in yapıldı');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Check-in yapılamadı');
    }
  };

  const handleCheckOut = async () => {
    if (!id) return;
    try {
      await checkOut(id);
      toast.success('Check-out yapıldı');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Check-out yapılamadı');
    }
  };

  if (isLoading || !reservation) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-48 text-muted-foreground">Yükleniyor...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/reservations' })}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Listeye dön
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Rezervasyon Detayı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Müşteri:</span>
                <p className="font-medium">{reservation.customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">İşletme:</span>
                <p className="font-medium">{reservation.entity?.name ?? '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tarih / Saat:</span>
                <p className="font-medium">
                  {reservation.dateTime ? format(new Date(reservation.dateTime), 'dd.MM.yyyy HH:mm') : '-'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Kişi sayısı:</span>
                <p className="font-medium">{reservation.partySize}</p>
              </div>
              {reservation.room && (
                <div>
                  <span className="text-muted-foreground">Oda:</span>
                  <p className="font-medium">{reservation.room.roomTypeName} ({reservation.room.uuid.slice(0, 8)})</p>
                </div>
              )}
              {reservation.checkInTime && (
                <div>
                  <span className="text-muted-foreground">Check-in:</span>
                  <p className="font-medium">{format(new Date(reservation.checkInTime), 'dd.MM.yyyy HH:mm')}</p>
                </div>
              )}
              {reservation.checkOutTime && (
                <div>
                  <span className="text-muted-foreground">Check-out:</span>
                  <p className="font-medium">{format(new Date(reservation.checkOutTime), 'dd.MM.yyyy HH:mm')}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Durum:</span>
              <Select
                value={reservation.status}
                onValueChange={(v) => handleStatusChange(v as ReservationStatus)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!reservation.checkInTime && reservation.status !== 'CANCELLED' && reservation.status !== 'REJECTED' && (
                <>
                  {reservation.entity?.type === 'HOTEL' && rooms.length > 0 && (
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Oda seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.uuid} value={r.uuid}>
                            {r.roomType?.name ?? 'Oda'} – {r.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button size="sm" onClick={handleCheckIn} disabled={isCheckingIn}>
                    <LogIn className="w-4 h-4 mr-1" />
                    Check-in
                  </Button>
                </>
              )}
              {reservation.checkInTime && !reservation.checkOutTime && (
                <Button size="sm" variant="secondary" onClick={handleCheckOut} disabled={isCheckingOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Check-out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
