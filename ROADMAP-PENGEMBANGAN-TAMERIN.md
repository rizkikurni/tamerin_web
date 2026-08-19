# Roadmap Pengembangan Tamerin

## 1. Tujuan dokumen

Dokumen ini menjadi urutan kerja pengembangan Tamerin dari kondisi repository saat ini sampai aplikasi siap digunakan. Setiap tahap menjelaskan hasil yang harus dibuat, tanggung jawab setiap layer, pengujian, serta keputusan produk yang perlu dikonfirmasi sebelum implementasi.

Roadmap ini mengikuti prinsip:

- menggunakan fitur bawaan Laravel terlebih dahulu;
- controller tetap tipis;
- validasi berada di Form Request;
- authorization berbasis resource berada di Policy;
- satu Action mewakili satu use case bisnis;
- operasi finansial yang terdiri dari beberapa query menggunakan database transaction;
- data setiap pengguna selalu dibatasi oleh `user_id`;
- tidak menggunakan Repository, DTO, Service, Event, atau Job tanpa kebutuhan nyata;
- frontend memanggil route Laravel melalui Wayfinder, bukan URL hardcoded;
- setiap fase diselesaikan dan diuji sebelum masuk ke fase berikutnya.

---

## 2. Kondisi proyek saat ini

### Sudah tersedia

- [x] Laravel 13, Inertia 3, React 19, TypeScript, Tailwind CSS 4, dan PostgreSQL.
- [x] Migration seluruh tabel Tamerin.
- [x] ULID untuk seluruh model utama.
- [x] Model, relationship, casts, dan mass-assignment whitelist.
- [x] Factory seluruh model.
- [x] `DatabaseSeeder` dengan data demo yang saling terhubung.
- [x] PHP Enum untuk nilai status dan tipe beserta enum cast pada model.
- [x] PostgreSQL development dan testing yang terpisah.
- [x] Laravel Pint dan PHPStan level 7.
- [x] Autentikasi pengguna, profil, kata sandi, dan preferences.
- [x] Form Request, Action, dan controller untuk fase 2.
- [x] Layout autentikasi/settings dan halaman Inertia fase 2.
- [x] Feature test untuk fondasi domain dan fase 2.

### Belum tersedia

- [ ] Policy dan use case fitur finansial mulai fase 4.
- [ ] Dashboard, laporan, ekspor, dan audit aplikasi.

### Benturan teknis yang sudah diselesaikan

Testing sudah memakai database PostgreSQL `tamerin_testing` yang terpisah dari database development. Dengan demikian, migration yang memakai partial unique index, `DATE_TRUNC`, dan cast `::date` diuji pada database engine yang sama dengan production.

---

## 3. Arsitektur default setiap fitur

Alur utama fitur:

```text
Route
  → Middleware
  → Form Request
  → Controller
  → Action
  → Model / Query
  → PostgreSQL
  → Inertia Response
  → React Page
```

Komponen tambahan hanya dipakai bila ada kebutuhan:

```text
Policy       authorization resource
Query Object query kompleks atau digunakan berulang
Service      kemampuan reusable lintas beberapa Action
Job          pekerjaan berat/asynchronous
Event        satu kejadian dengan beberapa side effect independen
Notification komunikasi kepada pengguna
```

### 3.1 Route

Route hanya berisi:

- URL dan HTTP method;
- controller yang dituju;
- middleware seperti `auth`, `guest`, dan rate limit;
- nama route;
- grouping dan scoped binding bila diperlukan.

Route tidak boleh berisi validation, query, atau perhitungan bisnis. Semua route frontend harus memiliki nama agar dapat digunakan melalui Wayfinder.

### 3.2 Form Request

Setiap request create/update yang tidak trivial mempunyai Form Request sendiri. Isinya:

- `authorize()` untuk memanggil Policy bila resource sudah ada;
- `rules()` dengan array rule Laravel;
- `messages()` hanya jika pesan default tidak cukup jelas;
- `after()` untuk validasi lintas field;
- normalisasi ringan di `prepareForValidation()` bila benar-benar diperlukan.

Contoh validasi lintas field transaksi:

