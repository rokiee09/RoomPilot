# PostgreSQL Veritabanını Başlatma

Proje `localhost:5432` üzerinde çalışan bir PostgreSQL bekliyor. Kullanıcı: `postgres`, Şifre: `postgres`, Veritabanı: `onlyjs`.

---

## Yol 1: Docker ile (Önerilen)

Docker Desktop yüklüyse en kolay yöntem budur.

1. **Docker Desktop**’ı indirip kurun: https://www.docker.com/products/docker-desktop/
2. Docker’ı başlatın (sistem tepsisinde çalışır olsun).
3. Terminalde proje kökünden:
   ```bash
   cd packages\database
   bun run db:start
   ```
   veya doğrudan:
   ```bash
   docker-compose up -d
   ```
4. Birkaç saniye sonra PostgreSQL hazır olur. Ardından **Admin oluştur** butonuna basabilir veya `bun run seed` çalıştırabilirsiniz.

Durdurmak için: `cd packages\database` → `bun run db:stop`

---

## Yol 2: Windows’a Kurduğunuz PostgreSQL

PostgreSQL’i installer ile kurduysanız ama “çalıştıramadım” diyorsanız aşağıdakileri deneyin.

### A) Servis olarak başlatma

1. `Win + R` tuşlarına basın, `services.msc` yazıp Enter.
2. Listede **“postgresql”** geçen servisi bulun (ör: `postgresql-x64-16`).
3. Üzerine sağ tıklayıp **Başlat** deyin.

Servis yoksa veya hata veriyorsa B seçeneğine geçin.

### B) Şifreyi ve kullanıcıyı projeyle eşleştirme

Proje şu bilgileri kullanıyor: kullanıcı **postgres**, şifre **postgres**, veritabanı adı **onlyjs**.

- Kurulum sırasında farklı şifre verdyseniz:
  - Ya `config\apps\api\.env` içinde `DATABASE_URL` satırındaki şifreyi kendi şifrenizle değiştirin.
  - Ya da PostgreSQL’de postgres kullanıcısının şifresini “postgres” yapın (pgAdmin veya `psql` ile).

- **onlyjs** veritabanı yoksa oluşturun:
  - pgAdmin’de: Sağ tık Databases → Create → Database → Name: `onlyjs`
  - veya komut satırında: `psql -U postgres` → `CREATE DATABASE onlyjs;`

### C) Port 5432 başka programda kullanılıyorsa

Başka bir PostgreSQL veya program 5432 kullanıyorsa:

- Ya o programı kapatın,
- Ya da projedeki `.env` içinde farklı port yazın:  
  `DATABASE_URL="postgresql://postgres:postgres@localhost:BAŞKA_PORT/onlyjs"`  
  ve PostgreSQL’i o porta göre ayarlayın.

---

## Kontrol

Veritabanının çalıştığını doğrulamak için:

- **Docker:** `docker ps` → `my_postgres` (veya postgres) container’ı “Up” olmalı.
- **Servis:** `services.msc` → postgresql servisi “Çalışıyor” olmalı.

Sonra tarayıcıda giriş sayfasında **Admin oluştur** butonuna tıklayın; hata almıyorsanız `admin@example.com` / `password` ile giriş yapabilirsiniz.
