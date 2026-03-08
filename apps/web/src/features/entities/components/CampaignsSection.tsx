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

const CAMPAIGN_TYPES = [
  { value: 'NEW_YEAR', label: 'Yılbaşı' },
  { value: 'BAYRAM', label: 'Bayram' },
  { value: 'SEASONAL', label: 'Sezonluk' },
  { value: 'CUSTOM', label: 'Özel' },
];

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function CampaignsSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('CUSTOM');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'campaigns'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/campaigns`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<
        Array<{ id: string; name: string; type: string; description: string | null; discountPercent: number | null; startDate: string; endDate: string; isActive: boolean }>
      >;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          discountPercent: discountPercent ? Number(discountPercent) : undefined,
          startDate: startDate || new Date().toISOString().slice(0, 10),
          endDate: endDate || new Date().toISOString().slice(0, 10),
        }),
      });
      if (!res.ok) throw new Error('Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'campaigns'] });
      setOpen(false);
      setName('');
      setDescription('');
      setDiscountPercent('');
      setStartDate('');
      setEndDate('');
      setType('CUSTOM');
      toast.success('Kampanya eklendi');
    },
    onError: () => toast.error('Kampanya eklenemedi'),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kampanyalar</CardTitle>
            <CardDescription>Yılbaşı, bayram ve sezonluk kampanyalar</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Kampanya Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Kampanya</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Kampanya Adı</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yılbaşı Özel" />
                </div>
                <div className="grid gap-2">
                  <Label>Tür</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>İndirim (%)</Label>
                  <Input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Başlangıç</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Bitiş</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Açıklama</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opsiyonel" />
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
        ) : campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm">Henüz kampanya yok.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>İndirim</TableHead>
                <TableHead>Başlangıç</TableHead>
                <TableHead>Bitiş</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{CAMPAIGN_TYPES.find((t) => t.value === c.type)?.label ?? c.type}</TableCell>
                  <TableCell>{c.discountPercent != null ? `%${c.discountPercent}` : '-'}</TableCell>
                  <TableCell>{format(new Date(c.startDate), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                  <TableCell>{format(new Date(c.endDate), 'dd.MM.yyyy', { locale: tr })}</TableCell>
                  <TableCell>{c.isActive ? 'Aktif' : 'Pasif'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
