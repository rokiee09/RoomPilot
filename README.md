# 🚀 RoomPilot

RoomPilot, otel ve restoran işletmeleri için geliştirilmiş modern bir rezervasyon yönetim panelidir. İşletmelerin rezervasyonlarını, müşterilerini, odalarını ve analizlerini tek bir merkezi sistem üzerinden yönetmelerini sağlar.

Modern web teknolojileri kullanılarak geliştirilen RoomPilot, ölçeklenebilir ve modüler bir mimariye sahiptir.

## 📸 Dashboard Görünümü

![RoomPilot Dashboard](docs/dashboard.png)

---

## ✨ Özellikler

### 🏨 İşletme Yönetimi (Entities)

- Otel veya restoran ekleme
- Oda / masa tipleri oluşturma
- Oda yönetimi
- İşletme galeri görselleri
- Kampanya yönetimi (yılbaşı, bayram, hafta sonu)
- Çalışan yönetimi (garson, chef, house keeping vb.)
- Ekipman takibi (çatal, bıçak, tabak, çarşaf, yastık)
- Stok ve gider takibi

### 📅 Rezervasyon Yönetimi

- Rezervasyon oluşturma
- Rezervasyon güncelleme
- Rezervasyon durum takibi
- Takvim tabanlı doluluk sistemi

### 👤 Müşteri Yönetimi

- Müşteri bilgilerini kaydetme
- Rezervasyon geçmişi
- İletişim bilgileri

### 📊 Dashboard ve Analizler

- Günlük rezervasyon sayısı
- Toplam müşteri sayısı
- İşletme sayısı
- Toplam gelir, aylık gelir grafikleri
- Doluluk oranı (otel)
- Stok uyarıları (restoran)
- Kar / zarar grafikleri

### 🔔 Bildirim Şablonları

- Rezervasyon onay mesajları
- Email bildirim şablonları

---

## 🧠 Kullanılan Teknolojiler

| Katman   | Teknolojiler                          |
|----------|----------------------------------------|
| Frontend | React, Vite, TanStack Router, TanStack Query, shadcn/ui, TailwindCSS |
| Backend  | Bun, Elysia, Prisma ORM, PostgreSQL    |
| Monorepo | Turborepo, Bun                         |

---

## 🏗 Proje Yapısı

```
RoomPilot
├── apps
│   ├── api          # Backend API (Elysia)
│   └── web          # React Admin Panel
├── packages
│   └── database     # Prisma şeması, migration, seeder
├── config           # Ortam ayarları (.env.example)
└── docs             # Dokümantasyon ve ekran görüntüleri
```

---

## ⚙️ Kurulum

### Gereksinimler

- [Bun](https://bun.sh)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com)

### 1️⃣ Repoyu klonla

```bash
git clone https://github.com/rokiee09/RoomPilot.git
cd RoomPilot
```

### 2️⃣ Bağımlılıkları yükle

```bash
bun install
```

### 3️⃣ Ortam değişkenlerini oluştur

```bash
cp config/apps/api/.env.example config/apps/api/.env
cp config/apps/web/.env.example config/apps/web/.env
```

`config/apps/api/.env` içinde `DATABASE_URL` değerini güncelleyin:

```
DATABASE_URL="postgresql://user:password@localhost:5432/roompilot"
```

### 4️⃣ Veritabanı migration

```bash
cd packages/database
bun run migrate
bun run generate
cd ../..
```

### 5️⃣ (Opsiyonel) Örnek verileri yükle

```bash
cd packages/database
bun run seeder run entities-restaurants
bun run seeder run entities-extended
cd ../..
```

### 6️⃣ Geliştirme sunucusunu başlat

```bash
bun run dev
```

---

## 🌐 Uygulama Adresleri

| Servis    | Adres                    |
|-----------|--------------------------|
| Panel     | http://localhost:3000    |
| API       | http://localhost:3000 (Vite buradan proxy edilir) |

---

## 👨‍💻 Geliştirici

**Burak Avcı** — [GitHub](https://github.com/rokiee09)

---

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
