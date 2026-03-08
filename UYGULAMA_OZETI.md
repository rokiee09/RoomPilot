# Uygulama Özeti – RoomPilot

Bu belge, projeye **yeni özellik ekleme** veya **mevcut özellik çıkarma** için ChatGPT’ye verilebilecek teknik özettir.

---

## 1. Proje nedir?

- **Otel / restoran rezervasyon yönetim paneli.** İşletmeler (Entity), müşteriler (Customer), rezervasyonlar (Reservation), odalar (Room), raporlar ve bildirim şablonları yönetilir.
- **Monorepo:** Turborepo, paket yöneticisi **Bun**.
- **Backend:** Node (Elysia), **PostgreSQL**, **Prisma** (`packages/database`).
- **Frontend:** **React**, **Vite**, **TanStack Router**, **TanStack Query**, **shadcn/ui** benzeri bileşenler.
- **Auth:** better-auth, cookie tabanlı oturum. Geliştirmede `http://localhost:3000` üzerinden çalışır (Vite proxy ile API aynı origin).

---

## 2. Klasör yapısı (özet)

```
boilerplate/
├── apps/
│   ├── api/          # Elysia API (port 3000)
│   │   └── src/modules/   # Her modül: controller, service, dtos, formatters
│   └── web/          # React + Vite (port 5173, proxy → 3000)
│       └── src/
│           ├── features/   # Özellik bazlı: entities, customers, reservations, reports, settings
│           ├── routes/_authenticated/   # Sayfa route’ları
│           ├── components/   # layout, ui, data-table vb.
│           └── lib/   # api (Eden treaty), auth
├── packages/
│   └── database/     # Prisma schema + migrations + client
│       └── schema.prisma
└── config/apps/      # .env: api, web
```

---

## 3. Rezervasyon paneli modülleri (ekleme/çıkarma hedefi)

| Modül | API prefix | Ana route’lar (web) | Açıklama |
|-------|------------|---------------------|----------|
| **Entities** | `/entities` | `/entities`, `/entities/create`, `/entities/$id` | İşletme (otel/restoran) CRUD, oda tipleri, odalar, galeri |
| **Reservations** | `/reservations` | `/reservations`, `/reservations/create`, `/reservations/$id` | Rezervasyon CRUD, takvim görünümü, gün tıklanınca modal |
| **Customers** | `/customers` | `/customers`, `/customers/create`, `/customers/$id` | Müşteri CRUD |
| **Reports** | `/reports` | `/reports` | GET `/reports/summary` – aylık/onaylı rezervasyon özeti |
| **Payments** | `/payments` | `/payments` | Ödeme CRUD; rezervasyona bağlı (amount, currency, status, paymentMethod). GET/POST/PUT `/payments` |
| **Notification templates** | `/settings/notification-templates` | `/settings/notification-templates` | GET/POST/PUT `/settings/notification-templates` |

**Sidebar (menü):** System admin için `apps/web/src/components/layout/data/system-admin-sidebar-data.ts` – “Rezervasyon Yönetimi” grubunda: Dashboard, İşletmeler, Rezervasyonlar, Müşteriler, Ödemeler, Raporlar, Bildirim şablonları. Company sidebar: `company-sidebar-data.ts`.

**Vite proxy:** `apps/web/vite.config.ts` – `auth|entities|reservations|customers|users|companies|...` path’leri `localhost:3000`’e yönlendirilir. Yeni API prefix eklersen buraya da ekle.

---

## 4. Veritabanı (Prisma) – Rezervasyon paneli ile ilgili modeller

- **Entity** – İşletme (type: HOTEL/RESTAURANT, adres, oda sayısı, kapasite, amenities, workingHours vb.)
- **RoomType** – Entity’ye bağlı oda/masa tipi (name, kind: ROOM/TABLE, capacity, quantity, pricePerNight).
- **Room** – RoomType’a bağlı tek oda (uuid, guestCount, price, status: RoomStatus, isActive, deletedAt).
- **RoomStatus** (enum) – AVAILABLE_CLEAN, AVAILABLE_DIRTY, RESERVED, OCCUPIED, STAYOVER, OUT_OF_SERVICE.
- **Customer** – name, phone, email.
- **Reservation** – entityId, customerId/customerName, dateTime, partySize, status (PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED).
- **EntityImage** – Entity galeri.
- **Payment** – reservationId, amount, currency, status (PENDING, COMPLETED, FAILED, REFUNDED), paymentMethod (CREDIT_CARD, CASH, BANK_TRANSFER, STRIPE), createdAt, updatedAt.
- **Staff** – entityId, name, role, phone, email (işletmeye ait çalışan bilgileri; rol örn. Garson, Resepsiyonist, Temizlik).
- **Site** – id, name, slug (ana site/bölge: İstanbul, Antalya, İzmir). Entity.siteId ile işletmeler bölgeye bağlanır.
- **StockItem** – entityId, name, quantity, unit, minQuantity (restoran stok durumu).
- **NotificationTemplate** – key, subject, bodyHtml.

Şema: `packages/database/schema.prisma`. Değişiklik sonrası: `bunx prisma migrate dev --name <ad>` ve gerekirse `bunx prisma generate`.