- amount harus lebih besar dari nol;
- akun, kategori, dan tujuan transfer harus dimiliki user aktif;
- kategori harus sesuai dengan tipe transaksi;
- transfer wajib memiliki akun tujuan yang berbeda dari akun sumber;
- income/expense tidak boleh memiliki akun tujuan;
- transfer tidak boleh memiliki kategori;
- akun/kategori archived tidak dapat dipakai untuk data baru.

### 3.3 Policy

Policy memastikan pengguna hanya dapat membaca atau mengubah data miliknya. Method yang umum:

- `viewAny(User $user)`;
- `view(User $user, Model $model)`;
- `create(User $user)`;
- `update(User $user, Model $model)`;
- method domain seperti `archive`, `void`, `settle`, atau `contribute`.

Pengecekan ownership tidak boleh disalin ke banyak controller. Menyembunyikan tombol di React juga bukan authorization; backend tetap wajib memeriksa Policy.

### 3.4 Action

Action menangani satu use case bisnis. Contoh:

- `CreateFinancialAccount`;
- `ArchiveFinancialAccount`;
- `RecordTransaction`;
- `VoidTransaction`;
- `SettleObligation`;
- `RecordInvestmentValuation`.

Action bertanggung jawab terhadap:

- mengatur nilai yang berasal dari sistem seperti `user_id` dan `created_by`;
- menjalankan beberapa operasi atomik dalam `DB::transaction()`;
- menggunakan `lockForUpdate()` ketika ada risiko pembayaran atau update saldo tersisa diproses bersamaan;
- menjaga aturan bisnis yang tidak dapat diselesaikan oleh Form Request saja;
- mencatat audit event untuk perubahan finansial penting.

Action tidak mengembalikan HTTP response dan tidak membaca objek HTTP Request secara langsung.

### 3.5 Controller

Controller menjadi penghubung HTTP, bukan tempat business logic. Isi method controller maksimal berupa:

1. menerima Form Request atau Request;
2. menjalankan authorization;
3. memanggil Action atau Query;
4. mengembalikan `Inertia::render()`, redirect, atau download response.

Contoh bentuk method controller:

```php
public function store(
    StoreFinancialAccountRequest $request,
    CreateFinancialAccount $action,
): RedirectResponse {
    $action->handle($request->user(), $request->validated());

    return to_route('financial-accounts.index');
}
```

Controller tidak boleh berisi validation array, transaksi database panjang, perhitungan saldo, logging audit manual berulang, atau query bercabang panjang.

### 3.6 Model

Model tetap menangani:

- relationship;
- casts;
- atribut default;
- scope kecil yang berkaitan langsung dengan model;
- perilaku domain sederhana yang hanya mengubah dirinya sendiri.

Model tidak menangani Request, response, redirect, upload, notification, atau orkestrasi panjang.

### 3.7 Query Object

Eloquent langsung digunakan untuk query sederhana. Query Object hanya dibuat untuk query kompleks atau reusable, misalnya:

- `TransactionIndexQuery`;
- `AccountBalanceQuery`;
- `DashboardSummaryQuery`;
- `BudgetUsageQuery`;
- `NetWorthQuery`;
- `SystemReminderQuery`;
- `FinancialReportQuery`.

Semua list besar memakai pagination, semua relationship yang ditampilkan memakai eager loading, dan setiap query wajib dibatasi berdasarkan user.

### 3.8 Inertia React

Setiap domain mempunyai halaman di `resources/js/pages/<domain>`. Aturannya:

- page menangani komposisi halaman dan data dari Inertia;
- form domain dipisahkan menjadi komponen jika dipakai create/edit atau sudah kompleks;
- komponen presentasi reusable berada di `resources/js/components`;
- logic React yang benar-benar digunakan ulang dipindahkan ke custom hook;
- TypeScript prop type harus eksplisit;
- link dan form action menggunakan Wayfinder;
- validation error Laravel ditampilkan dekat field terkait;
- deferred prop menggunakan skeleton/empty state;
- loading, empty, error, dan confirmation state harus tersedia;
- jangan menaruh seluruh halaman besar dalam satu komponen.

### 3.9 Testing

Setiap fitur mempunyai Feature Test untuk:

