import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '../../config/apps/web'),
  server: {
    // Tek origin (3000) = cookie çalışır. Tarayıcı 3000'de açılsın; API oradan Vite'a proxy eder.
    open: 'http://localhost:3000',
    // Sayfa 3000'den açılsa da HMR websocket'i doğrudan Vite'a (5173) bağlansın.
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      // API ve auth aynı origin'den gitsin ki cookie çalışsın (localhost:5173 -> 3000)
      '^/(auth|entities|reservations|customers|payments|reports|settings|sites|users|companies|posts|projects|locations|storage)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          // Geliştirmede backend'den gelen Set-Cookie'yi tarayıcı (5173) için geçerli yap:
          // Domain kaldır (cookie request host = 5173'e bağlansın), Secure kaldır (HTTP için)
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = (Array.isArray(setCookie) ? setCookie : [setCookie]).map(
                (cookie: string) =>
                  cookie
                    .replace(/;\s*Secure/gi, '')
                    .replace(/;\s*Domain=[^;]+/gi, '')
                    .replace(/SameSite=\w+/i, 'SameSite=Lax'),
              );
            }
          });
        },
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '#*': path.resolve(__dirname, './src'),
      '#backend/*': path.resolve(__dirname, '../api/src/*'),
      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  optimizeDeps: {
    exclude: [
      '@prisma/client',
      '@prisma/client/runtime/library',
      'redis',
      '@onlyjs/api',
    ],
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    // Copy public files but exclude chatbot symlink
    copyPublicDir: true,
  },
  publicDir: 'public'
});