---

## 5. Yeni özellik EKLEME (kısa rehber)

1. **Veritabanı:** Gerekirse `schema.prisma`’ya model/enum ekle → migration oluştur ve uygula.
2. **API modülü:** `apps/api/src/modules/` altında yeni klasör (örn. `my-feature/`):
   - `controller.ts` – Elysia, route’lar, auth guard (`auth()`, `authSwagger`).
   - `service.ts` – Prisma ve iş mantığı.
   - `dtos.ts` – Elysia `t` (typebox) ile body/query/response şemaları.
   - `formatters.ts` – (İsteğe bağlı) response formatı.
   Modülü `apps/api/src/modules/index.ts` içinde `import` edip `.use(myFeatureController)` ile ekle.
3. **Proxy:** Yeni API prefix kullanıyorsan `apps/web/vite.config.ts` proxy pattern’e ekle (örn. `my-feature`).
4. **Web – feature:** `apps/web/src/features/my-feature/` – pages, components, hooks, queries, types.
5. **Web – route:** `apps/web/src/routes/_authenticated/my-feature/` – `index.tsx`, `create.tsx`, `$id.tsx` vb. TanStack Router path’leri buraya göre otomatik oluşur.
6. **Sidebar:** `system-admin-sidebar-data.ts` (ve gerekirse `company-sidebar-data.ts`) içinde ilgili gruba `{ title: '...', url: '/my-feature', icon: ... }` ekle.

Örnek: “Ödemeler” modülü eklemek → Prisma’da Payment modeli, `modules/payments` (controller, service, dtos), `features/payments`, `routes/_authenticated/payments`, sidebar menü.

---

## 6. Özellik ÇIKARMA (kısa rehber)

1. **Sidebar:** İlgili menü öğesini `system-admin-sidebar-data.ts` ve `company-sidebar-data.ts`’den kaldır.
2. **Route’lar:** `apps/web/src/routes/_authenticated/<modül>/` klasörünü veya ilgili route dosyalarını kaldır.
3. **Feature:** `apps/web/src/features/<modül>/` klasörünü kaldır (veya sadece kullanılmayan sayfa/hook’ları).
4. **API:** `apps/api/src/modules/index.ts`’den ilgili controller’ı kaldır; modül klasörünü (`modules/<modül>/`) silebilirsin.
5. **Proxy:** Sadece o prefix kullanılmıyorsa `vite.config.ts` proxy’den çıkar.
6. **Veritabanı:** Modeli tamamen kaldıracaksan schema’dan silip migration üret (veya migration’da tabloyu drop et). Dikkat: ilişkili veri ve foreign key’ler.

---

## 7. Önemli dosya yolları (kopyala-yapıştır için)

| Ne | Dosya / klasör |
|----|-----------------|
| Prisma şema | `packages/database/schema.prisma` |
| API modül kaydı | `apps/api/src/modules/index.ts` |
| Entity API | `apps/api/src/modules/entities/` (controller, service, dtos) |
| Rezervasyon API | `apps/api/src/modules/reservations/` |
| Müşteri API | `apps/api/src/modules/customers/` |
| Rapor API | `apps/api/src/modules/reports/controller.ts` |
| Bildirim şablonları API | `apps/api/src/modules/notification-templates/controller.ts` |
| System admin menü | `apps/web/src/components/layout/data/system-admin-sidebar-data.ts` |
| Company menü | `apps/web/src/components/layout/data/company-sidebar-data.ts` |
| Authenticated route’lar | `apps/web/src/routes/_authenticated/` |
| Entities sayfaları | `apps/web/src/features/entities/` |
| Rezervasyon sayfaları | `apps/web/src/features/reservations/` |
| Müşteri sayfaları | `apps/web/src/features/customers/` |
| Rapor sayfası | `apps/web/src/features/reports/` |
| Bildirim şablonları sayfası | `apps/web/src/features/settings/pages/NotificationTemplatesPage.tsx` |
| Vite proxy | `apps/web/vite.config.ts` |
| API base URL / env | `apps/web/src/config/env.ts` – `VITE_API_URL` boşsa aynı origin |

---

## 8. ChatGPT’ye sorarken kullanabileceğin cümleler

- “Bu projede [özellik adı] eklemek istiyorum. UYGULAMA_OZETI.md’deki yapıya uygun olarak Prisma modeli, API modülü (Elysia controller + service + dtos), React sayfaları ve sidebar menüyü ekle.”
- “Bu projeden [modül adı] özelliğini tamamen kaldırmak istiyorum. UYGULAMA_OZETI.md’e göre API, route, feature ve menüden nasıl çıkaracağım?”
- “Rezervasyon panelinde yeni bir [X] sayfası ekle: liste, oluştur, düzenle. UYGULAMA_OZETI.md’deki entities/customers/reservations yapısını örnek al.”

Bu özeti ChatGPT’ye “Bu projenin özeti aşağıda, buna göre ekleme/çıkarma yap” diyerek verip sonra isteğini (ekleme veya çıkarma) net yazabilirsin.