- guest tidak dapat mengakses halaman protected;
- user hanya dapat melihat data miliknya;
- create/update berhasil;
- validation gagal dengan pesan yang sesuai;
- cross-user ID ditolak;
- resource archived tidak dapat dipakai untuk transaksi baru;
- aturan finansial kritis dan database constraint bekerja;
- proses atomik rollback ketika salah satu operasi gagal.

Unit Test hanya digunakan untuk kalkulasi murni seperti saldo, cash flow, penggunaan budget, dan net worth bila logic sudah dipisahkan dari HTTP/database.

---

## 4. Fase 0 — Menstabilkan lingkungan pengembangan

### Hasil yang dibuat

- [ ] Buat role PostgreSQL khusus aplikasi, misalnya `tamerin_app`.
- [x] Siapkan database development dan database testing terpisah.
- [x] Aktifkan ekstensi PHP `pdo_pgsql` secara permanen pada PHP CLI.
- [x] Isi konfigurasi `.env` tanpa memasukkan credential ke Git.
- [x] Ubah konfigurasi testing dari SQLite ke PostgreSQL test.
- [ ] Ganti `RefreshDatabase` menjadi `LazilyRefreshDatabase` di konfigurasi Pest.
- [ ] Jalankan `migrate:fresh --seed` pada database development.
- [ ] Pastikan semua factory dapat membuat data tanpa melanggar constraint.
- [ ] Pastikan Pint, PHPStan, Pest, TypeScript, ESLint, dan Prettier lulus.
- [ ] Aktifkan pencegahan lazy loading pada environment non-production.

### Definition of done

Seluruh migration dan seeder berhasil pada PostgreSQL, test tidak lagi bergantung pada SQLite, dan semua pemeriksaan proyek lulus.

---

## 5. Fase 1 — Enum dan fondasi domain

### Hasil yang dibuat

Buat PHP backed enum di `app/Enums` untuk nilai yang sudah tetap, antara lain:

- theme mode dan theme preset;
- account type dan account status;
- category type;
- transaction type dan transaction status;
- savings goal/contribution status;
- investment instrument/status dan valuation status;
- asset type/status;
- obligation kind/status;
- reminder status;
- export report type dan format.

Model kemudian menggunakan enum cast. Migration tidak diubah karena enum database yang ada sudah sesuai.

### Aturan

- Enum hanya menggantikan daftar nilai tetap yang sudah disetujui.
- Label UI dapat diletakkan pada method enum sederhana jika digunakan konsisten.
- Enum tidak boleh memuat query atau business workflow.

### Test

- [x] Nilai database dikonversi ke enum yang benar.
- [x] Factory tetap menghasilkan enum value yang valid.
- [x] Nilai invalid ditolak oleh PostgreSQL.

---

## 6. Fase 2 — Autentikasi, profil, dan preferences

**Status: selesai dan terverifikasi.** Implementasi memakai kemampuan autentikasi native Laravel dan tidak menambah package baru.

### Controller autentikasi

| Controller | Method | Tanggung jawab |
|---|---|---|
| `RegisteredUserController` | `create`, `store` | Menampilkan registrasi, membuat user dan preferences default, login setelah registrasi. |
| `AuthenticatedSessionController` | `create`, `store`, `destroy` | Menampilkan login, autentikasi credential, regenerasi session, dan logout. |
| `PasswordResetLinkController` | `create`, `store` | Menampilkan permintaan reset dan mengirim reset link. |
| `NewPasswordController` | `create`, `store` | Menampilkan form reset dan menyimpan password baru. |
| `ProfileController` | `edit`, `update` | Menampilkan dan memperbarui nama/email. Tidak melakukan hard delete user. |
| `PasswordController` | `edit`, `update` | Menampilkan form dan memperbarui password setelah memverifikasi password saat ini. |
| `UserPreferenceController` | `edit`, `update` | Membaca dan memperbarui theme serta timezone pengguna. |

### Form Request

- `RegisterUserRequest`;
- `LoginRequest`;
- `ForgotPasswordRequest`;
- `ResetPasswordRequest`;
- `UpdateProfileRequest`;
- `UpdatePasswordRequest`;
- `UpdateUserPreferenceRequest`.

### Action

