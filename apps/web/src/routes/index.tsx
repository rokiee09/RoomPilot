import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Button } from '#components/ui/button';
import { api } from '#lib/api';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context;
    try {
      const session = await queryClient.ensureQueryData({
        queryKey: ['session'],
        queryFn: () => api.auth.me.get(),
      });
      if (session?.data) {
        throw redirect({ to: '/dashboard' });
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e;
    }
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/roompilot-logo.png" alt="RoomPilot" className="h-9 w-auto" />
            <span className="font-semibold text-lg hidden sm:inline">RoomPilot</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/sign-in">Giriş Yap</Link>
            </Button>
            <Button asChild>
              <Link to="/sign-up">Kayıt Ol</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container flex-1 flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-4xl font-bold tracking-tight text-center max-w-2xl">
          Otel ve restoran rezervasyonlarınızı tek panelden yönetin
        </h1>
        <p className="mt-4 text-muted-foreground text-center max-w-xl text-lg">
          İşletmelerinizi ekleyin, rezervasyonları onaylayın ve müşterilerinizi takip edin.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/sign-in">Panele Giriş Yap</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/sign-up">Hesap Oluştur</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
