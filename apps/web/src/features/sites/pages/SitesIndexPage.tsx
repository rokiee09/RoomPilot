import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { IconMapPin, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

type SiteRow = { id: string; name: string; slug: string; _count?: { entities: number } };

export default function SitesIndexPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/sites`, { credentials: 'include' });
      if (!res.ok) throw new Error('Bölgeler yüklenemedi');
      return res.json() as Promise<SiteRow[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-') }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message ?? 'Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setOpen(false);
      setName('');
      setSlug('');
      toast.success('Bölge eklendi');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Hata'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: { name?: string; slug?: string } }) => {
      const res = await fetch(`${getApiBase()}/sites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Güncellenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setEditId(null);
      toast.success('Güncellendi');
    },
    onError: () => toast.error('Güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${getApiBase()}/sites/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Bölge silindi');
    },
    onError: () => toast.error('Silinemedi'),
  });

  const openEdit = (s: SiteRow) => {
    setEditId(s.id);
    setName(s.name);
    setSlug(s.slug);
    setOpen(true);
  };

  const saveEdit = () => {
    if (!editId) return;
    updateMutation.mutate({ id: editId, body: { name: name.trim(), slug: slug.trim() || undefined } });
  };

  const handleCreate = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setOpen(true);
  };

  return (
    <PageContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ana Siteler / Bölgeler</h1>
            <p className="text-muted-foreground">
              Otel zincirinde bölge gruplaması: İstanbul, Antalya, İzmir. İşletmeleri bölgeye atayarak filtreleyebilirsiniz.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <IconPlus className="mr-2 h-4 w-4" />
            Yeni Bölge
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
            ) : sites.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Henüz bölge yok. İstanbul, Antalya, İzmir gibi bölgeler ekleyin.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bölge adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>İşletme sayısı</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.slug}</TableCell>
                      <TableCell>{s._count?.entities ?? 0}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <IconPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`"${s.name}" bölgesini silmek istediğinize emin misiniz?`))
                              deleteMutation.mutate(s.id);
                          }}
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
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Bölge düzenle' : 'Yeni bölge'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Ad (örn. İstanbul, Antalya, İzmir)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bölge adı" />
            </div>
            <div className="grid gap-2">
              <Label>Slug (URL uyumlu, opsiyonel)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="istanbul"
              />
            </div>
            {editId ? (
              <Button onClick={saveEdit} disabled={updateMutation.isPending}>
                Güncelle
              </Button>
            ) : (
              <Button
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
