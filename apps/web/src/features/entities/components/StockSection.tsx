import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
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
import { IconPackage, IconTrash, IconPencil, IconAlertTriangle, IconStack2 } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type StockRow = {
  id: string;
  entityId: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number | null;
  createdAt: string;
  updatedAt: string;
};

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

const UNITS = ['adet', 'kg', 'lt', 'gr', 'ml', 'paket', 'kutu', 'şişe'] as const;

/** Örnek restoran ürünleri – toplu ekleme için (isim, miktar, birim, min uyarı) */
const PRESET_STOCK_ITEMS: Array<{ name: string; quantity: number; unit: string; minQuantity: number | null }> = [
  { name: 'Domates', quantity: 50, unit: 'kg', minQuantity: 10 },
  { name: 'Salatalık', quantity: 30, unit: 'kg', minQuantity: 5 },
  { name: 'Soğan', quantity: 40, unit: 'kg', minQuantity: 10 },
  { name: 'Biber', quantity: 25, unit: 'kg', minQuantity: 5 },
  { name: 'Patates', quantity: 80, unit: 'kg', minQuantity: 20 },
  { name: 'Havuç', quantity: 20, unit: 'kg', minQuantity: 5 },
  { name: 'Marul', quantity: 15, unit: 'adet', minQuantity: 5 },
  { name: 'Maydanoz', quantity: 5, unit: 'demet', minQuantity: 2 },
  { name: 'Dereotu', quantity: 3, unit: 'demet', minQuantity: 1 },
  { name: 'Limon', quantity: 20, unit: 'kg', minQuantity: 5 },
  { name: 'Zeytinyağı', quantity: 20, unit: 'lt', minQuantity: 5 },
  { name: 'Ayçiçek yağı', quantity: 15, unit: 'lt', minQuantity: 5 },
  { name: 'Tereyağı', quantity: 10, unit: 'kg', minQuantity: 2 },
  { name: 'Yoğurt', quantity: 15, unit: 'kg', minQuantity: 5 },
  { name: 'Süt', quantity: 24, unit: 'lt', minQuantity: 6 },
  { name: 'Peynir (beyaz)', quantity: 12, unit: 'kg', minQuantity: 3 },
  { name: 'Kaşar peyniri', quantity: 8, unit: 'kg', minQuantity: 2 },
  { name: 'Yumurta', quantity: 180, unit: 'adet', minQuantity: 60 },
  { name: 'Kıyma', quantity: 25, unit: 'kg', minQuantity: 5 },
  { name: 'Tavuk göğsü', quantity: 20, unit: 'kg', minQuantity: 5 },
  { name: 'Tavuk but', quantity: 15, unit: 'kg', minQuantity: 5 },
  { name: 'Kuzu pirzola', quantity: 12, unit: 'kg', minQuantity: 3 },
  { name: 'Dana antrikot', quantity: 10, unit: 'kg', minQuantity: 2 },
  { name: 'Balık fileto', quantity: 15, unit: 'kg', minQuantity: 5 },
  { name: 'Karides', quantity: 8, unit: 'kg', minQuantity: 2 },
  { name: 'Pilavlık pirinç', quantity: 25, unit: 'kg', minQuantity: 10 },
  { name: 'Bulgur', quantity: 15, unit: 'kg', minQuantity: 5 },
  { name: 'Makarna', quantity: 20, unit: 'kg', minQuantity: 5 },
  { name: 'Un', quantity: 50, unit: 'kg', minQuantity: 15 },
  { name: 'Şeker', quantity: 20, unit: 'kg', minQuantity: 5 },
  { name: 'Tuz', quantity: 10, unit: 'kg', minQuantity: 2 },
  { name: 'Karabiber', quantity: 2, unit: 'kg', minQuantity: 0.5 },
  { name: 'Pul biber', quantity: 2, unit: 'kg', minQuantity: 0.5 },
  { name: 'Kimyon', quantity: 1, unit: 'kg', minQuantity: 0.2 },
  { name: 'Domates salçası', quantity: 15, unit: 'kg', minQuantity: 5 },
  { name: 'Biber salçası', quantity: 8, unit: 'kg', minQuantity: 2 },
  { name: 'Et suyu bulyon', quantity: 20, unit: 'adet', minQuantity: 5 },
  { name: 'Ketçap', quantity: 12, unit: 'şişe', minQuantity: 3 },
  { name: 'Mayonez', quantity: 8, unit: 'kutu', minQuantity: 2 },
  { name: 'Hardal', quantity: 5, unit: 'şişe', minQuantity: 1 },
  { name: 'Soda', quantity: 48, unit: 'adet', minQuantity: 12 },
  { name: 'Kola', quantity: 36, unit: 'adet', minQuantity: 12 },
  { name: 'Meyve suyu', quantity: 24, unit: 'adet', minQuantity: 6 },
  { name: 'Su (şişe)', quantity: 72, unit: 'adet', minQuantity: 24 },
  { name: 'Ayran', quantity: 24, unit: 'adet', minQuantity: 6 },
  { name: 'Kahve', quantity: 5, unit: 'kg', minQuantity: 1 },
  { name: 'Çay', quantity: 3, unit: 'kg', minQuantity: 1 },
  { name: 'Bardak', quantity: 200, unit: 'adet', minQuantity: 50 },
  { name: 'Tabak', quantity: 150, unit: 'adet', minQuantity: 30 },
  { name: 'Peçete', quantity: 50, unit: 'paket', minQuantity: 10 },
];

