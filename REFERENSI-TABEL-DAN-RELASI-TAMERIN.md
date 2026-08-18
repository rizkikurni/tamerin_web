# Tamerin — Referensi Lengkap Tabel dan Relasi Database

Dokumen ini menjelaskan bentuk database Tamerin secara rinci: isi setiap tabel, arti kolom, hubungan antar tabel, jenis relasi, aturan penghapusan, dan aturan penting yang dijaga sistem.

> Ini adalah rancangan database untuk Laravel + PostgreSQL. Nama kolom dapat sedikit berubah saat implementasi, tetapi **makna data, relasi, dan aturan bisnis ini tidak boleh berubah tanpa persetujuan pemilik produk**.

---

## 1. Cara membaca dokumen ini

### Jenis relasi

| Notasi | Nama | Makna |
|---|---|---|
| `1 : 1` | One-to-one | Satu data A hanya memiliki satu data B, dan sebaliknya |
| `1 : N` | One-to-many | Satu data A dapat mempunyai banyak data B; setiap B hanya milik satu A |
| `N : M` | Many-to-many | Banyak A dapat berhubungan dengan banyak B; biasanya membutuhkan tabel penghubung |

### Arti jenis data

| Tipe | Arti |
|---|---|
| `ULID` | ID unik publik yang aman dipakai pada URL |
| `FK` | Foreign Key: kolom yang menunjuk ke data pada tabel lain |
| `varchar(n)` | teks pendek dengan batas panjang |
| `text` | teks panjang |
| `bigint` | bilangan bulat besar; dipakai untuk nominal Rupiah |
| `date` | tanggal tanpa jam |
| `timestamp` | tanggal dan jam |
| `boolean` | ya/tidak |
| `enum` | salah satu pilihan nilai yang sudah ditentukan |
| `jsonb` | data JSON yang terstruktur; dipakai hanya untuk filter audit, bukan data finansial inti |

### Aturan uang

Semua nominal disimpan sebagai `bigint` dalam Rupiah penuh.

```text
Rp25.000 disimpan sebagai 25000
Rp1.500.000 disimpan sebagai 1500000
```

Tidak ada nominal `float`, karena angka pecahan komputer dapat menghasilkan kesalahan perhitungan uang.

---

## 2. Diagram relasi besar

```text
users 1:1 user_preferences
users 1:N financial_accounts
users 1:N categories
users 1:N transactions
users 1:N budgets
users 1:N savings_goals 1:N savings_contributions
users 1:N investment_holdings 1:N investment_valuations
users 1:N assets
users 1:N obligations 1:N obligation_settlements
users 1:N manual_reminders
users 1:N export_audits
users 1:N audit_events

financial_accounts 1:N transactions (sebagai akun utama/sumber)
financial_accounts 1:N transactions (sebagai akun tujuan transfer)
categories 1:N transactions
categories 1:N budgets
financial_accounts 1:N obligation_settlements
obligations 1:N obligation_settlements
transactions 0..1:1 obligation_settlements
savings_goals 1:N savings_contributions
investment_holdings 1:N investment_valuations
```

### Apakah ada many-to-many?

**Tidak ada relasi many-to-many pada versi pertama.**

Alasannya: semua domain Tamerin saat ini memiliki pemilik dan hubungan yang jelas. Contoh:

- satu transaksi hanya memakai satu kategori;
- satu budget hanya berlaku untuk satu kategori pada satu bulan;
- satu pembayaran hanya melunasi satu utang/piutang;
- satu pembaruan nilai hanya milik satu investasi.

Jika kelak ingin membuat fitur seperti “satu transaksi memakai banyak tag”, barulah dibutuhkan tabel penghubung `transaction_tags` untuk relasi `transactions N:M tags`.

---

# 3. Tabel identitas dan pengaturan

## 3.1 `users`

Menyimpan akun pengguna Tamerin.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | identitas pengguna |
| `name` | varchar(120) | Tidak | | nama tampilan pengguna |
| `email` | varchar(255) | Tidak | unique | email untuk login |
| `email_verified_at` | timestamp | Ya | | waktu verifikasi email bila digunakan |
| `password` | varchar(255) | Tidak | hash saja | password yang sudah dienkripsi/hash |
| `remember_token` | varchar(100) | Ya | | sesi login “ingat saya” |
| `created_at` | timestamp | Tidak | index opsional | waktu akun dibuat |
| `updated_at` | timestamp | Tidak | | waktu perubahan terakhir |

