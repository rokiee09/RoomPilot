# Veritabani + migration + kullanicı oluşturma rehberi
# Bu script Docker ile PostgreSQL'i baslatir, migration calistirir.
# Docker yoksa adim adim ne yapmaniz gerektigini yazar.

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
$dbPath = Join-Path $projectRoot "packages\database"

Write-Host ""
Write-Host "=== Rezervasyon Admin - Veritabani Hazirlik ===" -ForegroundColor Cyan
Write-Host ""

# 1. Docker kontrolu
$dockerOk = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
} catch {}

if ($dockerOk) {
    Write-Host "[1/4] Docker bulundu. PostgreSQL container baslatiliyor..." -ForegroundColor Green
    Set-Location $dbPath
    docker-compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HATA: docker-compose basarisiz." -ForegroundColor Red
        exit 1
    }
    Write-Host "      Container baslatildi. Birkaç saniye bekleniyor..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
} else {
    Write-Host "[1/4] Docker bulunamadi veya calismiyor." -ForegroundColor Yellow
    Write-Host "      PostgreSQL'i Windows'a kurduysaniz:" -ForegroundColor Gray
    Write-Host "      - Win+R -> services.msc -> postgresql servisini BASLATIN" -ForegroundColor Gray
    Write-Host "      - pgAdmin veya psql ile 'onlyjs' veritabani olusturun: CREATE DATABASE onlyjs;" -ForegroundColor Gray
    Write-Host ""
    Write-Host "      Docker kullanmak icin: https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
    Write-Host ""
    $cevap = Read-Host "PostgreSQL zaten calisiyorsa Enter'a basin (devam), iptal icin 'q' yazin"
    if ($cevap -eq 'q') { exit 0 }
}

# 2. Port 5432 kontrolu
Write-Host ""
Write-Host "[2/4] Veritabanina baglanti kontrol ediliyor (localhost:5432)..." -ForegroundColor Cyan
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $tcp.Connect("127.0.0.1", 5432)
    $tcp.Close()
    Write-Host "      Baglanti OK." -ForegroundColor Green
} catch {
    Write-Host "      UYARI: 5432 portuna baglanilamiyor. PostgreSQL calismiyor olabilir." -ForegroundColor Red
    Write-Host "      Docker kullaniyorsaniz: packages\database klasorunde 'docker-compose up -d' calistirin." -ForegroundColor Yellow
    Write-Host "      Sonra bu scripti tekrar calistirin." -ForegroundColor Yellow
    exit 1
}

# 3. Migration
Write-Host ""
Write-Host "[3/4] Prisma migration calistiriliyor..." -ForegroundColor Cyan
Set-Location $dbPath
bun run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: Migration basarisiz. DATABASE_URL ve PostgreSQL'i kontrol edin." -ForegroundColor Red
    exit 1
}
Write-Host "      Migration tamamlandi." -ForegroundColor Green

# 4. Bilgi
Write-Host ""
Write-Host "[4/4] Son adimlar:" -ForegroundColor Cyan
Write-Host "      1. Projeyi calistirin:  bun run dev   (proje kokunde)" -ForegroundColor White
Write-Host "      2. Tarayicida acin:     http://localhost:3000" -ForegroundColor White
Write-Host "      3. Giris sayfasinda 'Admin olustur' butonuna tiklayin." -ForegroundColor White
Write-Host "      4. E-posta: admin@example.com   Sifre: password" -ForegroundColor White
Write-Host ""
Write-Host "=== Bitti ===" -ForegroundColor Green
Write-Host ""
