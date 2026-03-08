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
import { IconBed, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type RoomTypeRow = {
  id: string;
  entityId: string;
  name: string;
  kind: 'ROOM' | 'TABLE';
  capacity: number;
  quantity: number;
  pricePerNight: number | null;
  weekendPrice: number | null;
};

export function RoomTypesSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'ROOM' | 'TABLE'>('ROOM');
  const [capacity, setCapacity] = useState('1');
  const [quantity, setQuantity] = useState('1');
  const [pricePerNight, setPricePerNight] = useState('');
  const [weekendPrice, setWeekendPrice] = useState('');

  const { data: roomTypes = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'room-types'],
    queryFn: async () => {
      const res = await fetch(`${env.apiUrl}/entities/${entityId}/room-types`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<RoomTypeRow[]>;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${env.apiUrl}/entities/${entityId}/room-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          kind,
          capacity: parseInt(capacity, 10) || 1,
          quantity: parseInt(quantity, 10) || 1,
          pricePerNight: pricePerNight ? parseFloat(pricePerNight) : undefined,
          weekendPrice: weekendPrice ? parseFloat(weekendPrice) : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message ?? 'Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'room-types'] });
      setName('');
      setCapacity('1');
      setQuantity('1');
      setPricePerNight('');
      setWeekendPrice('');
      toast.success('Oda/masa tipi eklendi');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Hata'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (rtId: string) => {
      const res = await fetch(`${env.apiUrl}/entities/${entityId}/room-types/${rtId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'room-types'] });
      toast.success('Silindi');
    },
    onError: () => toast.error('Silinemedi'),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconBed className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Oda / Masa Tipleri</CardTitle>
        </div>
        <CardDescription>
          Otel için oda tipleri veya restoran için masa tipleri ekleyin. Fiyat (gece/kişi) isteğe bağlı.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label>Ad (örn. Çift Kişilik, 4 Kişilik Masa)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tip adı"
            />
          </div>
          <div className="space-y-2">
            <Label>Tür</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as 'ROOM' | 'TABLE')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROOM">Oda</SelectItem>
                <SelectItem value="TABLE">Masa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kapasite (kişi)</Label>
            <Input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Adet</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fiyat hafta içi (₺)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="İsteğe bağlı"
            />
          </div>
          <div className="space-y-2">
            <Label>Fiyat hafta sonu (₺)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={weekendPrice}
              onChange={(e) => setWeekendPrice(e.target.value)}
              placeholder="İsteğe bağlı"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!name.trim()) {
              toast.error('Ad girin');
              return;
            }
            createMutation.mutate();
          }}
          disabled={createMutation.isPending}
        >
          Ekle
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : roomTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz oda/masa tipi yok.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Kapasite</TableHead>
                <TableHead>Adet</TableHead>
                <TableHead>Hafta içi (₺)</TableHead>
                <TableHead>Hafta sonu (₺)</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.map((rt) => (
                <TableRow key={rt.id}>
                  <TableCell>{rt.name}</TableCell>
                  <TableCell>{rt.kind === 'ROOM' ? 'Oda' : 'Masa'}</TableCell>
                  <TableCell>{rt.capacity}</TableCell>
                  <TableCell>{rt.quantity}</TableCell>
                  <TableCell>{rt.pricePerNight != null ? rt.pricePerNight : '–'}</TableCell>
                  <TableCell>{rt.weekendPrice != null ? rt.weekendPrice : '–'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(rt.id)}
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