### Relasi

| Dari | Ke | Jenis | Penjelasan |
|---|---|---|---|
| `users` | `user_preferences` | `1:1` | satu pengguna punya satu set pengaturan |
| `users` | seluruh tabel keuangan | `1:N` | satu pengguna memiliki banyak data finansial |

### Aturan

- Email harus unik secara global.
- `user_id` pada semua data finansial menjadi batas keamanan utama.
- Penghapusan akun pengguna tidak boleh langsung menghapus riwayat finansial secara diam-diam. Gunakan proses hapus akun terkontrol, ekspor data terlebih dahulu, lalu anonimisasi/retensi sesuai kebijakan produk.

---

## 3.2 `user_preferences`

Menyimpan pengaturan tampilan dan zona waktu pengguna.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID pengaturan |
| `user_id` | ULID / FK | Tidak | unique, FK → `users.id` | pemilik pengaturan |
| `theme_mode` | enum | Tidak | `system`, `light`, `dark` | mode tampilan |
| `theme_preset` | enum | Tidak | `ocean`, `forest`, `violet`, `custom` | pilihan tema |
| `primary_hex` | varchar(7) | Ya | valid `#RRGGBB` | warna utama kustom |
| `secondary_hex` | varchar(7) | Ya | valid `#RRGGBB` | warna pendukung kustom |
| `accent_hex` | varchar(7) | Ya | valid `#RRGGBB` | warna aksen kustom |
| `timezone` | varchar(64) | Tidak | default `Asia/Jakarta` | zona waktu tampilan pengguna |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── 1 user_preferences
```

Satu `user_preferences.user_id` harus unik. Artinya, satu pengguna tidak boleh mempunyai dua konfigurasi tema.

---

# 4. Tabel akun dan kategori

## 4.1 `financial_accounts`

Menyimpan tempat uang pengguna berada.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID akun |
| `user_id` | ULID / FK | Tidak | index `(user_id, status)` | pemilik akun |
| `name` | varchar(80) | Tidak | unique aktif per pengguna | contoh: BCA, Cash, GoPay |
| `type` | enum | Tidak | `cash`, `bank`, `e_wallet` | jenis akun |
| `opening_balance` | bigint | Tidak | default `0` | saldo saat akun pertama dimasukkan ke Tamerin |
| `opened_on` | date | Tidak | | tanggal saldo awal berlaku |
| `status` | enum | Tidak | `active`, `archived` | apakah masih dapat dipakai transaksi baru |
| `archived_at` | timestamp | Ya | | kapan diarsipkan |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

| Dari | Ke | Jenis | Peran |
|---|---|---|---|
| `users` | `financial_accounts` | `1:N` | satu pengguna memiliki banyak akun |
| `financial_accounts` | `transactions` | `1:N` | akun sebagai sumber/pemilik transaksi income/expense atau sumber transfer |
| `financial_accounts` | `transactions` | `1:N` | akun juga dapat menjadi tujuan transfer |
| `financial_accounts` | `obligation_settlements` | `1:N` | akun dipakai membayar utang atau menerima piutang |
| `financial_accounts` | `savings_contributions` | `1:N` opsional | akun yang dipilih sebagai konteks setoran target; tidak mengubah saldo otomatis |

### Aturan relasi

- `financial_accounts.user_id` → `users.id`.
- Satu pengguna tidak boleh punya dua akun aktif dengan nama sama.
- Akun yang sudah dipakai transaksi **tidak boleh dihapus keras**; hanya diarsipkan.
- Akun diarsipkan tidak dapat dipilih untuk transaksi atau pelunasan baru, tetapi masih muncul di riwayat lama.
- Satu baris transaksi transfer dapat menunjuk dua akun berbeda: `account_id` sebagai asal dan `destination_account_id` sebagai tujuan.

---

## 4.2 `categories`

Menyimpan klasifikasi pemasukan dan pengeluaran.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID kategori |
| `user_id` | ULID / FK | Tidak | index | pemilik kategori |
| `name` | varchar(60) | Tidak | unique `(user_id, type, name)` | contoh: Gaji, Makan & Minum |
| `type` | enum | Tidak | `income`, `expense` | jenis kategori |
| `color_token` | varchar(40) | Ya | | token warna presentasi, bukan CSS bebas |
| `icon` | varchar(40) | Ya | | nama ikon Lucide |
| `is_system` | boolean | Tidak | default `false` | penanda kategori bawaan |
| `archived_at` | timestamp | Ya | | arsip kategori |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

| Dari | Ke | Jenis | Penjelasan |
|---|---|---|---|
| `users` | `categories` | `1:N` | pengguna punya banyak kategori |
| `categories` | `transactions` | `1:N` | satu kategori dipakai banyak pemasukan/pengeluaran |
| `categories` | `budgets` | `1:N` | satu kategori pengeluaran dapat punya budget pada banyak bulan |

### Aturan relasi

- Kategori `income` hanya boleh dihubungkan ke transaksi `income`.
- Kategori `expense` hanya boleh dihubungkan ke transaksi `expense` dan budget.
- Kategori yang pernah dipakai tidak dihapus; diarsipkan.
- Transfer tidak memiliki kategori.

---

# 5. Tabel pergerakan uang

## 5.1 `transactions`

Ini adalah tabel paling penting. Ia menyimpan pemasukan, pengeluaran, dan transfer.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID transaksi |
| `user_id` | ULID / FK | Tidak | index `(user_id, transacted_on DESC)` | pemilik transaksi |
| `type` | enum | Tidak | `income`, `expense`, `transfer` | jenis transaksi |
| `amount` | bigint | Tidak | harus `> 0` | nominal Rupiah positif |
| `transacted_on` | date | Tidak | index bersama user | tanggal transaksi |
| `account_id` | ULID / FK | Tidak | index `(user_id, account_id, transacted_on)` | akun utama; sumber untuk transfer |
| `destination_account_id` | ULID / FK | Ya | index | tujuan, hanya untuk transfer |
| `category_id` | ULID / FK | Ya | index `(user_id, category_id, transacted_on)` | kategori, hanya income/expense |
| `note` | varchar(500) | Ya | | catatan pengguna |
| `status` | enum | Tidak | `posted`, `voided` | transaksi berlaku atau dibatalkan |
| `voided_at` | timestamp | Ya | | waktu pembatalan |
| `void_reason` | varchar(500) | Ya | wajib jika `voided` | alasan pembatalan |
| `idempotency_key` | varchar(64) | Ya | unique per user bila digunakan | mencegah transaksi ganda karena klik/ulang request |
| `created_by` | ULID / FK | Tidak | FK → `users.id` | siapa yang membuat; biasanya sama dengan `user_id` |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

| Dari | Ke | Jenis | Penjelasan |
|---|---|---|---|
| `users` | `transactions` | `1:N` | setiap pengguna punya banyak transaksi |
| `financial_accounts` | `transactions.account_id` | `1:N` | satu akun menjadi sumber/basis banyak transaksi |
| `financial_accounts` | `transactions.destination_account_id` | `1:N` | satu akun dapat menerima banyak transfer |
| `categories` | `transactions` | `1:N` | satu kategori dipakai banyak income/expense |
| `transactions` | `obligation_settlements` | `0..1 : 1` | satu transaksi dapat terkait satu pelunasan; satu pelunasan punya tepat satu transaksi yang terkait |

### Aturan berdasarkan jenis transaksi

| Kolom | Income | Expense | Transfer |
|---|---|---|---|
| `account_id` | wajib: akun uang masuk | wajib: akun uang keluar | wajib: akun asal |
| `destination_account_id` | kosong | kosong | wajib: akun tujuan, harus berbeda |
| `category_id` | wajib: kategori income | wajib: kategori expense | kosong |
| Dampak saldo | tambah | kurang | asal kurang, tujuan tambah |
| Dampak laporan cash flow | pemasukan | pengeluaran | tidak masuk total |
| Dampak budget | tidak | ya | tidak |

### Aturan keamanan

- Ketiga FK: akun, akun tujuan, dan kategori harus milik pengguna yang sama dengan `transactions.user_id`.
- Aplikasi wajib mengecek jenis kategori sesuai jenis transaksi.
- Database memiliki check constraint dasar: nominal > 0, transfer tidak boleh memiliki akun asal = tujuan, dan transfer harus memiliki akun tujuan.
- Transaksi yang pernah tersimpan tidak boleh hard delete. Bila salah, statusnya menjadi `voided` dan alasan dicatat.

---

# 6. Tabel pengendalian pengeluaran dan tujuan

## 6.1 `budgets`

Menyimpan batas pengeluaran per kategori pada satu bulan.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID budget |
| `user_id` | ULID / FK | Tidak | | pemilik budget |
| `category_id` | ULID / FK | Tidak | | harus kategori expense milik user |
| `period_start` | date | Tidak | unique gabungan | selalu tanggal pertama bulan, contoh `2026-08-01` |
| `amount` | bigint | Tidak | harus `> 0` | batas budget bulan tersebut |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── N budgets
categories 1 ─── N budgets
```

