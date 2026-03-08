import { getStoragePath } from '#core/storage.ts';
import { auth, authSwagger } from '#modules/auth/authentication/plugin';
import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { createSeederServer } from '@onlyjs/db/seeder/server';
import { Elysia } from 'elysia';
import { loadEnv } from './config/env';
import { handleElysiaError } from './config/error-handler';
import { prepareSwaggerConfig } from './config/swagger.config';
import { setupGracefulShutdown } from './core/graceful-shutdown';
import { ServerInstance } from './core/server-instance';
import { devViteProxy } from './dev-vite-proxy';
import routes, { swaggerTags } from './modules';
import { PERMISSIONS } from './modules/auth';

loadEnv();

const seederServer = await createSeederServer({
  silent: true,
});

let app = new Elysia({
  // Websocket configuration should be set in this Elysia instance, others will be ignored
  websocket: {
    perMessageDeflate: {
      compress: 'disable',
      decompress: 'disable',
    },
    sendPings: false,
    idleTimeout: 120,
  },
})
  .use(cors())
  .onError(handleElysiaError)
  .use(
    staticPlugin({
      assets: getStoragePath(),
      prefix: '/storage',
    }),
  )
  .use(routes)
  .group('', (app) =>
    app.guard(authSwagger, (app) =>
      app.use(auth(PERMISSIONS.SYSTEM_ADMINISTRATION.SEED_DATA)).use(seederServer),
    ),
  );

// Development: swagger + Vite proxy
if (process.env.NODE_ENV !== 'production') {
  const swaggerConfig = await prepareSwaggerConfig({ tags: swaggerTags });
  app = app.use(swagger(swaggerConfig));
  // Frontend'i aynı origin'den sun: http://localhost:3000 → Vite (cookie çalışır)
  app = app.use(devViteProxy);
}

app = app.listen({
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
});

if (app.server) {
  ServerInstance.server = app.server;
}

console.log(
  `🦊 Elysia is running at ${app.server?.url.protocol}//${app.server?.hostname}:${app.server?.port} in ${process.env.NODE_ENV} mode`,
);
if (process.env.NODE_ENV !== 'production') {
  console.log('   → Giriş/dashboard için tarayıcıda http://localhost:3000 açın (Vite buradan proxy edilir, cookie çalışır).');
}

setupGracefulShutdown(app);

export type App = typeof app;