- `RegisterUser`: membuat user dan preferences default dalam satu transaction.
- `AuthenticateUser`;
- `ResetUserPassword`;
- `UpdateProfile`;
- `UpdatePassword`;
- `UpdateUserPreference`.

### Middleware dan security

- route aplikasi memakai `auth`;
- route login/register memakai `guest`;
- login dan reset password diberi rate limit;
- session diregenerasi setelah login dan diinvalidasi saat logout;
- halaman settings selalu memakai user dari session tanpa menerima parameter `user_id`, sehingga Policy resource belum diperlukan pada fase ini;
- tidak ada kolom role pada MVP karena seluruh user mempunyai kemampuan yang sama;
- proses penghapusan akun belum dibuat sampai kebijakan ekspor, anonimisasi, dan retensi diputuskan.

### Halaman React

- `auth/login.tsx`;
- `auth/register.tsx`;
- `auth/forgot-password.tsx`;
- `auth/reset-password.tsx`;
- `settings/profile.tsx`;
- `settings/password.tsx`;
- `settings/preferences.tsx`.

### Test

- [x] Register, login, logout, reset password.
- [x] Regenerasi session dan rate limit login/reset password.
- [x] Preferences otomatis dibuat saat registrasi.
- [x] User tidak dapat mengubah profil/preferences user lain.

### Keputusan produk

Email verification masih opsional pada dokumen database. Putuskan apakah verifikasi email diwajibkan sebelum fitur finansial dapat digunakan.

---

## 7. Fase 3 — Fondasi UI aplikasi

### Layout dan komponen

- `AppLayout`: shell halaman authenticated.
- `AuthLayout`: layout login/register.
- sidebar/navigation desktop dan navigation mobile.
- header, user menu, breadcrumb, dan page title.
- komponen tombol, input, select, textarea, modal, confirmation dialog, badge, empty state, skeleton, pagination, serta toast/flash message.
- theme provider yang membaca `user_preferences` dan mendukung `system`, `light`, serta `dark`.
- penerapan `theme_preset` dan warna custom secara tervalidasi.

### Shared Inertia props

`HandleInertiaRequests` hanya membagikan data global yang kecil:

- user authenticated yang diperlukan UI;
- preferences tema;
- flash message;
- nama aplikasi.

Data dashboard atau data domain tidak boleh dimasukkan sebagai shared props.

### Test dan quality

- [ ] TypeScript, ESLint, dan Prettier lulus.
- [ ] Navigation aktif sesuai route.
- [ ] Theme tersimpan dan diterapkan setelah reload.
- [ ] Tampilan dapat digunakan pada mobile dan desktop.

---

## 8. Fase 4 — Financial accounts dan categories

### Financial accounts

#### Controller

`FinancialAccountController`:

- `index`: memanggil query akun milik user dan mengirim data paginated ke Inertia;
- `create`: menampilkan form dengan pilihan tipe akun;
- `store`: menerima `StoreFinancialAccountRequest`, memanggil `CreateFinancialAccount`, lalu redirect;
- `edit`: authorize akun dan menampilkan form edit;
- `update`: menerima `UpdateFinancialAccountRequest` dan memanggil `UpdateFinancialAccount`.

`ArchiveFinancialAccountController` sebagai invokable controller:

- authorize method `archive`;
- memanggil `ArchiveFinancialAccount`;
- tidak melakukan hard delete.

#### Request dan Policy

- `StoreFinancialAccountRequest`;
- `UpdateFinancialAccountRequest`;
- `FinancialAccountPolicy` untuk ownership dan aturan archive.

#### Action

- `CreateFinancialAccount`;
- `UpdateFinancialAccount`;
- `ArchiveFinancialAccount`.

Archive harus menolak akun yang sudah archived dan mengisi `status` serta `archived_at` secara konsisten.

### Categories

#### Controller

`CategoryController`:

- `index`, `create`, `store`, `edit`, dan `update`;
- tidak menyediakan hard delete.

`ArchiveCategoryController`:

- authorize category;
- memanggil `ArchiveCategory`;
- menjaga histori transaksi dan budget.

#### Request, Policy, dan Action

- `StoreCategoryRequest` dan `UpdateCategoryRequest`;
- `CategoryPolicy`;
- `CreateCategory`, `UpdateCategory`, dan `ArchiveCategory`.