### Unique constraint

```text
(user_id, category_id, period_start) harus unik
```

Artinya, seorang pengguna tidak bisa membuat dua budget “Makan & Minum” untuk Agustus 2026.

### Catatan penting

Tabel ini **tidak menyimpan kolom `spent_amount`** sebagai sumber utama. Nilai pemakaian dihitung dari transaksi pengeluaran yang cocok dengan kategori dan bulan budget. Hal ini mencegah angka budget tidak sinkron dengan riwayat transaksi.

---

## 6.2 `savings_goals`

Menyimpan target keuangan pengguna.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID target |
| `user_id` | ULID / FK | Tidak | index `(user_id, status)` | pemilik target |
| `name` | varchar(120) | Tidak | | contoh: Dana Darurat |
| `target_amount` | bigint | Tidak | harus `> 0` | target dana |
| `target_date` | date | Ya | | target selesai opsional |
| `status` | enum | Tidak | `active`, `completed`, `archived` | status target |
| `completed_at` | timestamp | Ya | | waktu target tercapai |
| `archived_at` | timestamp | Ya | | waktu target diarsipkan |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── N savings_goals
savings_goals 1 ─── N savings_contributions
```

---

## 6.3 `savings_contributions`

Menyimpan riwayat setoran/progres untuk satu target tabungan.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID setoran |
| `user_id` | ULID / FK | Tidak | index | pemilik setoran |
| `savings_goal_id` | ULID / FK | Tidak | index `(savings_goal_id, contributed_on)` | target yang menerima setoran |
| `account_id` | ULID / FK | Ya | | akun asal yang dipilih sebagai konteks |
| `amount` | bigint | Tidak | harus `> 0` | nominal setoran target |
| `contributed_on` | date | Tidak | | tanggal setoran |
| `note` | varchar(500) | Ya | | catatan |
| `status` | enum | Tidak | `active`, `voided` | status setoran |
| `voided_at`, `void_reason` | timestamp/varchar | Ya | | pembatalan bila salah |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

| Dari | Ke | Jenis | Penjelasan |
|---|---|---|---|
| `users` | `savings_contributions` | `1:N` | pengguna membuat banyak setoran |
| `savings_goals` | `savings_contributions` | `1:N` | satu target menerima banyak setoran |
| `financial_accounts` | `savings_contributions` | `1:N` opsional | akun yang dipilih sebagai sumber konteks |

### Aturan penting

- Progres target = jumlah semua setoran `active` untuk target tersebut.
- Setoran target **tidak otomatis mengurangi saldo akun**. Ini mencegah uang yang sama dihitung dua kali.
- Bila pengguna benar-benar memindahkan uang ke rekening tabungan, transaksi transfer dicatat terpisah.
- Target `completed` atau `archived` tidak menerima setoran biasa tanpa dibuka kembali secara eksplisit.

---

# 7. Tabel investasi dan aset

## 7.1 `investment_holdings`

Menyimpan daftar investasi utama pengguna.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID investasi |
| `user_id` | ULID / FK | Tidak | index `(user_id, status)` | pemilik |
| `name` | varchar(120) | Tidak | | contoh: BBCA, RDPU ABC |
| `instrument_type` | enum | Tidak | `stock`, `mutual_fund`, `crypto`, `bond`, `gold`, `other` | jenis instrumen |
| `acquisition_cost` | bigint | Tidak | `>= 0` | total modal/nilai beli |
| `acquired_on` | date | Tidak | | tanggal diperoleh |
| `units` | numeric(20,8) | Ya | `> 0` jika diisi | jumlah unit; tidak dipakai untuk nilai uang |
| `status` | enum | Tidak | `active`, `archived` | status investasi |
| `last_valuation_at` | date | Ya | index | tanggal nilai terakhir diperbarui |
| `archived_at` | timestamp | Ya | | waktu arsip |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── N investment_holdings
investment_holdings 1 ─── N investment_valuations
```

