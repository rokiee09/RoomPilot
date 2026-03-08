/**
 * Geliştirme: API'ye gelen ve hiçbir route ile eşleşmeyen istekleri Vite dev server'a proxy eder.
 * Böylece tarayıcı http://localhost:3000 açıldığında hem API hem frontend aynı origin'de olur; cookie sorunu kalkar.
 */
import { Elysia } from 'elysia';

const VITE_DEV_URL = process.env.VITE_DEV_URL ?? 'http://localhost:5173';

async function proxyToVite(request: Request, set: { status?: number }) {
  const url = new URL(request.url);
  const targetUrl = `${VITE_DEV_URL}${url.pathname}${url.search}`;

  try {
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(VITE_DEV_URL).host);

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      // @ts-expect-error duplex for body
      duplex: 'half',
    });

    const resHeaders = new Headers(res.headers);
    resHeaders.delete('content-encoding');

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: resHeaders });
  } catch (err) {
    console.warn('[dev-vite-proxy] Vite\'a ulaşılamadı, frontend\'i başlatın: npm run dev:web', err);
    set.status = 502;

    return new Response(
      `Vite dev server (${VITE_DEV_URL}) çalışmıyor. Ayrı terminalde "npm run dev:web" çalıştırın, sonra sayfayı yenileyin.`,
      { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }
}

export const devViteProxy = new Elysia({ name: 'dev-vite-proxy' })
  .all('/', ({ request, set }) => proxyToVite(request, set))
  .all('/*', ({ request, set }) => proxyToVite(request, set));
