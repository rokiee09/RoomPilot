import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserAuthForm } from '#components/form/user-auth-form.tsx';
import { Button } from '#components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#components/ui/card';
import { env } from '#config/env';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: (s: Record<string, unknown>) => ({ error: (s.error as string) || undefined }),
  component: SignIn,
});

function SignIn() {
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const search = useSearch({ from: '/(auth)/sign-in' });
  const sessionMessage = search.error === 'connection'
    ? 'Oturum veya bağlantı hatası. Lütfen tekrar giriş yapın.'
    : null;

  async function handleSetupDevUser() {
    setSetupLoading(true);
    setSetupError(null);
    try {
      const res = await fetch(`${env.apiUrl}/auth/setup-dev-user`, { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (data.ok) {
        toast.success(data.message ?? 'Admin hazır.');
      } else {
        const msg = data.message ?? 'İşlem başarısız.';
        toast.error(msg);
        setSetupError(msg);
      }
    } catch (e) {
      const errMsg =
        'API’ye ulaşılamadı (localhost:3000). Proje kökünde "bun run dev" çalıştırın; terminalde hem web (5173) hem API (3000) satırlarını görmelisiniz. API çalışıyorsa tarayıcıda http://localhost:3000 açın.';
      toast.error(errMsg);
      setSetupError(errMsg);
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Giriş</CardTitle>
        <CardDescription>
          Hesabınıza girmek için e-posta ve şifrenizi <br />
          aşağıya girin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionMessage && (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
            {sessionMessage}
          </p>
        )}
        <UserAuthForm />
        {setupError && (
          <div className="text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm space-y-2">
            <p className="font-medium">Admin oluşturulamadı</p>
            <p>{setupError}</p>
            {setupError.includes('Veritabanı') && (
              <p className="text-xs mt-2">
                <strong>Çözüm:</strong> Proje klasöründe <code className="bg-muted px-1 rounded">veritabani-baslat.ps1</code> scriptini
                çalıştırın (PowerShell). Docker ile PostgreSQL başlatır ve tabloları oluşturur. Sonra tekrar &quot;Admin oluştur&quot;a tıklayın.
                Detay: <code className="bg-muted px-1 rounded">docs\VERITABANI_BASLATMA.md</code>
              </p>
            )}
            {setupError.includes('API') && setupError.includes('3000') && (
              <p className="text-xs mt-2">
                <strong>Kontrol:</strong> Yeni bir terminal açıp sadece <code className="bg-muted px-1 rounded">bun run dev</code> yazın (proje klasöründe).
                Çıktıda &quot;Elysia is running at http://localhost:3000&quot; görünmeli. Görünmüyorsa API başlamamıştır.
              </p>
            )}
          </div>
        )}
        <p className="text-muted-foreground text-xs">
          Giriş yapamıyorsanız önce &quot;Admin oluştur&quot; butonuna tıklayın. Ardından <strong>burakavcii@hotmail.com</strong> / <strong>09Buraq32</strong> veya <strong>admin@example.com</strong> / <strong>password</strong> ile giriş yapın.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={setupLoading}
          onClick={handleSetupDevUser}
        >
          {setupLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Oluşturuluyor…
            </>
          ) : (
            'Admin oluştur (veritabanına ilk kullanıcıyı ekle)'
          )}
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground px-8 text-center text-sm">
          Giriş yaparak{' '}
          <a href="/terms" className="hover:text-primary underline underline-offset-4">
            Hizmet Şartları
          </a>{' '}
          ve{' '}
          <a href="/privacy" className="hover:text-primary underline underline-offset-4">
            Gizlilik Politikası
          </a>
          ’nı kabul etmiş olursunuz.
        </p>
      </CardFooter>
    </Card>
  );
}