`last_valuation_at` adalah salinan praktis dari tanggal valuasi terakhir agar reminder dashboard dapat dibuat cepat. Riwayat aslinya tetap berada pada tabel valuasi.

---

## 7.2 `investment_valuations`

Menyimpan riwayat pembaruan nilai satu investasi.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID valuasi |
| `user_id` | ULID / FK | Tidak | index | pemilik |
| `investment_holding_id` | ULID / FK | Tidak | unique per tanggal | investasi yang dinilai |
| `valued_on` | date | Tidak | unique `(investment_holding_id, valued_on)` | tanggal nilai berlaku |
| `value` | bigint | Tidak | `>= 0` | nilai investasi pada tanggal tersebut |
| `note` | varchar(500) | Ya | | catatan sumber/perubahan |
| `status` | enum | Tidak | `active`, `voided` | status valuasi |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
investment_holdings 1 ─── N investment_valuations
```

Satu investasi dapat memiliki banyak pembaruan nilai. Nilai paling baru menjadi nilai saat ini.

### Aturan

- Tidak boleh dua valuasi untuk investasi yang sama pada tanggal yang sama.
- Saat valuasi baru dibuat, `investment_holdings.last_valuation_at` diperbarui dalam proses yang sama.
- Jika belum pernah ada valuasi, investasi ditampilkan “Belum dinilai”; untung/rugi tidak dihitung.

---

## 7.3 `assets`

Menyimpan aset fisik/non-investasi milik pengguna.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID aset |
| `user_id` | ULID / FK | Tidak | index `(user_id, status)` | pemilik |
| `name` | varchar(120) | Tidak | | contoh: Laptop, Motor |
| `asset_type` | enum | Tidak | `vehicle`, `electronics`, `property`, `jewelry`, `other` | kategori aset |
| `acquired_on` | date | Ya | | tanggal diperoleh |
| `acquisition_cost` | bigint | Ya | `>= 0` | nilai beli awal |
| `current_value` | bigint | Tidak | `>= 0` | estimasi nilai saat ini |
| `valued_on` | date | Tidak | | tanggal estimasi nilai terakhir |
| `note` | varchar(500) | Ya | | catatan |
| `status` | enum | Tidak | `active`, `archived` | status aset |
| `archived_at` | timestamp | Ya | | waktu arsip |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── N assets
```

