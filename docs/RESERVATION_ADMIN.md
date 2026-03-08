# Rezervasyon Yönetim Paneli (Otel / Restoran)

Bu doküman, monorepo içindeki **Rezervasyon Admin** modülünün yapısını ve çalıştırma adımlarını özetler.

## Genel Bakış

- **Frontend:** `apps/web` – React (Vite), feature-based yapı
- **Backend:** `apps/api` – Elysia REST API
- **Veritabanı:** `packages/database` – Prisma + PostgreSQL

## Veritabanı Modelleri

- **Entity:** Otel / Restoran işletmesi (type: HOTEL | RESTAURANT, status: DRAFT | PUBLISHED)
- **Reservation:** Rezervasyon (entityId, customerName, dateTime, partySize, status: PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED)
- **Customer:** Müşteri (name, phone, email)

## Kurulum

1. **Bağımlılıklar**
   ```bash
   bun install
   ```

2. **Veritabanı migration ve Prisma client**
   ```bash
   cd packages/database
   bun run generate
   bun run migrate
   ```

3. **Projeyi çalıştırma**
   ```bash
   bun run dev
   ```
   - Frontend: http://localhost:5173  
   - API: http://localhost:3000 (veya `config/apps/api/.env` içindeki PORT)

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /entities | İşletme listesi (filtre: city, status, type) |
| GET | /entities/:id | Tek işletme |
| POST | /entities | Yeni işletme |
| PUT | /entities/:id | İşletme güncelle |
| DELETE | /entities/:id | İşletme sil |
| GET | /reservations | Rezervasyon listesi (filtre: status, entityId, fromDate, toDate) |
| GET | /reservations/:id | Rezervasyon detayı |
| PATCH | /reservations/:id/status | Durum güncelle (body: { status }) |
| GET | /customers | Müşteri listesi |
| GET | /customers/:id | Müşteri + rezervasyon geçmişi |

Tüm bu endpoint’ler authentication gerektirir (mevcut auth middleware).

## Frontend Modüller

- **Dashboard** (`/`): Günlük rezervasyon sayısı, onay bekleyen sayısı, son 5 rezervasyon
- **İşletmeler** (`/entities`): Liste, filtre, ekleme, düzenleme, silme
- **Rezervasyonlar** (`/reservations`): Liste, filtre, detay sayfasında durum güncelleme
- **Müşteriler** (`/customers`): Liste, müşteri detayında rezervasyon geçmişi

Kullanıcı ve rol yönetimi için mevcut **Users** ve **Settings** sayfaları kullanılabilir (System Admin sidebar’da yer alıyor).

## Sidebar

- **Rezervasyon Yönetimi** (System Admin) ve **Rezervasyon** (Company): Dashboard, İşletmeler, Rezervasyonlar, Müşteriler
