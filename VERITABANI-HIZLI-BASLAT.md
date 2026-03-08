# PostgreSQL Hızlı Başlatma

Hata: **"Veritabanına bağlanılamadı. PostgreSQL'in localhost:5432'de çalıştığından emin olun."**

## Docker kullanıyorsanız

1. **Docker Desktop** açık olsun (sistem tepsisinde).
2. PowerShell'de proje klasörüne gidin:
   ```powershell
   cd "c:\Users\burak\OneDrive\Masaüstü\boilerplate\packages\database"
   ```
3. Şunu çalıştırın:
   ```powershell
   docker-compose up -d
   ```
4. 5–10 saniye bekleyin, sonra tarayıcıda giriş sayfasında **"Admin oluştur"** butonuna tıklayın.
5. **burakavcii@hotmail.com** / **09Buraq32** ile giriş yapın.

---

## PostgreSQL Windows’ta kuruluysa (Docker yok)

1. **Win + R** → `services.msc` yazıp Enter.
2. Listede **postgresql** geçen servisi bulun (ör: `postgresql-x64-16`).
3. Sağ tık → **Başlat**.
4. Tarayıcıda **"Admin oluştur"** → ardından giriş yapın.

Veritabanı adı **onlyjs** olmalı. Yoksa pgAdmin veya psql ile: `CREATE DATABASE onlyjs;`

---

## Proje script’i ile (Docker + migration birlikte)

Proje kökünde PowerShell:

```powershell
cd "c:\Users\burak\OneDrive\Masaüstü\boilerplate"
.\veritabani-baslat.ps1
```

Bu script Docker’ı başlatır, migration çalıştırır. Bittikten sonra **Admin oluştur** → giriş.