Versi pertama tidak membuat tabel histori nilai aset agar tetap sederhana. Nilai terakhir disimpan langsung pada aset. Jika nanti riwayat depresiasi diperlukan, dapat ditambah tabel `asset_valuations` dengan relasi `assets 1:N asset_valuations`.

---

# 8. Tabel utang dan piutang

## 8.1 `obligations`

Menyimpan utang pengguna atau piutang pengguna.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID utang/piutang |
| `user_id` | ULID / FK | Tidak | index `(user_id, kind, status, due_on)` | pemilik |
| `kind` | enum | Tidak | `debt`, `receivable` | utang atau piutang |
| `counterparty_name` | varchar(120) | Tidak | | nama pihak terkait |
| `original_amount` | bigint | Tidak | harus `> 0` | jumlah awal |
| `outstanding_amount` | bigint | Tidak | `0 <= outstanding <= original` | sisa yang belum dibayar/diterima |
| `started_on` | date | Tidak | | tanggal mulai |
| `due_on` | date | Ya | index | tanggal jatuh tempo |
| `status` | enum | Tidak | `open`, `settled`, `archived` | status kewajiban |
| `settled_at` | timestamp | Ya | | waktu lunas |
| `archived_at` | timestamp | Ya | | waktu arsip |
| `note` | varchar(500) | Ya | | catatan |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── N obligations
obligations 1 ─── N obligation_settlements
```

### Aturan

- `debt`: pengguna yang harus membayar pihak lain.
- `receivable`: pihak lain yang harus membayar pengguna.
- Saat `outstanding_amount = 0`, status otomatis menjadi `settled`.
- Data lunas tidak dapat menerima pembayaran tambahan.

---

## 8.2 `obligation_settlements`

Menyimpan satu pembayaran utang atau penerimaan piutang.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID pembayaran/pelunasan |
| `user_id` | ULID / FK | Tidak | index | pemilik |
| `obligation_id` | ULID / FK | Tidak | index `(obligation_id, settled_on)` | utang/piutang yang dilunasi |
| `account_id` | ULID / FK | Tidak | | akun yang membayar/menerima |
| `transaction_id` | ULID / FK | Tidak | unique | transaksi income/expense yang dibuat oleh pelunasan |
| `amount` | bigint | Tidak | harus `> 0` | nominal pembayaran |
| `settled_on` | date | Tidak | | tanggal pelunasan |
| `note` | varchar(500) | Ya | | catatan |
| `idempotency_key` | varchar(64) | Ya | unique per user | cegah dobel klik/pengiriman ulang |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

| Dari | Ke | Jenis | Penjelasan |
|---|---|---|---|
| `obligations` | `obligation_settlements` | `1:N` | satu utang/piutang boleh dibayar berkali-kali |
| `financial_accounts` | `obligation_settlements` | `1:N` | satu akun digunakan banyak pelunasan |
| `transactions` | `obligation_settlements` | `1:1` | setiap pelunasan menghasilkan satu transaksi finansial |
| `users` | `obligation_settlements` | `1:N` | pengguna memiliki banyak pelunasan |

### Alur hubungan

```text
Utang Rp3.000.000
→ Pembayaran Rp500.000
  → Transaksi pengeluaran Rp500.000 dari BCA
  → Sisa utang menjadi Rp2.500.000
