---
name: ci-cd-safety
description: "Guidelines and checklist to prevent CI/CD failures in GitHub Actions. Use this skill whenever preparing to push code, diagnosing or fixing CI/CD pipeline failures, writing database factories with check constraints, debugging flaky tests (date drift, Faker variance, stray requests), or verifying code style (Pint, Prettier, ESLint, PHPStan)."
license: MIT
metadata:
  author: tamerin-team
---

# CI/CD Safety & Pre-Push Runbook

Panduan lengkap untuk memastikan seluruh perubahan kode selalu lolos 100% pada GitHub Actions CI/CD tanpa ada kegagalan tak terduga (*flaky tests*, lint error, format error, atau constraint violations).

---

## Mengapa CI/CD Sering Gagal? (Akar Masalah di Tamerin)

Di repositori ini, CI GitHub Actions (`.github/workflows/tests.yml`) menjalankan rangkaian pengecekan yang sangat ketat melalui `composer ci:check` dan `npm run build`. Ada **5 penyebab utama** mengapa error sering muncul di CI padahal tampak normal di lokal:

### 1. PostgreSQL Check Constraints vs Faker Variance (Flaky Tests)
* **Penyebab**: Database di CI menggunakan PostgreSQL 17 murni dengan constraint ketat di level schema (contoh: `obligations_outstanding_amount_range_check: outstanding_amount >= 0 AND outstanding_amount <= original_amount`).
* **Jebakan**: Di factory, Faker menghasilkan angka acak (misal `fake()->numberBetween(500_000, 500_000_000)`). Jika test hanya meng-override salah satu field (misal `'outstanding_amount' => 4_000_000`) tanpa menetapkan `'original_amount'`, test akan **lulus di lokal saat Faker kebetulan memilih angka besar**, tetapi **gagal di CI saat Faker memilih angka lebih kecil dari 4.000.000**.
* **Aturan Baku**:
  - Jangan pernah meng-override satu sisi dari dua kolom yang saling terikat oleh check constraint tanpa meng-override pasangannya.
  - Di factory, selalu lindungi relasi constraint di `afterMaking()` / `configure()` agar nilai default otomatis valid terhadap constraint database.

### 2. Time/Date Drift (Temporal Brittleness)
* **Penyebab**: Kode atau query yang memfilter rentang waktu (misal: "30 hari terakhir" seperti pada valuasi investasi `last_valuation_at > today()->subDays(30)`).
* **Jebakan**: Jika test menggunakan tanggal hardcoded (misal `2026-08-20`) tanpa membekukan waktu sistem, seiring berjalannya hari nyata atau pergantian bulan, selisih hari melebihi threshold dan test mendadak gagal di CI.
* **Aturan Baku**:
  - Setiap test yang berkaitan dengan periode, laporan bulanan, siklus keuangan, reminder, atau tanggal filter **WAJIB** membekukan waktu menggunakan `$this->travelTo('YYYY-MM-DD HH:mm:ss')` di awal test.

### 3. Multi-Tool Quality Gate yang Sangat Ketat (`composer ci:check`)
* **Penyebab**: CI tidak hanya menjalankan test, melainkan mengeksekusi 6 linter/checker berurutan:
  1. `npm run lint:check` (ESLint: strict rules)
  2. `npm run format:check` (Prettier: spasi, line break, koma)
  3. `npm run types:check` (TypeScript `tsc --noEmit`)
  4. `npm run build` (Vite bundling produksi)
  5. `vendor/bin/pint --test` (Laravel Pint PHP styling)
  6. `vendor/bin/phpstan analyse` (PHPStan static analysis)
  7. `php artisan test` (Pest test suite)
* **Jebakan**: Mengedit satu baris saja tanpa menjalankan formatter (Pint/Prettier) akan langsung menggagalkan pipeline.

### 4. Stray HTTP Requests & Inertia SSR (`Http::preventStrayRequests()`)
* **Penyebab**: Test security atau integrasi yang memanggil `Http::preventStrayRequests()` akan melempar `StrayRequestException` jika ada request HTTP tak terduga.
* **Jebakan**: Inertia v3 mencoba memanggil endpoint SSR dev (`http://[::1]:5173/__inertia_ssr`) jika SSR aktif atau file `public/hot` ada.
* **Aturan Baku**:
  - Pada test yang mengaktifkan `Http::preventStrayRequests()`, selalu nonaktifkan SSR secara eksplisit: `config()->set('inertia.ssr.enabled', false)`.

### 5. Wayfinder & Frontend Types Out-of-Sync
* **Penyebab**: Menambah atau mengubah route/controller di Laravel mengubah type definition yang di-generate Wayfinder di `@/actions` atau `@/routes`.
* **Jebakan**: Jika `php artisan wayfinder:generate --with-form` tidak dijalankan, `tsc` di CI akan gagal karena type action tidak cocok.

---

## Checklist Wajib Sebelum Commit & Push (Pre-Push Runbook)

Sebelum menjalankan `git commit` dan `git push`, selalu jalankan langkah-langkah berikut secara berurutan:

### Langkah 1: Format Otomatis (PHP & Frontend)
```bash
# Format PHP otomatis
vendor/bin/pint

# Format TypeScript/React otomatis
npx prettier --write resources/
```

### Langkah 2: Regenerasi Route Types (Jika mengubah route/controller)
```bash
php artisan wayfinder:generate --with-form --no-interaction
```

### Langkah 3: Test Build Produksi
```bash
npm run build
```

### Langkah 4: Jalankan CI Gate Lokal
Perintah ini menjalankan seluruh pengecekan yang persis sama dengan yang dijalankan di GitHub Actions:
```bash
composer ci:check
```

Jika `composer ci:check` mengeluarkan exit code 0 tanpa error, maka **99.9% dipastikan GitHub Actions akan hijau (PASSED)**.

---

## Panduan Debugging Cepat Error CI

| Pesan Error di CI | Penyebab | Solusi |
|---|---|---|
| `SQLSTATE[23514]: Check violation ... obligations_outstanding_amount_range_check` | Nilai `outstanding_amount > original_amount` akibat Faker acak | Set `original_amount` eksplisit di test atau gunakan guard di `ObligationFactory::configure()`. |
| `StrayRequestException: Attempted request to [http://.../__inertia_ssr]` | `Http::preventStrayRequests()` memblokir request SSR Inertia | Tambahkan `config()->set('inertia.ssr.enabled', false);` di `beforeEach()`. |
| `Failed asserting that [size 0] matches expected [size 1]` pada filter tanggal | Tanggal di test kedaluwarsa dari tanggal sistem hari ini | Tambahkan `$this->travelTo('2026-08-20 10:00:00');` di awal test. |
| `Checking formatting... [warn] resources/...` | Ada file frontend yang belum diformat Prettier | Jalankan `npx prettier --write resources/`. |
| `pint --parallel --test [FAIL]` | Ada file PHP yang belum diformat Pint | Jalankan `vendor/bin/pint`. |
| `Cannot find module '@/actions/...'` atau error tsc | Definisi route Wayfinder belum ter-generate | Jalankan `php artisan wayfinder:generate --with-form`. |
