import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
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
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restoran (çatal, bıçak, tabak)' },
  { value: 'HOTEL', label: 'Otel (çarşaf, yastık, havlu)' },
  { value: 'KITCHEN', label: 'Mutfak' },
  { value: 'OTHER', label: 'Diğer' },
];

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function EquipmentSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('RESTAURANT');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [unit, setUnit] = useState('adet');

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'equipment'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/equipment`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<
        Array<{ id: string; name: string; category: string; quantity: number; minQuantity: number | null; unit: string; notes: string | null }>
      >;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          category,
          quantity: Number(quantity) || 0,
          minQuantity: minQuantity ? Number(minQuantity) : undefined,
          unit: unit || 'adet',
        }),
      });
      if (!res.ok) throw new Error('Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'equipment'] });
      setOpen(false);
      setName('');
      setQuantity('');
      setMinQuantity('');
      setUnit('adet');
      setCategory('RESTAURANT');
      toast.success('Ekipman eklendi');
    },
    onError: () => toast.error('Ekipman eklenemedi'),
  });

  const byCategory = equipment.reduce((acc, e) => {
    const cat = e.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {} as Record<string, typeof equipment>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ekipman</CardTitle>
            <CardDescription>Çatal, bıçak, tabak, çarşaf, yastık, mutfak malzemeleri vb.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ekipman Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Ekipman</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Ad</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tabak, Çarşaf, Bıçak..." />
                </div>
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Miktar</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" />
                  </div>
                  <div>
                    <Label>Min. Uyarı</Label>
                    <Input type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} placeholder="10" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Birim</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="adet" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  İptal
                </Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name.trim()}>
                  Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Yükleniyor...</p>
        ) : equipment.length === 0 ? (
          <p className="text-muted-foreground text-sm">Henüz ekipman kaydı yok.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {CATEGORIES.find((c) => c.value === cat)?.label ?? cat}
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Miktar</TableHead>
                      <TableHead>Min. Uyarı</TableHead>
                      <TableHead>Birim</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.quantity}</TableCell>
                        <TableCell>{e.minQuantity ?? '-'}</TableCell>
                        <TableCell>{e.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