```

Untuk piutang, transaksi yang terkait adalah pemasukan ke akun pilihan.

---

# 9. Tabel reminder dan audit

## 9.1 `manual_reminders`

Menyimpan pengingat yang dibuat pengguna sendiri.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID reminder |
| `user_id` | ULID / FK | Tidak | index `(user_id, status, due_on)` | pemilik |
| `title` | varchar(160) | Tidak | | judul pengingat |
| `due_on` | date | Ya | | tanggal target/jatuh tempo |
| `note` | varchar(500) | Ya | | keterangan |
| `status` | enum | Tidak | `active`, `dismissed`, `done` | status reminder |
| `created_at`, `updated_at` | timestamp | Tidak | | audit waktu |

### Relasi

```text
users 1 ─── N manual_reminders
```

Reminder sistem—seperti budget hampir habis atau investasi belum dinilai—**tidak disimpan pada tabel ini**. Reminder sistem dihitung dari data sumber agar hilang otomatis saat masalah diselesaikan.

---

## 9.2 `export_audits`

Menyimpan catatan bahwa pengguna mengunduh sebuah laporan.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID riwayat ekspor |
| `user_id` | ULID / FK | Tidak | index `(user_id, generated_at DESC)` | pengguna yang mengunduh |
| `report_type` | enum | Tidak | daftar jenis laporan | laporan yang diunduh |
| `format` | enum | Tidak | `pdf`, `xlsx` | format file |
| `filters_json` | jsonb | Tidak | | filter yang dipakai saat ekspor |
| `row_count` | integer | Tidak | `>= 0` | jumlah baris detail yang diekspor |
| `file_name` | varchar(255) | Tidak | | nama file unduhan |
| `generated_at` | timestamp | Tidak | | waktu file dibuat |

### Relasi

```text
users 1 ─── N export_audits
```

Tabel ini menyimpan riwayat, bukan file PDF/XLSX-nya. File langsung diunduh pengguna dan tidak disimpan permanen pada versi pertama.

---

## 9.3 `audit_events`

Menyimpan jejak perubahan penting agar masalah finansial dapat ditelusuri.

| Kolom | Tipe | Boleh kosong? | Aturan / Index | Arti |
|---|---|---:|---|---|
| `id` | ULID | Tidak | PK | ID audit |
| `user_id` | ULID / FK | Tidak | index | pemilik data yang terdampak |
| `actor_id` | ULID / FK | Tidak | index | pengguna yang melakukan aksi |
| `action` | varchar(80) | Tidak | index | contoh: `transaction.voided` |
| `auditable_type` | varchar(120) | Tidak | index gabungan | jenis data yang berubah |
| `auditable_id` | ULID | Tidak | index gabungan | ID data yang berubah |
| `old_values` | jsonb | Ya | | nilai sebelum perubahan yang aman dicatat |
| `new_values` | jsonb | Ya | | nilai setelah perubahan yang aman dicatat |
| `request_id` | varchar(64) | Ya | index | penghubung ke log teknis |
| `created_at` | timestamp | Tidak | | waktu aksi |

### Relasi

| Dari | Ke | Jenis | Penjelasan |
|---|---|---|---|
| `users` | `audit_events` sebagai pemilik data | `1:N` | satu pengguna punya banyak riwayat audit |
| `users` | `audit_events` sebagai pelaku | `1:N` | satu pengguna melakukan banyak aksi |
| `audit_events` | data finansial | polymorphic | satu audit menunjuk satu objek; bukan relasi many-to-many |

`auditable_type` + `auditable_id` berarti audit bisa menunjuk transaksi, akun, budget, investasi, dan lain-lain tanpa membuat banyak tabel audit berbeda.

---

# 10. Ringkasan seluruh relasi satu per satu

| Tabel induk | Tabel anak | Kardinalitas | FK berada di | Catatan |
|---|---|---|---|---|
| `users` | `user_preferences` | `1:1` | `user_preferences.user_id` | user_id unik |
| `users` | `financial_accounts` | `1:N` | `financial_accounts.user_id` | akun pemilik |
| `users` | `categories` | `1:N` | `categories.user_id` | kategori pribadi |
| `users` | `transactions` | `1:N` | `transactions.user_id` | semua transaksi pemilik |
| `users` | `budgets` | `1:N` | `budgets.user_id` | budget milik pengguna |
| `users` | `savings_goals` | `1:N` | `savings_goals.user_id` | target pengguna |
| `users` | `savings_contributions` | `1:N` | `savings_contributions.user_id` | setoran pengguna |
| `users` | `investment_holdings` | `1:N` | `investment_holdings.user_id` | investasi pengguna |
| `users` | `investment_valuations` | `1:N` | `investment_valuations.user_id` | histori nilai pengguna |
| `users` | `assets` | `1:N` | `assets.user_id` | aset pengguna |
| `users` | `obligations` | `1:N` | `obligations.user_id` | utang/piutang pengguna |
| `users` | `obligation_settlements` | `1:N` | `obligation_settlements.user_id` | pelunasan pengguna |
| `users` | `manual_reminders` | `1:N` | `manual_reminders.user_id` | reminder manual |
| `users` | `export_audits` | `1:N` | `export_audits.user_id` | histori ekspor |
| `users` | `audit_events` | `1:N` | `audit_events.user_id`, `actor_id` | audit pemilik/pelaku |
| `financial_accounts` | `transactions` (sumber) | `1:N` | `transactions.account_id` | income, expense, transfer keluar |
| `financial_accounts` | `transactions` (tujuan) | `1:N` | `transactions.destination_account_id` | transfer masuk |
| `financial_accounts` | `obligation_settlements` | `1:N` | `obligation_settlements.account_id` | bayar/terima pelunasan |
| `financial_accounts` | `savings_contributions` | `1:N` opsional | `savings_contributions.account_id` | hanya konteks alokasi |
| `categories` | `transactions` | `1:N` | `transactions.category_id` | tidak untuk transfer |
| `categories` | `budgets` | `1:N` | `budgets.category_id` | hanya kategori expense |
| `savings_goals` | `savings_contributions` | `1:N` | `savings_contributions.savings_goal_id` | riwayat progres |
| `investment_holdings` | `investment_valuations` | `1:N` | `investment_valuations.investment_holding_id` | histori nilai |
| `obligations` | `obligation_settlements` | `1:N` | `obligation_settlements.obligation_id` | pelunasan bertahap |
| `transactions` | `obligation_settlements` | `0..1:1` | `obligation_settlements.transaction_id` | satu pelunasan ↔ satu transaksi |

---

# 11. Aturan penghapusan dan foreign key

| Relasi | Saat data induk dihapus | Keputusan |
|---|---|---|
| User → data finansial | jangan cascade langsung | proses hapus akun terkontrol/anonymization |
| Akun → transaksi | `RESTRICT` | akun bersejarah hanya boleh diarsipkan |
| Kategori → transaksi/budget | `RESTRICT` | kategori dipakai hanya boleh diarsipkan |
| Target → setoran target | `RESTRICT` | target bersejarah diarsipkan |
| Investasi → valuasi | `RESTRICT` | investasi diarsipkan, histori nilai tetap ada |
| Utang/piutang → pelunasan | `RESTRICT` | tidak boleh hilang bila ada pembayaran |
| Transaksi → pelunasan | `RESTRICT` | transaksi pelunasan tidak boleh dihapus sembarangan |
| User → preferences | `CASCADE` boleh | pengaturan tanpa nilai historis |
| User → manual reminder | `CASCADE` hanya bila kebijakan hapus akun menyetujui | reminder bukan catatan keuangan |

**Prinsip umum:** data yang memengaruhi perhitungan finansial atau audit lebih aman diarsipkan/dibatalkan daripada dihapus permanen.

---

# 12. Constraint database yang wajib ada

Selain validasi form Laravel, database harus ikut menjaga aturan penting:

1. `transactions.amount > 0`.
2. `budgets.amount > 0`.
3. `savings_goals.target_amount > 0`.
4. `savings_contributions.amount > 0`.
5. `investment_valuations.value >= 0`.
6. `assets.current_value >= 0`.
7. `obligations.original_amount > 0`.
8. `0 <= obligations.outstanding_amount <= obligations.original_amount`.
9. `obligation_settlements.amount > 0`.
10. Transfer memiliki `destination_account_id` dan akun asal tidak sama dengan akun tujuan.
11. Hanya ada satu budget untuk satu user + kategori + bulan.
12. Hanya ada satu valuasi untuk satu investasi pada satu tanggal.
13. Satu pelunasan hanya boleh terhubung ke satu transaksi, dan satu transaksi pelunasan hanya boleh terhubung ke satu pelunasan.
14. Nama akun aktif tidak boleh duplikat untuk pengguna yang sama.
15. Nama kategori dengan tipe sama tidak boleh duplikat untuk pengguna yang sama.

Aturan yang membutuhkan pemeriksaan lintas tabel—misalnya kategori harus milik user yang sama dengan transaksi—dicek oleh aplikasi Laravel di dalam action/domain service serta policy.

---

# 13. Contoh data relasi nyata

```text
User: Andi (users.id = U1)