### Halaman React

- `financial-accounts/index.tsx`, `create.tsx`, `edit.tsx`;
- `categories/index.tsx`, `create.tsx`, `edit.tsx`;
- form domain reusable dan confirmation dialog untuk archive.

### Test kritis

- [ ] Nama akun aktif unik per user.
- [ ] Nama kategori unik per user dan tipe.
- [ ] User A tidak dapat membaca/mengubah data User B.
- [ ] Data archived tetap terlihat di histori tetapi tidak tersedia pada pilihan data baru.

---

## 9. Fase 5 — Transactions sebagai inti aplikasi

### Controller

`TransactionController`:

- `index`: memakai `TransactionIndexQuery`, filter tanggal/tipe/akun/kategori/status, eager load relasi, dan pagination;
- `create`: mengirim akun aktif serta kategori aktif ke form;
- `store`: menerima `StoreTransactionRequest` dan memanggil `RecordTransaction`;
- `show`: authorize dan menampilkan detail transaksi.

Tidak dibuat method `update` atau `destroy` karena transaksi historis tidak boleh diubah atau dihapus langsung.

`VoidTransactionController` sebagai invokable controller:

- menerima `VoidTransactionRequest`;
- authorize method `void`;
- memanggil `VoidTransaction`;
- mengisi `status`, `voided_at`, dan `void_reason`;
- mencatat audit event dalam transaction yang sama.

### Action

- `RecordTransaction`: menangani income, expense, dan transfer dengan aturan sesuai tipe;
- `VoidTransaction`: membatalkan transaksi tanpa hard delete;
- `RecordAuditEvent`: dipanggil langsung untuk audit yang harus atomik.

### Query

- `TransactionIndexQuery` untuk filter dan pagination;
- `AccountBalanceQuery` untuk menghitung opening balance ditambah seluruh transaksi posted;
- query tidak menyimpan saldo hasil kalkulasi ke tabel account.

### Form Request

- `StoreTransactionRequest` dengan conditional rule berdasarkan tipe;
- `VoidTransactionRequest` dengan alasan wajib dan maksimal 500 karakter.

### Policy

`TransactionPolicy` memeriksa ownership untuk view dan void serta menolak transaksi yang sudah voided.

### Halaman React

- `transactions/index.tsx`: tabel, filter, pagination, badge status, dan empty state;
- `transactions/create.tsx`: form dinamis income/expense/transfer;
- `transactions/show.tsx`: detail dan aksi void;
- komponen `transaction-form`, `transaction-filters`, dan `void-transaction-dialog` bila kompleksitas sudah membutuhkannya.

### Test kritis

- [ ] Income menambah saldo akun.
- [ ] Expense mengurangi saldo akun.
- [ ] Transfer mengurangi akun asal dan menambah akun tujuan tanpa masuk cash flow.
- [ ] Kategori sesuai tipe transaksi.
- [ ] Akun tujuan transfer berbeda dari akun sumber.
- [ ] Cross-user account/category ditolak.
- [ ] Idempotency key mencegah request ganda.
- [ ] Void menghilangkan dampak transaksi dari perhitungan dan menyimpan audit.

---

## 10. Fase 6 — Dashboard

### Controller

`DashboardController@index` hanya:

- menentukan periode dari request yang tervalidasi;
- memanggil query dashboard;
- mengembalikan page `dashboard/index`.

### Query

- `DashboardSummaryQuery`: total saldo, income, expense, dan cash flow periode;
- `RecentTransactionQuery`: transaksi terbaru dengan relasi eager loaded;
- `BudgetUsageQuery`: penggunaan budget dari transaksi expense posted;
- `NetWorthQuery`: saldo akun + investasi + aset + piutang - utang;
- `SystemReminderQuery`: menghitung reminder budget, due obligation, target tabungan, dan investasi yang belum dinilai.

Query dashboard harus menggunakan aggregate database dan tidak memuat seluruh transaksi ke memory. Data yang mahal dapat dikirim sebagai deferred props dengan skeleton.

### Halaman React

- kartu ringkasan;
- grafik cash flow;
- ringkasan akun;
- budget progress;
- transaksi terbaru;
- reminder sistem;
- empty state untuk user baru.

