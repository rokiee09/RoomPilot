import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import { env } from '#/config/env';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconDoor, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ROOM_STATUS_LABELS } from '#/features/reservations/components/ReservationsCalendar';

const ROOM_STATUS_OPTIONS = [
  'AVAILABLE_CLEAN',
  'AVAILABLE_DIRTY',
  'RESERVED',
  'OCCUPIED',
  'STAYOVER',
  'OUT_OF_SERVICE',
] as const;

export type RoomRow = {
  id: number;
  uuid: string;
  roomTypeId: string;
  roomType: { id: string; name: string; kind: string };
  guestCount: number;
  price: number | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function RoomsSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [roomTypeId, setRoomTypeId] = useState('');
  const [guestCount, setGuestCount] = useState('0');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<string>(ROOM_STATUS_OPTIONS[0]);

  const { data: roomTypes = [] } = useQuery({
    queryKey: ['entity', entityId, 'room-types'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/room-types`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<{ id: string; name: string; kind: string }[]>;
    },
    enabled: !!entityId,
  });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'rooms'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/rooms`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<RoomRow[]>;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomTypeId,
          guestCount: parseInt(guestCount, 10) || 0,
          price: price ? parseFloat(price) : undefined,
          status,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message ?? 'Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'rooms'] });
      setRoomTypeId('');
      setGuestCount('0');
      setPrice('');
      setStatus(ROOM_STATUS_OPTIONS[0]);
      toast.success('Oda eklendi');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Hata'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ roomId, body }: { roomId: string; body: { status?: string; isActive?: boolean } }) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Güncellenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'rooms'] });
      toast.success('Güncellendi');
    },
    onError: () => toast.error('Güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'rooms'] });
      toast.success('Oda kaldırıldı');
    },
    onError: () => toast.error('Silinemedi'),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconDoor className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Odalar</CardTitle>
        </div>
        <CardDescription>
          Oda tiplerine göre tek tek odaları ekleyin. Durum: temiz, kirli, rezerve, dolu, devam, bakımda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Oda tipi</Label>
            <Select value={roomTypeId} onValueChange={setRoomTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id}>
                    {rt.name} ({rt.kind === 'ROOM' ? 'Oda' : 'Masa'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Misafir sayısı</Label>
            <Input
              type="number"
              min={0}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fiyat (₺)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="İsteğe bağlı"
            />
          </div>
          <div className="space-y-2">
            <Label>Durum</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ROOM_STATUS_LABELS[s] ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!roomTypeId) {
              toast.error('Oda tipi seçin');
              return;
            }
            createMutation.mutate();
          }}
          disabled={createMutation.isPending}
        >
          Oda Ekle
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz oda eklenmemiş. Önce oda tipleri ekleyin.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tip</TableHead>
                <TableHead>Misafir</TableHead>
                <TableHead>Fiyat (₺)</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Aktif</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.uuid}>
                  <TableCell>{r.roomType.name}</TableCell>
                  <TableCell>{r.guestCount}</TableCell>
                  <TableCell>{r.price != null ? r.price : '–'}</TableCell>
                  <TableCell>
                    <Select
                      value={r.status}
                      onValueChange={(v) => updateMutation.mutate({ roomId: r.uuid, body: { status: v } })}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {ROOM_STATUS_LABELS[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{r.isActive ? 'Evet' : 'Hayır'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(r.uuid)}
                      disabled={deleteMutation.isPending}
                    >
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
