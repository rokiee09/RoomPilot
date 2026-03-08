import { PageContainer } from '#/components/layout/page-container';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { Textarea } from '#/components/ui/textarea';
import { env } from '#/config/env';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconMail } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Template = { id: string; key: string; subject: string; bodyHtml: string };

export default function NotificationTemplatesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Template | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['settings', 'notification-templates'],
    queryFn: async () => {
      const res = await fetch(`${env.apiUrl}/settings/notification-templates`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<Template[]>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, subject: subj, bodyHtml: body }: { key: string; subject: string; bodyHtml: string }) => {
      const res = await fetch(`${env.apiUrl}/settings/notification-templates/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject: subj, bodyHtml: body }),
      });
      if (!res.ok) throw new Error('Kaydedilemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notification-templates'] });
      setEditing(null);
      toast.success('Şablon güncellendi');
    },
    onError: () => toast.error('Kaydedilemedi'),
  });

  const startEdit = (t: Template) => {
    setEditing(t);
    setSubject(t.subject);
    setBodyHtml(t.bodyHtml);
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate({ key: editing.key, subject, bodyHtml });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bildirim Şablonları</h1>
          <p className="text-muted-foreground">
            Rezervasyon onay/red e-postası gibi bildirim metinlerini düzenleyin.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <IconMail className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">E-posta Şablonları</CardTitle>
            </div>
            <CardDescription>
              Konu ve HTML gövde. Değişkenler: {'{{musteriAdi}}'}, {'{{tarih}}'}, {'{{isletmeAdi}}'} kullanılabilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Yükleniyor...</p>
            ) : editing ? (
              <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Düzenleniyor: {editing.key}</p>
                <div className="space-y-2">
                  <Label>Konu</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>İçerik (HTML)</Label>
                  <Textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEdit} disabled={updateMutation.isPending}>
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    İptal
                  </Button>
                </div>
              </div>
            ) : null}

            {templates.length === 0 && !isLoading ? (
              <p className="text-muted-foreground text-sm">
                Henüz şablon yok. Veritabanına reservation_confirmed, reservation_rejected gibi anahtarlarla ekleyebilirsiniz.
              </p>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{t.key}</p>
                      <p className="text-muted-foreground truncate max-w-md">{t.subject}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => startEdit(t)}>
                      Düzenle
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