### Test

- [ ] Semua angka hanya berasal dari data user aktif.
- [ ] Transfer dan transaksi voided tidak salah masuk cash flow.
- [ ] Net worth menghitung debt/receivable dengan tanda yang benar.
- [ ] Query count tidak meningkat berdasarkan jumlah baris.

---

## 11. Fase 7 — Budgets

### Controller

`BudgetController`:

- `index`: budget per bulan dengan nilai penggunaan hasil query;
- `store`: membuat budget kategori expense;
- `update`: memperbarui nominal budget;
- `destroy`: menghapus budget jika keputusan produk mengizinkan penghapusan data perencanaan.

Create/edit dapat memakai modal pada halaman index sehingga method `create` dan `edit` tidak wajib.

### Request, Policy, dan Action

- `StoreBudgetRequest` dan `UpdateBudgetRequest`;
- `BudgetPolicy`;
- `CreateBudget`, `UpdateBudget`, dan opsional `DeleteBudget`;
- `BudgetUsageQuery` menghitung pemakaian, bukan kolom `spent_amount`.

### Test

- [ ] Hanya satu budget untuk user, kategori, dan bulan yang sama.
- [ ] `period_start` selalu tanggal pertama bulan.
- [ ] Hanya kategori expense milik user yang diterima.
- [ ] Expense voided tidak dihitung.

---

## 12. Fase 8 — Savings goals dan contributions

### Controller

`SavingsGoalController`:

- `index`, `create`, `store`, `show`, `edit`, dan `update`;
- tidak melakukan hard delete.

`ArchiveSavingsGoalController`:

- menandai goal archived dan mengisi `archived_at`.

`SavingsContributionController`:

- `store`: menambah kontribusi ke goal aktif;
- tidak menyediakan update/hard delete.

`VoidSavingsContributionController`:

- membatalkan contribution yang salah dan menyimpan alasan.

### Action

- `CreateSavingsGoal`, `UpdateSavingsGoal`, `ArchiveSavingsGoal`;
- `RecordSavingsContribution`, `VoidSavingsContribution`;
- `CompleteSavingsGoal` bila total contribution active mencapai target.

Contribution tidak otomatis mengubah saldo account. Jika uang benar-benar dipindahkan, user membuat transfer terpisah.

### Test

- [ ] Progress hanya menjumlah contribution active.
- [ ] Goal completed/archived menolak contribution baru.
- [ ] Account pada contribution hanya konteks dan tidak mengubah saldo.
- [ ] Semua related ID dimiliki user yang sama.

---

## 13. Fase 9 — Investments dan assets

### Investment holding

`InvestmentHoldingController` menangani `index`, `create`, `store`, `show`, `edit`, dan `update`.

`ArchiveInvestmentHoldingController` menangani archive tanpa menghapus riwayat valuasi.

Action:

- `CreateInvestmentHolding`;
- `UpdateInvestmentHolding`;
- `ArchiveInvestmentHolding`.

### Investment valuation

`InvestmentValuationController@store` mencatat valuasi baru.

`VoidInvestmentValuationController` mengubah status valuasi menjadi voided.

`RecordInvestmentValuation` harus menjalankan transaction yang:

1. membuat valuation;
2. memperbarui `investment_holdings.last_valuation_at` berdasarkan valuation active terbaru;
3. mencatat audit event.

### Assets

`AssetController` menangani `index`, `create`, `store`, `show`, `edit`, dan `update`.

`ArchiveAssetController` mengarsipkan aset tanpa hard delete.

### Query

- `CurrentInvestmentValueQuery`;
- `InvestmentPerformanceQuery`;
- `AssetSummaryQuery`.

### Test

- [ ] Units positif jika diisi.
- [ ] Nilai investasi/aset tidak negatif.
- [ ] Satu holding hanya mempunyai satu valuation per tanggal.
- [ ] `last_valuation_at` selalu sinkron dengan valuation active terbaru.
- [ ] Archive tidak menghapus histori.

---

## 14. Fase 10 — Obligations dan settlements

### Controller

`ObligationController`:

- `index`, `create`, `store`, `show`, `edit`, dan `update`;
- filter debt/receivable, status, serta due date.

