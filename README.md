<p align="center">
    <img src="public/favicon.svg" width="88" alt="Logo Tamerin">
</p>

<h1 align="center">Tamerin</h1>

<p align="center">
    Aplikasi pengelolaan keuangan pribadi untuk mencatat kondisi hari ini dan merencanakan masa depan.
</p>

<p align="center">
    <a href="https://github.com/rizkikurni/tamerin_web/actions/workflows/tests.yml">
        <img src="https://github.com/rizkikurni/tamerin_web/actions/workflows/tests.yml/badge.svg" alt="Status CI/CD">
    </a>
</p>

## Tentang Tamerin

Tamerin adalah aplikasi web keuangan pribadi berbasis Laravel dan Inertia. Aplikasi ini menyatukan transaksi, rekening, budget, tabungan, investasi, aset, utang-piutang, pengingat, dan laporan dalam satu antarmuka yang responsif.

Seluruh data keuangan dibatasi berdasarkan pengguna yang sedang login. Landing page dapat diakses oleh publik, sedangkan fitur pengelolaan keuangan membutuhkan autentikasi.

Production: [tamerin.rizkikurni.my.id](https://tamerin.rizkikurni.my.id)

## Fitur

### Dashboard

- Ringkasan saldo, pemasukan, pengeluaran, dan kekayaan bersih.
- Grafik arus kas harian dan mingguan.
- Ringkasan akun serta transaksi terbaru.
- Progres budget dan target tabungan.
- Pengingat sistem dari menu notifikasi.
- Pemilihan periode laporan keuangan.

### Pengelolaan keuangan

- **Akun keuangan:** kas, rekening bank, dompet digital, dan jenis akun lainnya.
- **Kategori:** kategori pemasukan dan pengeluaran milik setiap pengguna.
- **Transaksi:** pemasukan, pengeluaran, transfer antarakun, detail, dan pembatalan transaksi.
- **Budget:** batas pengeluaran bulanan per kategori beserta perhitungan pemakaiannya.
- **Target tabungan:** target, tenggat, setoran, progres, penyelesaian, dan pembatalan setoran.
- **Investasi:** kepemilikan instrumen, riwayat valuasi, nilai terbaru, dan performa.
- **Aset:** pencatatan aset dan perubahan nilainya.
- **Utang dan piutang:** saldo kewajiban, jatuh tempo, pembayaran, dan riwayat pelunasan.
- **Pengingat:** pengingat manual dengan status aktif, selesai, atau diabaikan.

### Laporan

- Laporan transaksi, arus kas, budget, tabungan, investasi, kekayaan bersih, serta utang-piutang.
- Filter periode, akun, kategori, dan status sesuai jenis laporan.
- Ekspor laporan ke PDF dan XLSX.
- Riwayat ekspor untuk kebutuhan audit.

### Akun dan tampilan

- Registrasi, login, logout, dan reset kata sandi.
- Profil pengguna dan perubahan kata sandi.
- Preferensi mode terang, gelap, atau mengikuti sistem.
- Preset warna Ocean, Forest, Violet, dan warna kustom.
- Layout responsif untuk desktop, tablet, dan perangkat seluler.
- Metadata SEO, canonical URL, Open Graph, <code>robots.txt</code>, dan <code>sitemap.xml</code>.

## Teknologi

| Area         | Teknologi                                            |
| ------------ | ---------------------------------------------------- |
| Backend      | PHP 8.3+, Laravel 13                                 |
| Frontend     | React 19, TypeScript, Inertia.js 3                   |
| UI           | Tailwind CSS 4, Lucide React, Recharts               |
| Database     | PostgreSQL                                           |
| Build        | Vite 8                                               |
| Typed routes | Laravel Wayfinder                                    |
| PDF          | barryvdh/laravel-dompdf                              |
| Spreadsheet  | phpoffice/phpspreadsheet                             |
| Testing      | Pest 5                                               |
| Quality      | Laravel Pint, Larastan, ESLint, Prettier, TypeScript |
| CI/CD        | GitHub Actions dan SSH release deployment            |
| Production   | Nginx, PHP-FPM, PostgreSQL, Cloudflare               |

CI dan deployment production menggunakan PHP 8.5, Node.js 22, serta PostgreSQL 17.

## Persyaratan lokal

Pastikan perangkat memiliki:

- PHP 8.3 atau lebih baru; PHP 8.5 direkomendasikan agar sama dengan CI.
- Composer 2.
- Node.js 22 dan npm.
- PostgreSQL.
- Ekstensi PHP <code>dom</code>, <code>fileinfo</code>, <code>intl</code>, <code>mbstring</code>, <code>pdo_pgsql</code>, <code>pgsql</code>, dan <code>zip</code>.

## Instalasi lokal

### 1. Mengambil repository

```bash
git clone https://github.com/rizkikurni/tamerin_web.git
cd tamerin_web
```

### 2. Memasang dependency

```bash
composer install
npm ci
```

### 3. Membuat environment

Linux atau macOS:

```bash
cp .env.example .env
php artisan key:generate
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
php artisan key:generate
```

### 4. Mengatur PostgreSQL

Buat database aplikasi dan database testing:

```sql
CREATE DATABASE tamerin;
CREATE DATABASE tamerin_testing;
```

Kemudian sesuaikan bagian database pada <code>.env</code>:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tamerin
DB_USERNAME=postgres
DB_PASSWORD=
```

Jangan menyimpan <code>.env</code> ke repository. Isi <code>DB_PASSWORD</code> hanya pada environment masing-masing.

### 5. Menjalankan migration

Tanpa data contoh:

```bash
php artisan migrate
```

Dengan data contoh untuk development:

```bash
php artisan migrate --seed
```

Seeder membuat akun development berikut:

```text
Email: demo@tamerin.test
Kata sandi: password
```

Data dan kredensial tersebut hanya untuk development. Jangan menjalankan seeder contoh pada production.

### 6. Menjalankan aplikasi

```bash
composer run dev
```

Perintah tersebut menjalankan Laravel, Vite, dan queue listener secara bersamaan. Aplikasi tersedia pada:

```text
http://localhost:8000
```

## Environment penting

Konfigurasi dasar:

```dotenv
APP_NAME=Tamerin
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

Pastikan migration sudah dijalankan karena session, cache, dan queue menggunakan tabel database.

### Cloudflare Turnstile

Untuk development biasa, nonaktifkan Turnstile pada <code>.env</code> lokal:

```dotenv
TURNSTILE_ENABLED=false
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_ALLOWED_HOSTNAMES=
```

Setelah mengubah konfigurasi:

```bash
php artisan optimize:clear
```

Production menggunakan konfigurasi berikut dengan nilai dari dashboard Cloudflare:

```dotenv
TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY=site_key_cloudflare
TURNSTILE_SECRET_KEY=secret_key_cloudflare
TURNSTILE_ALLOWED_HOSTNAMES=tamerin.rizkikurni.my.id
```

<code>TURNSTILE_SECRET_KEY</code> hanya boleh tersedia pada backend. Backend memvalidasi token, action <code>login</code> atau <code>register</code>, serta hostname setiap request.

Jika perlu menguji Turnstile secara nyata di lokal, gunakan widget development terpisah dengan hostname <code>localhost</code> atau <code>127.0.0.1</code>. Jangan menambahkan hostname lokal ke widget production.

### Email

Environment lokal memakai mailer <code>log</code>. Tautan reset kata sandi dapat diperiksa melalui log Laravel di <code>storage/logs</code>.

Untuk production, konfigurasikan mailer dan kredensial penyedia email melalui environment VPS.

## Arsitektur aplikasi

Alur utama backend:

```text
Route
  -> Middleware
  -> Form Request
  -> Controller
  -> Action atau Query
  -> Model
  -> PostgreSQL
```

- **Form Request** menangani authorization awal, normalisasi, dan validasi input.
- **Controller** mengatur alur HTTP dan response Inertia.
- **Action** menjalankan satu use case penulisan data.
- **Query** menampung pembacaan dan agregasi data yang lebih kompleks.
- **Policy** memastikan pengguna hanya mengakses data miliknya.
- **Model** mendefinisikan relasi, cast, dan struktur data Eloquent.
- **React page** menerima props Inertia dan menyusun tampilan fitur.
- **Wayfinder** menghasilkan fungsi TypeScript dari controller dan named route Laravel.

Struktur direktori utama:

```text
app/
├── Actions/          # Use case dan perubahan data
├── Enums/            # Nilai domain yang terbatas
├── Http/
│   ├── Controllers/  # Orkestrasi HTTP
│   ├── Middleware/
│   └── Requests/     # Validasi dan authorization request
├── Models/
├── Policies/
├── Queries/          # Query baca, agregasi, dan laporan
├── Rules/
└── Services/

resources/js/
├── components/       # Komponen UI dan komponen per fitur
├── layouts/
├── lib/
├── pages/            # Halaman Inertia React
└── types/

database/
├── factories/
├── migrations/
└── seeders/

tests/
├── Feature/
└── Unit/
```

## Keamanan dan integritas data

- Primary key domain menggunakan ULID.
- Foreign key dan constraint penting juga diterapkan pada database.
- Seluruh resource keuangan dibatasi berdasarkan pengguna melalui query dan Policy.
- Endpoint login memiliki pembatas umum 30 request per menit per IP.
- Lima login gagal dalam 60 detik dibatasi berdasarkan kombinasi email dan IP.
- Registrasi dibatasi 3 request per menit dan 10 request per jam per IP.
- Login dan registrasi production dilindungi Cloudflare Turnstile.
- Token Turnstile selalu diverifikasi ulang oleh backend.
- Password production menggunakan aturan kompleksitas dan pemeriksaan kebocoran data.
- Form Inertia tetap dilindungi CSRF Laravel.
- Pembatalan data finansial penting menggunakan status atau alur void agar riwayat tetap dapat diaudit.
- Ekspor laporan mengirim response private tanpa cache dan dicatat pada riwayat ekspor.

## Testing dan quality gate

Siapkan PostgreSQL dan database <code>tamerin_testing</code> sebelum menjalankan Feature Test.

Menjalankan seluruh pemeriksaan yang sama dengan CI:

```bash
composer ci:check
```

Menjalankan test:

```bash
php artisan test --compact
```

Menjalankan test tertentu:

```bash
php artisan test --compact tests/Feature/BudgetManagementTest.php
php artisan test --compact --filter="users only see their own budgets"
```

Pemeriksaan individual:

```bash
composer lint:check
composer types:check
npm run lint:check
npm run format:check
npm run types:check
npm run build
```

Quality gate GitHub Actions menjalankan:

1. Instalasi dependency PHP dan JavaScript.
2. Pembuatan typed route Wayfinder.
3. Build asset production.
4. ESLint dan Prettier.
5. TypeScript.
6. Laravel Pint.
7. Larastan.
8. Seluruh Pest test menggunakan PostgreSQL.

## CI/CD dan deployment

Workflow berada di <code>.github/workflows/tests.yml</code>.

- Pull request ke <code>main</code> menjalankan quality gate.
- Push ke <code>main</code> menjalankan quality gate lalu deployment production.
- Deployment juga dapat dijalankan manual melalui <code>workflow_dispatch</code>.
- Release dibangun di GitHub Actions dan dikirim ke VPS melalui SSH.
- Setiap release memakai direktori terpisah.
- <code>.env</code> dan <code>storage</code> production dipakai bersama antar-release.
- Migration dijalankan dengan <code>--force</code>.
- Cache Laravel dibangun ulang sebelum release diaktifkan.
- Symlink <code>current</code> dipindahkan secara atomik ke release baru.
- Queue worker menerima perintah restart setelah aktivasi.
- Endpoint <code>/up</code> digunakan untuk health check.

Struktur deployment:

```text
/var/www/tamerin/
├── current -> releases/<release-id>
├── releases/
└── shared/
    ├── .env
    └── storage/
```

### GitHub Secrets

Environment GitHub <code>production</code> membutuhkan:

| Secret                           | Keterangan                                          |
| -------------------------------- | --------------------------------------------------- |
| <code>VPS_HOST</code>            | IP atau hostname VPS                                |
| <code>VPS_PORT</code>            | Port SSH dalam bentuk angka                         |
| <code>VPS_USER</code>            | User deployment                                     |
| <code>VPS_SSH_PRIVATE_KEY</code> | Private key SSH milik user deployment               |
| <code>VPS_KNOWN_HOSTS</code>     | Hasil ssh-keyscan untuk memverifikasi identitas VPS |
| <code>VPS_DEPLOY_PATH</code>     | Path absolut aplikasi, misalnya /var/www/tamerin    |
| <code>VPS_HEALTHCHECK_URL</code> | URL production tanpa path /up                       |

Jangan memasukkan password database, private key, atau Secret Key Turnstile ke source code.

## Catatan Nginx production

Halaman dengan banyak dependency Vite menghasilkan header preload <code>Link</code> yang lebih besar. Blok PHP/FastCGI Tamerin perlu menyediakan buffer header yang cukup:

```nginx
fastcgi_buffer_size 16k;
fastcgi_buffers 8 16k;
```

Letakkan konfigurasi tersebut pada blok yang sama dengan <code>fastcgi_pass</code>, kemudian selalu validasi sebelum reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Vite manifest tidak ditemukan

Gejala:

```text
Vite manifest not found at public/build/manifest.json
```

Solusi:

```bash
npm ci
npm run build
```

### Tabel cache tidak ditemukan

Gejala:

```text
relation "cache" does not exist
```

Pastikan koneksi PostgreSQL benar dan jalankan:

```bash
php artisan migrate
```

### Turnstile menolak localhost

Pastikan <code>.env</code> lokal memakai:

```dotenv
TURNSTILE_ENABLED=false
```

Lalu jalankan:

```bash
php artisan optimize:clear
```

### Nginx mengembalikan 502 pada halaman tertentu

Periksa:

```bash
sudo tail -n 100 /var/log/nginx/tamerin.error.log
sudo tail -n 100 /var/www/tamerin/shared/storage/logs/laravel-$(date +%F).log
```

Jika log berisi <code>upstream sent too big header</code>, periksa konfigurasi FastCGI buffer pada bagian sebelumnya.

### Storage production tidak dapat ditulis

Pastikan shared storage dimiliki user deployment dan group web server, serta direktori menggunakan setgid:

```bash
sudo chown -R deploy:www-data /var/www/tamerin/shared/storage
sudo find /var/www/tamerin/shared/storage -type d -exec chmod 2775 {} +
sudo find /var/www/tamerin/shared/storage -type f -exec chmod 0664 {} +
```

Jalankan penyesuaian permission hanya pada path shared storage yang sudah diverifikasi. Jangan menjalankan <code>chmod -R</code> pada seluruh <code>/var/www</code> atau root filesystem.

## Perintah ringkas

```bash
# Development
composer run dev

# Migration
php artisan migrate

# Data contoh lokal
php artisan db:seed

# Build production
npm run build

# Seluruh quality gate
composer ci:check

# Bersihkan cache konfigurasi
php artisan optimize:clear
```

## Prinsip pengembangan

- Pertahankan controller tetap tipis.
- Simpan validasi non-trivial pada Form Request.
- Simpan use case penulisan data pada Action.
- Gunakan Query untuk agregasi atau pembacaan yang kompleks.
- Gunakan Policy untuk authorization resource.
- Jangan menambahkan abstraction atau dependency tanpa kebutuhan nyata.
- Tambahkan atau perbarui test untuk setiap perubahan perilaku.
- Jalankan formatter dan pemeriksaan statis sebelum push.
