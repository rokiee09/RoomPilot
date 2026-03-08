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
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const UNITS = ['adet', 'kg', 'lt', 'gr', 'ml', 'paket', 'kutu', 'şişe', 'torba'] as const;

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function ExpensesSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('adet');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'expenses'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/expenses`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<
        Array<{ id: string; productName: string; quantity: number; unit: string; amount: number; expenseDate: string; notes: string | null }>
      >;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productName: productName.trim(),
          quantity: Number(quantity) || 1,
          unit,
          amount: Number(amount) || 0,
          expenseDate,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'financials'] });
      setOpen(false);
      setProductName('');
      setQuantity('');
      setAmount('');
      setNotes('');
      setExpenseDate(new Date().toISOString().slice(0, 10));
      toast.success('Gider eklendi');
    },
    onError: () => toast.error('Gider eklenemedi'),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Giderler / Alınan Ürünler</CardTitle>
            <CardDescription>Satın alınan malzemeler (örn: Zeytinyağı 100 lt, 03.03.2026, 2.500 ₺)</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Gider Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Gider</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Ürün / Malzeme</Label>
                  <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Zeytinyağı" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Miktar</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" />
                  </div>
                  <div>
                    <Label>Birim</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Tutar (₺)</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2500" />
                  </div>
                  <div>
                    <Label>Tarih</Label>
                    <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Not</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsiyonel" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  İptal
                </Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !productName.trim() || !amount}>
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
        ) : expenses.length === 0 ? (
          <p className="text-muted-foreground text-sm">Henüz gider kaydı yok.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.productName} {e.quantity} {e.unit}
                  </TableCell>
                  <TableCell>{e.quantity} {e.unit}</TableCell>
                  <TableCell>{format(new Date(e.expenseDate), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                  <TableCell className="text-right font-medium">{Number(e.amount).toLocaleString('tr-TR')} ₺</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