`ArchiveObligationController`:

- hanya mengarsipkan sesuai aturan bisnis;
- tidak menghapus settlement.

`ObligationSettlementController@store`:

- menerima request pembayaran debt atau penerimaan receivable;
- memanggil `SettleObligation`;
- redirect ke detail obligation.

### Action `SettleObligation`

Dalam satu database transaction:

1. lock obligation dengan `lockForUpdate()`;
2. pastikan status masih open;
3. pastikan amount tidak melebihi outstanding amount;
4. buat expense transaction untuk debt atau income transaction untuk receivable;
5. buat obligation settlement yang menunjuk transaction tersebut;
6. kurangi outstanding amount;
7. ubah status dan `settled_at` ketika outstanding menjadi nol;
8. catat audit event.

Idempotency key digunakan untuk mencegah pembayaran ganda.

### Test kritis

- [ ] Debt menghasilkan expense dan receivable menghasilkan income.
- [ ] Overpayment ditolak.
- [ ] Dua request bersamaan tidak dapat melunasi melebihi outstanding.
- [ ] Pelunasan terakhir mengubah status menjadi settled.
- [ ] Obligation settled menolak settlement tambahan.

### Keputusan produk

Schema belum mendefinisikan mekanisme membatalkan `obligation_settlements`. Sebelum fitur koreksi settlement dibuat, tentukan apakah settlement dibatalkan melalui transaction void dan reversal, atau memerlukan perubahan schema.

---

## 15. Fase 11 — Manual reminders

### Controller

`ManualReminderController`:

- `index`, `store`, `update`, dan `destroy` jika penghapusan reminder disetujui;
- halaman dapat menggunakan modal sehingga create/edit route terpisah tidak wajib.

Controller invokable untuk perubahan status:

- `CompleteManualReminderController`;
- `DismissManualReminderController`.

### Request, Policy, dan Action

- `StoreManualReminderRequest`, `UpdateManualReminderRequest`;
- `ManualReminderPolicy`;
- `CreateManualReminder`, `UpdateManualReminder`, `CompleteManualReminder`, dan `DismissManualReminder`.

Reminder sistem tidak disimpan di tabel ini; reminder tersebut tetap dihitung oleh `SystemReminderQuery`.

### Test

- [ ] User hanya melihat reminder miliknya.
- [ ] Perubahan status valid.
- [ ] Reminder sistem hilang otomatis ketika sumber masalah terselesaikan.

---

## 16. Fase 12 — Reports, exports, dan audit

### Reports

`ReportController@index`:

- menerima filter periode dan tipe laporan;
- memanggil `FinancialReportQuery`;
- mengirim ringkasan serta detail paginated ke Inertia.

Jenis laporan awal:

- transactions;
- cash flow;
- budgets;
- savings;
- investments;
- net worth;
- obligations.

### Export

`ExportReportController@store`:

- menerima `ExportReportRequest`;
- authorize user;
- memilih generator berdasarkan format;
- menghasilkan PDF/XLSX;
- membuat `export_audits` setelah file berhasil dibuat;
- mengembalikan download response;
- tidak menyimpan file permanen pada MVP.

Gunakan Job hanya jika volume laporan membuat request sinkron terlalu lambat. Package untuk PDF/XLSX tidak boleh ditambahkan sebelum mendapat persetujuan.

### Audit

`RecordAuditEvent` digunakan oleh Action finansial kritis. Audit mencatat:

- user pemilik data;
- actor;
- action;
- auditable type dan ID;
- old/new values yang aman;
- request ID;
- waktu kejadian.

Password, token, secret, dan data sensitif tidak boleh masuk audit log.

Jika riwayat audit akan ditampilkan kepada user, buat `AuditEventController@index` read-only dengan filter dan pagination. Jangan membuat update/delete audit event.

### Test

- [ ] Filter laporan menghasilkan angka yang benar.
- [ ] Export audit hanya dibuat setelah file berhasil.
- [ ] File tidak tersimpan permanen.
- [ ] Audit old/new values tidak mengandung data sensitif.
- [ ] User tidak dapat melihat export/audit user lain.

---

## 17. Fase 13 — Hardening dan kesiapan production

### Security