export function StockSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [minQuantity, setMinQuantity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState(UNITS[0]);
  const [editMinQuantity, setEditMinQuantity] = useState('');

  const { data: stockList = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'stock'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/stock`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<StockRow[]>;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          quantity: parseFloat(quantity) || 0,
          unit,
          minQuantity: minQuantity === '' ? undefined : parseFloat(minQuantity),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message ?? 'Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'stock'] });
      setName('');
      setQuantity('');
      setMinQuantity('');
      toast.success('Stok kalemi eklendi');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Hata'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ stockId, body }: { stockId: string; body: { name?: string; quantity?: number; unit?: string; minQuantity?: number | null } }) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/stock/${stockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Güncellenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'stock'] });
      setEditingId(null);
      toast.success('Güncellendi');
    },
    onError: () => toast.error('Güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (stockId: string) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/stock/${stockId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'stock'] });
      toast.success('Stok kalemi silindi');
    },
    onError: () => toast.error('Silinemedi'),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (items: Array<{ name: string; quantity: number; unit: string; minQuantity?: number | null }>) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/stock/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message ?? 'Toplu ekleme başarısız');
      return res.json();
    },
    onSuccess: (_, items) => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'stock'] });
      toast.success(`${items.length} stok kalemi eklendi`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Toplu ekleme hatası'),
  });

  const startEdit = (row: StockRow) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditQuantity(String(row.quantity));
    setEditUnit(UNITS.includes(row.unit as any) ? (row.unit as typeof UNITS[number]) : UNITS[0]);
    setEditMinQuantity(row.minQuantity != null ? String(row.minQuantity) : '');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const q = parseFloat(editQuantity);
    updateMutation.mutate({
      stockId: editingId,
      body: {
        name: editName.trim(),
        quantity: Number.isFinite(q) ? q : 0,
        unit: editUnit,
        minQuantity: editMinQuantity === '' ? null : parseFloat(editMinQuantity),
      },
    });
  };

  const isLow = (row: StockRow) =>
    row.minQuantity != null && row.minQuantity > 0 && row.quantity <= row.minQuantity;

  return (
    <Card id="stock-section">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconPackage className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Stok Durumu (Restoran)</CardTitle>
        </div>
        <CardDescription>
          Malzeme ve ürün stokları: miktar, birim ve minimum uyarı eşiği. Stok minimumun altına düşünce uyarı gösterilir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Ürün / Malzeme</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Domates" />
          </div>
          <div className="space-y-2">
            <Label>Miktar</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Birim</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value as typeof UNITS[number])}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Min. uyarı (opsiyonel)</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="Eşik"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!name.trim()) {
                toast.error('Ürün adı girin');
                return;
              }
              createMutation.mutate();
            }}
            disabled={createMutation.isPending}
          >
            Stok Ekle
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <IconStack2 className="mr-1 h-4 w-4" />
                Toplu ürün ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Toplu stok ekleme</DialogTitle>
                <DialogDescription>
                  Örnek restoran ürünleri listesini tek seferde ekleyebilirsiniz. Mevcut stok kalemleri değiştirilmez; sadece yeni kalemler eklenir.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                <strong>{PRESET_STOCK_ITEMS.length}</strong> adet ürün (sebze, et, süt ürünleri, bakliyat, içecek, malzeme) eklenecek.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => bulkCreateMutation.mutate(PRESET_STOCK_ITEMS)}
                  disabled={bulkCreateMutation.isPending}
                >
                  {bulkCreateMutation.isPending ? 'Ekleniyor…' : `${PRESET_STOCK_ITEMS.length} ürünü ekle`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : stockList.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz stok kalemi yok.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Birim</TableHead>
                <TableHead>Min. uyarı</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockList.map((s) => (
                <TableRow key={s.id} className={isLow(s) ? 'bg-destructive/5' : ''}>
                  {editingId === s.id ? (
                    <>
                      <TableCell>
                        <Input className="h-8" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 w-24"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          className="h-8 w-24 rounded border bg-transparent text-sm"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value as typeof UNITS[number])}
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 w-20"
                          value={editMinQuantity}
                          onChange={(e) => setEditMinQuantity(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                          Kaydet
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>İptal</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium flex items-center gap-1">
                        {isLow(s) && <IconAlertTriangle className="h-4 w-4 text-destructive" title="Stok düşük" />}
                        {s.name}
                      </TableCell>
                      <TableCell>{Number(s.quantity).toLocaleString('tr-TR')}</TableCell>
                      <TableCell>{s.unit}</TableCell>
                      <TableCell>{s.minQuantity != null ? s.minQuantity : '–'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(s)}>
                          <IconPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(s.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
