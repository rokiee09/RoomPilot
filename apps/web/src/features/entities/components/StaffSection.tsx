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
import { IconUser, IconTrash, IconPencil } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

const HOTEL_ROLE_OPTIONS = [
  { value: 'Garson', label: 'Garson' },
  { value: 'Komi', label: 'Komi' },
  { value: 'Belboy', label: 'Belboy' },
  { value: 'Chef', label: 'Şef' },
  { value: 'Alakart Sorumlusu', label: 'Alakart Sorumlusu' },
  { value: 'House Keeping', label: 'House Keeping' },
  { value: 'Resepsiyonist', label: 'Resepsiyonist' },
  { value: 'Güvenlik', label: 'Güvenlik' },
  { value: 'Aşçı', label: 'Aşçı' },
  { value: 'Barista', label: 'Barista' },
  { value: 'Diğer', label: 'Diğer' },
];

const RESTAURANT_ROLE_OPTIONS = [
  { value: 'Chef', label: 'Şef' },
  { value: 'Garson', label: 'Garson' },
  { value: 'Aşçı', label: 'Aşçı' },
  { value: 'Barista', label: 'Barista' },
  { value: 'Temizlik', label: 'Temizlik' },
  { value: 'Diğer', label: 'Diğer' },
];

export type StaffRow = {
  id: string;
  entityId: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

const getApiBase = () => env.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

export function StaffSection({ entityId, entityType = 'RESTAURANT' }: { entityId: string; entityType?: 'HOTEL' | 'RESTAURANT' }) {
  const ROLE_OPTIONS = entityType === 'HOTEL' ? HOTEL_ROLE_OPTIONS : RESTAURANT_ROLE_OPTIONS;
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'staff'],
    queryFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/staff`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<StaffRow[]>;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim() || ROLE_OPTIONS[0].value,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string }).message ?? 'Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'staff'] });
      setName('');
      setPhone('');
      setEmail('');
      setRole(ROLE_OPTIONS[0].value);
      toast.success('Çalışan eklendi');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Hata'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ staffId, body }: { staffId: string; body: { name?: string; role?: string; phone?: string; email?: string } }) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Güncellenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'staff'] });
      setEditingId(null);
      toast.success('Güncellendi');
    },
    onError: () => toast.error('Güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const res = await fetch(`${getApiBase()}/entities/${entityId}/staff/${staffId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'staff'] });
      toast.success('Çalışan kaldırıldı');
    },
    onError: () => toast.error('Silinemedi'),
  });

  const startEdit = (row: StaffRow) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditRole(ROLE_OPTIONS.some((r) => r.value === row.role) ? row.role : 'Diğer');
    setEditPhone(row.phone ?? '');
    setEditEmail(row.email ?? '');
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({
      staffId: editingId,
      body: { name: editName.trim(), role: editRole, phone: editPhone.trim() || undefined, email: editEmail.trim() || undefined },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconUser className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Çalışan Bilgileri</CardTitle>
        </div>
        <CardDescription>
          İşletmeye ait personeli ekleyin: ad, rol (garson, resepsiyonist, temizlik vb.), telefon ve e-posta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Çalışan adı"
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0555 000 00 00"
            />
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ornek.com"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!name.trim()) {
              toast.error('Ad soyad girin');
              return;
            }
            createMutation.mutate();
          }}
          disabled={createMutation.isPending}
        >
          Çalışan Ekle
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : staffList.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz çalışan eklenmemiş.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((s) => (
                <TableRow key={s.id}>
                  {editingId === s.id ? (
                    <>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={editRole} onValueChange={setEditRole}>
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                          Kaydet
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          İptal
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell className="text-muted-foreground">{s.phone ?? '–'}</TableCell>
                      <TableCell className="text-muted-foreground">{s.email ?? '–'}</TableCell>
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