Akun:
- BCA (financial_accounts.id = A1, user_id = U1)
- GoPay (financial_accounts.id = A2, user_id = U1)

Kategori:
- Gaji (categories.id = C1, user_id = U1, type = income)
- Makan (categories.id = C2, user_id = U1, type = expense)

Transaksi:
- Gaji Rp5.000.000 ke BCA
  user_id = U1, account_id = A1, category_id = C1, type = income

- Makan Rp25.000 dari GoPay
  user_id = U1, account_id = A2, category_id = C2, type = expense

- Transfer Rp100.000 BCA ke GoPay
  user_id = U1, account_id = A1, destination_account_id = A2, type = transfer

Budget:
- Budget Makan Agustus Rp1.500.000
  user_id = U1, category_id = C2
```

Dari contoh ini, sistem bisa menjawab:

- saldo BCA berdasarkan transaksi yang memakai `account_id = A1`;
- saldo GoPay berdasarkan transaksi keluar dari A2 dan transfer masuk ke A2;
- total Makan berdasarkan transaksi dengan `category_id = C2`;
- penggunaan budget Makan berdasarkan transaksi C2 dalam bulan yang sama;
- semua data hanya terbaca oleh user U1.

---

## Kesimpulan

Struktur ini sengaja memakai **one-to-one dan one-to-many** hampir di seluruh bagian karena lebih mudah dijaga, dilacak, dan dikembangkan untuk aplikasi keuangan pribadi.

Tidak ada many-to-many yang dipaksakan. Jika suatu hubungan memiliki data sendiri—misalnya pembayaran utang memiliki nominal dan tanggal—hubungan tersebut dibuat sebagai tabel nyata (`obligation_settlements`), bukan sekadar tabel penghubung kosong.
