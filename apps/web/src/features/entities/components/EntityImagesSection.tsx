import { Button } from '#/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { env } from '#/config/env';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPhoto, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type EntityImageRow = {
  id: string;
  entityId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export function EntityImagesSection({ entityId }: { entityId: string }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['entity', entityId, 'images'],
    queryFn: async () => {
      const res = await fetch(`${env.apiUrl}/entities/${entityId}/images`, { credentials: 'include' });
      if (!res.ok) throw new Error('Yüklenemedi');
      return res.json() as Promise<EntityImageRow[]>;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${env.apiUrl}/entities/${entityId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: url.trim(), caption: caption.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Eklenemedi');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'images'] });
      setUrl('');
      setCaption('');
      toast.success('Görsel eklendi');
    },
    onError: () => toast.error('Eklenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (imgId: string) => {
      const res = await fetch(`${env.apiUrl}/entities/${entityId}/images/${imgId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', entityId, 'images'] });
      toast.success('Silindi');
    },
    onError: () => toast.error('Silinemedi'),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconPhoto className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Galeri</CardTitle>
        </div>
        <CardDescription>
          İşletme fotoğrafları. Görsel URL’si ekleyin (örn. CDN veya harici link).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Görsel URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Başlık (isteğe bağlı)</Label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Kısa açıklama"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (!url.trim()) {
              toast.error('URL girin');
              return;
            }
            createMutation.mutate();
          }}
          disabled={createMutation.isPending}
        >
          Görsel Ekle
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz görsel yok.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="rounded-lg border overflow-hidden group relative">
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  className="w-full h-32 object-cover bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd" width="100" height="100"/><text x="50%" y="50%" fill="%23999" text-anchor="middle" dy=".3em" font-size="12">Görsel yok</text></svg>';
                  }}
                />
                {img.caption && (
                  <p className="p-2 text-xs text-muted-foreground truncate">{img.caption}</p>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => deleteMutation.mutate(img.id)}
                  disabled={deleteMutation.isPending}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