- [ ] Review seluruh Policy dan authorization test.
- [ ] Rate limit login, reset password, transaksi, settlement, dan export.
- [ ] Pastikan tidak ada `env()` di luar file config.
- [ ] Pastikan tidak ada secret atau data sensitif di log/audit.
- [ ] Jalankan dependency audit untuk Composer dan NPM.
- [ ] Susun proses controlled account deletion, export, anonymization, dan retention.

### Performance

- [ ] Periksa query dashboard/report dengan `EXPLAIN` pada data representatif.
- [ ] Pastikan tidak ada N+1.
- [ ] Pastikan semua list memakai pagination.
- [ ] Tambahkan index hanya berdasarkan query nyata yang sudah terukur.
- [ ] Pertimbangkan cache hanya untuk agregat yang mahal dan mempunyai strategi invalidasi jelas.

### Reliability

- [ ] Queue worker dan retry policy jika export/job asynchronous digunakan.
- [ ] Structured logging dengan request ID.
- [ ] Health check aplikasi dan database.
- [ ] Backup serta prosedur restore PostgreSQL diuji.
- [ ] Error page dan exception handling production.

### Quality gate

Setiap merge harus lulus:

```text
Laravel Pint
PHPStan level 7
Pest Feature/Unit Tests
TypeScript type check
ESLint
Prettier
Frontend production build
```

---

## 18. Urutan implementasi yang direkomendasikan

```text
Fase 0  Environment dan PostgreSQL testing
Fase 1  PHP Enum dan domain foundation
Fase 2  Authentication, profile, preferences
Fase 3  Layout dan komponen UI
Fase 4  Financial accounts dan categories
Fase 5  Transactions
Fase 6  Dashboard
Fase 7  Budgets
Fase 8  Savings goals
Fase 9  Investments dan assets
Fase 10 Obligations dan settlements
Fase 11 Manual reminders
Fase 12 Reports, exports, audit
Fase 13 Security, performance, production hardening
```

Urutan ini dipilih karena transaction, dashboard, budget, settlement, dan laporan semuanya bergantung pada account serta category yang sudah stabil.

---

## 19. Checklist clean code setiap fitur

Sebelum sebuah fitur dianggap selesai:

- [ ] Route hanya menangani routing dan middleware.
- [ ] Validation non-trivial berada di Form Request.
- [ ] Authorization berada di Policy/Form Request.
- [ ] Controller tipis dan tidak berisi business logic.
- [ ] Satu Action mewakili satu use case.
- [ ] Tidak ada Service/Repository/DTO tanpa kebutuhan nyata.
- [ ] Ownership `user_id` selalu diperiksa di backend.
- [ ] Operasi multi-query kritis memakai transaction.
- [ ] Query tidak menimbulkan N+1.
- [ ] Dataset besar menggunakan pagination/chunking.
- [ ] React page tidak menjadi komponen raksasa.
- [ ] Wayfinder digunakan untuk route frontend.
- [ ] Happy path, validation, authorization, dan business rule mempunyai test.
- [ ] Pint, PHPStan, Pest, TypeScript, ESLint, dan Prettier lulus.
- [ ] Tidak ada unused import, dead code, magic string berulang, atau secret hardcoded.

Jika instruksi implementasi berikutnya berpotensi melanggar checklist ini, asisten harus memberi peringatan dan alternatif yang lebih bersih sebelum mengubah kode.

---

## 20. Keputusan produk yang masih perlu dibuat

Keputusan berikut tidak boleh diasumsikan saat implementasi:

1. Apakah email verification wajib?
2. Apakah budget dan manual reminder boleh dihapus permanen?
3. Bagaimana proses pembatalan/koreksi obligation settlement?
4. Apa isi dan layout final setiap jenis laporan?
5. Package apa yang disetujui untuk PDF dan XLSX?
6. Kapan export harus menjadi queued job?
7. Berapa lama audit/export history disimpan?
8. Bagaimana proses export, anonimisasi, dan retensi ketika user menghapus akun?
9. Apakah audit history ditampilkan kepada user atau hanya untuk operasional internal?

Setiap keputusan yang sudah final harus direkam ke `.ai/rules` agar konsisten pada pekerjaan berikutnya.
