import { MethodNotAllowedException } from '#utils/http-errors.ts';
import { KVStoreService } from '#core';
import prisma from '@onlyjs/db';
import { Gender, type OrganizationType, RoleType, UserScope } from '@onlyjs/db/enums';
import { type Context, Elysia } from 'elysia';
import { UserFormatter, UsersService } from '../../users';
import { AUTH_KV_KEYS, AUTH_KV_NAMESPACE } from '../authorization/constants';
import { GLOBAL_DEFAULT_ROLES } from '../authorization/roles/constants';
import { OrganizationsService } from '../authorization/organizations/service';
import { authMeDto } from './dtos';
import { betterAuth } from './instance';
import { auth, authSwagger } from './plugin';

const app = new Elysia({
  prefix: '/auth',
  detail: {
    tags: ['Authentication'],
  },
})
  .guard(authSwagger, (app) =>
    app.use(auth()).get(
      '/me',
      async ({ user }) => {
        // Get user's claims (permissions)
        const claims = user.claims as {
          global: string[];
          organizations: Record<string, Record<string, string[]>>;
        } | null;

        // Get user's all roles (minimal info) from better-auth
        const allRoles =
          (user.roles as Array<{
            uuid: string;
            organizationType?: OrganizationType;
            organizationUuid?: string;
          }>) || [];

        // Separate global roles from organization roles
        const globalRoles = allRoles.filter(
          (role) => !role.organizationType && !role.organizationUuid,
        );

        // Get all organization memberships (includes organization-specific roles)
        const organizationMemberships = await OrganizationsService.getCurrentUserMemberships(
          user.id,
        );

        // Standard user response with permissions and roles
        const userResponse = UserFormatter.response(user);
        return {
          ...userResponse,
          // Claims: structured permissions by scope
          claims: {
            global: claims?.global ?? [],
            organizations: claims?.organizations ?? {},
          },
          // Global roles (no organization context)
          globalRoles: globalRoles.map((role) => ({ uuid: role.uuid })),
          // Organization memberships (includes organization-specific roles per organization)
          organizationMemberships,
        };
      },
      authMeDto,
    ),
  )
  // Development-only: create admin users if they don't exist (bypasses seed)
  .post(
    '/setup-dev-user',
    async () => {
      if (process.env.NODE_ENV !== 'development') {
        return { ok: false, message: 'Sadece development ortamında kullanılabilir.' };
      }
      const devUsers: Array<{ email: string; password: string; firstName: string; lastName: string }> = [
        { email: 'admin@example.com', password: 'password', firstName: 'System', lastName: 'Administrator' },
        { email: 'burakavcii@hotmail.com', password: '09Buraq32', firstName: 'Burak', lastName: 'Admin' },
      ];
      try {
        let adminRole = await prisma.role.findFirst({ where: { type: RoleType.ADMIN, organizationId: null } });
        if (!adminRole) {
          await prisma.role.create({
            data: {
              type: RoleType.BASIC,
              name: GLOBAL_DEFAULT_ROLES.BASIC.name,
              description: GLOBAL_DEFAULT_ROLES.BASIC.description,
              permissions: GLOBAL_DEFAULT_ROLES.BASIC.permissions,
              order: GLOBAL_DEFAULT_ROLES.BASIC.order,
              organizationType: null,
              organizationId: null,
            },
          });
          adminRole = await prisma.role.create({
            data: {
              type: RoleType.ADMIN,
              name: GLOBAL_DEFAULT_ROLES.ADMIN.name,
              description: GLOBAL_DEFAULT_ROLES.ADMIN.description,
              permissions: GLOBAL_DEFAULT_ROLES.ADMIN.permissions,
              order: GLOBAL_DEFAULT_ROLES.ADMIN.order,
              organizationType: null,
              organizationId: null,
            },
          });
        }
        const created: string[] = [];
        for (const u of devUsers) {
          const existing = await prisma.user.findUnique({ where: { email: u.email } });
          if (existing) continue;
          const createdUser = await UsersService.store(
            {
              email: u.email,
              password: u.password,
              firstName: u.firstName,
              lastName: u.lastName,
              gender: Gender.MALE,
              scope: UserScope.SYSTEM,
              roleUuids: [adminRole!.uuid],
            },
            prisma,
            true,
          );
          created.push(u.email);
          if (u.email === 'admin@example.com') {
            await KVStoreService.set(AUTH_KV_KEYS.SYSTEM_OWNER, createdUser.id, {
              namespace: AUTH_KV_NAMESPACE,
              description: 'System owner user UUID',
              tags: ['system', 'owner', 'authorization'],
              ttl: 0,
            });
          }
        }
        if (created.length === 0) {
          return {
            ok: true,
            message:
              'Admin hesapları zaten mevcut. admin@example.com / password veya burakavcii@hotmail.com / 09Buraq32 ile giriş yapın.',
          };
        }
        return {
          ok: true,
          message: `Oluşturulan hesaplar: ${created.join(', ')}. Giriş: admin@example.com / password veya burakavcii@hotmail.com / 09Buraq32`,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/database|5432|connect|ECONNREFUSED/i.test(msg)) {
          return {
            ok: false,
            message: 'Veritabanına bağlanılamadı. PostgreSQL\'in localhost:5432\'de çalıştığından emin olun.',
          };
        }
        throw err;
      }
    },
    { detail: { tags: ['Authentication'], summary: 'Create dev admin user (development only)' } },
  )
  // Handle better-auth requests
  .all('*', async (context: Context) => {
    const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET'];
    // validate request method
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
      let request = context.request;
      // Geliştirmede localhost/127.0.0.1 (herhangi port) gelirse Better Auth INVALID_ORIGIN vermesin diye
      // isteği güvenilir origin ile yeniden oluştur (Better Auth'a ulaşmadan önce)
      if (process.env.NODE_ENV !== 'production') {
        const origin = context.request.headers.get('origin') || context.request.headers.get('referer');
        if (origin) {
          try {
            const u = new URL(origin);
            if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
              const trustedOrigin = 'http://localhost:3000';
              const newHeaders = new Headers(context.request.headers);
              newHeaders.set('Origin', trustedOrigin);
              if (newHeaders.has('Referer')) newHeaders.set('Referer', trustedOrigin + '/');
              request = new Request(context.request.url, {
                method: context.request.method,
                headers: newHeaders,
                body: context.request.body,
                duplex: 'half',
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
      const response = await betterAuth.handler(request);

      if (!response.ok) {
        if (!response.headers.get('Content-Type')) {
          response.headers.set('Content-Type', 'application/json');
        }
      }

      // Dynamically set cookie domain and SameSite based on request origin (veya proxy için Referer)
      const origin =
        context.request.headers.get('origin') ||
        context.request.headers.get('referer')?.replace(/\/$/, '') ||
        null;
      if (origin) {
        try {
          const originUrl = new URL(origin);
          const hostname = originUrl.hostname;
          
          // Geliştirmede localhost (herhangi bir port) güvenilir; production'da listeden kontrol
          const isLocalhostOrigin =
            originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
          const trustedOrigins = [
            process.env.APP_URL!,
            process.env.API_URL!,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://127.0.0.1:5176',
            'http://127.0.0.1:5177',
          ];
          const isTrustedOrigin =
            (process.env.NODE_ENV === 'development' && isLocalhostOrigin) ||
            trustedOrigins.some(trusted => {
              try {
                const trustedUrl = new URL(trusted);
                return trustedUrl.origin === originUrl.origin;
              } catch {
                return false;
              }
            });
          
          if (!isTrustedOrigin) {
            // Origin not trusted, don't modify cookies
            return response;
          }
          
          // Determine if this is a localhost/development request
          const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
          
          // Extract domain for cookie
          let cookieDomain: string;
          
          if (isLocalhost) {
            // For localhost, don't set domain (browser will use exact hostname)
            cookieDomain = '';
          } else {
            // For production domains, extract base domain
            const parts = hostname.split('.');
            if (parts.length >= 2) {
              cookieDomain = parts.slice(-2).join('.');
            } else {
              cookieDomain = hostname;
            }
          }

          // Modify Set-Cookie headers to use dynamic domain and SameSite
          const setCookieHeaders = response.headers.getSetCookie();
          if (setCookieHeaders.length > 0) {
            // Remove existing Set-Cookie headers
            response.headers.delete('Set-Cookie');
            
            // Re-add with modified domain and SameSite
            for (const cookie of setCookieHeaders) {
              let modifiedCookie = cookie;
              
              // Handle Domain attribute
              if (cookieDomain) {
                // Replace existing Domain attribute or add it
                if (cookie.includes('Domain=')) {
                  modifiedCookie = cookie.replace(/Domain=[^;]+/, `Domain=${cookieDomain}`);
                } else {
                  // Add Domain before Path if exists, otherwise at the end
                  if (cookie.includes('Path=')) {
                    modifiedCookie = cookie.replace(/Path=/, `Domain=${cookieDomain}; Path=`);
                  } else {
                    modifiedCookie = `${cookie}; Domain=${cookieDomain}`;
                  }
                }
              } else {
                // Remove Domain attribute for localhost
                modifiedCookie = cookie.replace(/;\s*Domain=[^;]+/g, '');
              }
              
              // Handle SameSite and Secure attributes for localhost
              if (isLocalhost) {
                // For localhost development over HTTP:
                // - Remove Secure flag (required for HTTP)
                // - Use SameSite=Lax instead of None (None requires Secure)
                // This is safe because we validate the origin against trustedOrigins
                
                // Remove Secure flag for localhost HTTP
                modifiedCookie = modifiedCookie.replace(/;\s*Secure/gi, '');
                
                // Keep or set SameSite=Lax for localhost
                if (cookie.includes('SameSite=')) {
                  modifiedCookie = modifiedCookie.replace(/SameSite=[^;]+/, 'SameSite=Lax');
                } else {
                  modifiedCookie = `${modifiedCookie}; SameSite=Lax`;
                }
              }
              // For production, keep SameSite=Lax and Secure (default from better-auth)
              
              response.headers.append('Set-Cookie', modifiedCookie);
            }
          }
        } catch (error) {
          // If origin parsing fails, keep original response
          console.error('Failed to parse origin for dynamic cookie domain:', error);
        }
      }

      return response;
    } else {
      throw new MethodNotAllowedException();
    }
  });

export default app;
