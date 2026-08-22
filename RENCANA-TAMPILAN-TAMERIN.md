# Rencana Tampilan Tamerin

## 1. Tujuan dokumen

Dokumen ini menjadi acuan isi dan struktur tampilan Tamerin. Dokumen ini menjelaskan menu, halaman, kartu ringkasan, tabel, form, filter, aksi, serta kondisi kosong yang akan dibuat. Implementasi visual tetap dilakukan bertahap mengikuti roadmap pengembangan.

Prinsip utamanya:

- informasi paling penting tampil lebih dahulu;
- angka keuangan mudah dipindai dan selalu memakai format Rupiah;
- tindakan berisiko seperti archive dan void selalu memakai konfirmasi;
- setiap halaman mempunyai loading, empty, error, dan success state;
- desktop dan mobile menyediakan fungsi yang sama;
- tampilan sederhana terlebih dahulu, lalu dipoles tanpa mengubah alur bisnis;
- setiap data hanya menampilkan milik pengguna yang sedang login.

---

## 2. Struktur navigasi utama

### 2.1 Sidebar desktop

```text
Tamerin

Ringkasan
├── Dashboard

Keuangan
├── Transaksi
├── Akun Keuangan
├── Kategori
└── Budget

Kekayaan
├── Target Tabungan
├── Investasi
├── Aset
└── Utang & Piutang

Lainnya
├── Pengingat
└── Laporan

Akun
└── Pengaturan
    ├── Profil
    ├── Kata Sandi
    └── Preferensi
```

Riwayat ekspor dan aktivitas audit ditempatkan di dalam menu Laporan agar sidebar tidak terlalu penuh.

### 2.2 Navigasi mobile

Navigasi bawah mobile berisi lima akses utama:

1. Dashboard;
2. Transaksi;
3. tombol utama `+ Transaksi`;
4. Budget;
5. menu `Lainnya`.

Menu `Lainnya` membuka panel yang berisi Akun Keuangan, Kategori, Target Tabungan, Investasi, Aset, Utang & Piutang, Pengingat, Laporan, dan Pengaturan.

### 2.3 Header aplikasi

Header authenticated berisi:

- judul halaman dan breadcrumb;
- pemilih periode jika halaman mendukung periode;
- tombol aksi utama sesuai halaman;
- ikon pengingat dengan jumlah pengingat aktif;
- menu pengguna berisi Profil, Preferensi, dan Keluar.

---

## 3. Pola tampilan global

### 3.1 Format data

| Data | Format tampilan |
|---|---|
| Nominal | `Rp1.250.000`, tanpa angka desimal |
| Tanggal | `20 Agustus 2026` |
| Tanggal tabel ringkas | `20 Agu 2026` |
| Persentase | maksimal satu angka desimal, contoh `72,5%` |
| Unit investasi | maksimal delapan angka desimal sesuai data |
| Nilai positif | hijau, tetap disertai label agar tidak hanya bergantung pada warna |
| Nilai negatif | merah, tetap disertai label atau tanda minus |
| Data voided/archived | redup dan memiliki badge status yang jelas |

### 3.2 Komponen bersama

- `PageHeader`: judul, deskripsi, breadcrumb, dan aksi utama.
- `SummaryCard`: label, nilai, ikon, dan pembanding periode.
- `MoneyText`: format nominal konsisten.
- `StatusBadge`: status active, archived, posted, voided, open, settled, completed, done, dan dismissed.
- `DataTable`: tabel desktop dengan versi kartu/list pada mobile.
- `FilterBar`: filter, pencarian, reset filter, dan indikator filter aktif.
- `EmptyState`: penjelasan singkat dan tombol membuat data pertama.
- `Skeleton`: placeholder saat deferred props atau halaman sedang dimuat.
- `Pagination`: navigasi halaman dan informasi jumlah data.
- `ConfirmationDialog`: archive, void, dismiss, dan tindakan penting lain.
- `FlashMessage`: pesan berhasil atau gagal setelah submit.
- `MoneyInput`: input nominal dengan preview format Rupiah.
- `DateInput`, `SelectInput`, `Textarea`, dan field error yang konsisten.

### 3.3 Keadaan yang wajib tersedia

Setiap halaman data harus mempunyai:

- loading state;
- empty state untuk pengguna baru;
- no-result state ketika filter tidak menemukan data;
- validation error di dekat field;
- page-level error bila data gagal dimuat;
- success feedback setelah aksi;
- disabled/loading state pada tombol submit untuk mencegah klik ganda.

---

## 4. Halaman publik dan autentikasi

### 4.1 Beranda publik

Isi halaman:

- nama dan penjelasan singkat Tamerin;
- ringkasan manfaat: mencatat transaksi, mengendalikan budget, dan memantau kekayaan;
- tombol `Masuk` dan `Buat akun`;
- jika sudah login, tombol berubah menjadi `Buka Dashboard`.

Versi awal tidak memerlukan landing page pemasaran yang panjang.

### 4.2 Masuk

- email;
- kata sandi;
- checkbox `Ingat saya`;
- tombol `Masuk`;
- tautan `Lupa kata sandi`;
- tautan menuju registrasi;
- pesan jika credential salah atau percobaan terlalu banyak.

### 4.3 Registrasi

- nama;
- email;
- kata sandi;
- konfirmasi kata sandi;
- tombol `Buat akun`;
- tautan menuju login.

Setelah berhasil, pengguna langsung login dan preferences default dibuat otomatis.

### 4.4 Lupa dan reset kata sandi

Halaman lupa kata sandi berisi email dan tombol kirim tautan. Halaman reset berisi email read-only, kata sandi baru, konfirmasi, dan tombol simpan.

---

## 5. Dashboard

Route rencana: `/dashboard`.

Dashboard memakai periode bulanan sebagai default. Pengguna dapat berpindah ke bulan sebelumnya/berikutnya atau memilih bulan tertentu.

### 5.1 Header dashboard

- sapaan singkat menggunakan nama pengguna;
- pemilih periode;
- tombol utama `Tambah transaksi`;
- tombol sekunder `Lihat laporan`.

### 5.2 Kartu ringkasan utama

Empat kartu pada baris pertama:

| Kartu | Isi |
|---|---|
| Total Saldo | Total saldo seluruh akun aktif pada hari ini |
| Pemasukan | Total transaksi income posted pada periode terpilih |
| Pengeluaran | Total transaksi expense posted pada periode terpilih |
| Arus Kas Bersih | Pemasukan dikurangi pengeluaran; transfer tidak dihitung |

Setiap kartu periode menampilkan perbandingan dengan periode sebelumnya jika datanya tersedia. Perbandingan tidak ditampilkan sebagai klaim baik/buruk tanpa konteks; misalnya kenaikan pengeluaran hanya ditulis `12% dari bulan lalu`.

### 5.3 Kartu kekayaan bersih

Kartu lebar menampilkan:

- nilai kekayaan bersih;
- saldo akun;
- nilai investasi terbaru;
- nilai aset;
- piutang tersisa;
- utang tersisa sebagai pengurang;
- tanggal pembaruan data terakhir.

Rumus tampilannya:

```text
Saldo akun + investasi + aset + piutang - utang
```

### 5.4 Grafik arus kas

- grafik pemasukan dan pengeluaran per hari atau per minggu;
- toggle `Harian` dan `Mingguan` bila periode satu bulan;
- tooltip berisi tanggal, pemasukan, pengeluaran, dan selisih;
- transfer dan transaksi voided tidak masuk grafik;
- empty state jika belum ada transaksi pada periode tersebut.

### 5.5 Ringkasan akun

Menampilkan maksimal lima akun aktif dengan:

- nama dan tipe akun;
- saldo saat ini;
- kontribusi akun terhadap total saldo;
- tautan `Lihat semua akun`.

### 5.6 Progress budget

Menampilkan maksimal lima budget bulan terpilih:

- nama kategori;
- nominal terpakai dan batas budget;
- sisa budget;
- progress bar;
- status `Aman`, `Mendekati batas`, atau `Melebihi budget`.

Urutan prioritas: budget terlewati, hampir habis, lalu budget lainnya.

### 5.7 Transaksi terbaru

Menampilkan lima sampai sepuluh transaksi terbaru:

- tanggal;
- tipe;
- kategori atau label transfer;
- akun;
- catatan singkat;
- nominal;
- status.

Baris dapat dibuka menuju detail transaksi.

### 5.8 Pengingat sistem

Pengingat sistem dihitung dari data dan tidak disimpan sebagai reminder manual. Contohnya:

- budget mencapai minimal 80%;
- budget sudah terlewati;
- utang atau piutang mendekati jatuh tempo;
- target tabungan mendekati target tanggal tetapi progres tertinggal;
- investasi belum diperbarui nilainya dalam periode yang ditentukan.

Setiap item memiliki tautan menuju sumber masalah.

### 5.9 Ringkasan target dan investasi

Bagian sekunder berisi:

- satu target tabungan dengan deadline terdekat;
- satu investasi yang paling lama belum dinilai;
- tombol menuju daftar lengkap.

Bagian ini dapat dikirim sebagai deferred props agar dashboard utama tampil lebih cepat.

### 5.10 Empty state pengguna baru

Dashboard pengguna tanpa data menampilkan checklist onboarding:

1. buat akun keuangan;
2. periksa kategori awal;
3. catat transaksi pertama;
4. buat budget pertama.

---

## 6. Transaksi

### 6.1 Daftar transaksi

Route rencana: `/transactions`.

Header:

- judul `Transaksi`;
- tombol `Tambah transaksi`;
- pilihan periode.

Kartu ringkas:

- total pemasukan hasil filter;
- total pengeluaran hasil filter;
- arus kas bersih hasil filter;
- jumlah transaksi.

Filter:

- rentang tanggal;
- tipe: pemasukan, pengeluaran, transfer;
- akun;
- kategori;
- status: posted atau voided;
- pencarian catatan;
- tombol reset.

Kolom tabel desktop:

| Kolom | Isi |
|---|---|
| Tanggal | tanggal transaksi |
| Tipe | badge income, expense, atau transfer |
| Keterangan | kategori atau akun asal → akun tujuan |
| Akun | akun utama transaksi |
| Catatan | dipotong bila terlalu panjang |
| Nominal | positif/negatif sesuai tipe; transfer netral |
| Status | posted atau voided |
| Aksi | lihat detail |

### 6.2 Tambah transaksi

Route rencana: `/transactions/create`.

Form dimulai dengan pilihan tipe transaksi.

Field bersama:

- tipe;
- nominal;
- tanggal;
- catatan opsional maksimal 500 karakter.

Field pemasukan:

- akun tujuan uang masuk;
- kategori pemasukan.

Field pengeluaran:

- akun sumber uang keluar;
- kategori pengeluaran.

Field transfer:

- akun asal;
- akun tujuan;
- tidak menampilkan kategori.

Form menampilkan ringkasan sebelum submit: tipe, nominal, akun, kategori/tujuan, dan tanggal.

### 6.3 Detail transaksi

Route rencana: `/transactions/{transaction}`.

Isi:

- nominal besar dan badge tipe/status;
- tanggal transaksi;
- akun asal/utama;
- akun tujuan untuk transfer;
- kategori untuk income/expense;
- catatan lengkap;
- waktu dibuat;
- informasi void jika dibatalkan;
- hubungan ke pelunasan utang/piutang jika ada.

Transaksi posted memiliki tombol `Batalkan transaksi`. Dialog void wajib meminta alasan. Tidak ada tombol edit atau hard delete.

---

## 7. Akun Keuangan

### 7.1 Daftar akun

Route rencana: `/financial-accounts`.

Kartu ringkas:

- total saldo seluruh akun aktif;
- jumlah akun aktif;
- total saldo per jenis: cash, bank, dan e-wallet.

Tampilan utama dapat berupa grid kartu. Setiap kartu akun berisi:

- nama akun;
- tipe;
- saldo saat ini;
- saldo awal;
- tanggal saldo awal;
- status;
- tombol edit dan archive.

Tersedia toggle `Aktif` dan `Diarsipkan`. Akun archived tetap dapat dibuka dari riwayat, tetapi tidak tersedia pada form transaksi baru.

### 7.2 Tambah/edit akun

Route rencana:

- `/financial-accounts/create`;
- `/financial-accounts/{account}/edit`.

Field:

- nama akun;
- tipe: Tunai, Bank, atau E-Wallet;
- saldo awal;
- tanggal saldo awal.

Edit tidak mengubah histori transaksi. Archive memakai dialog konfirmasi dan menjelaskan bahwa akun tidak dapat digunakan untuk transaksi baru.

---

## 8. Kategori

### 8.1 Daftar kategori

Route rencana: `/categories`.

Isi halaman:

- tab `Pengeluaran` dan `Pemasukan`;
- pencarian nama;
- toggle kategori aktif/archived;
- daftar kategori berupa ikon, warna, nama, tipe, dan penanda kategori sistem;
- tombol tambah kategori;
- aksi edit dan archive.

Kategori sistem diberi badge `Bawaan`. Kategori archived masih muncul pada histori lama, tetapi tidak tersedia pada transaksi atau budget baru.

### 8.2 Tambah/edit kategori

Field:

- nama;
- tipe pemasukan atau pengeluaran;
- pilihan ikon;
- pilihan token warna.

Form tidak menerima class CSS atau nilai warna bebas. Archive memakai dialog konfirmasi.

---

## 9. Budget

Route rencana: `/budgets`.

### 9.1 Header dan kartu ringkasan

- pemilih bulan;
- tombol `Buat budget`;
- total budget;
- total terpakai;
- total sisa;
- persentase pemakaian keseluruhan.

### 9.2 Daftar budget kategori

Setiap item menampilkan:

- ikon, warna, dan nama kategori pengeluaran;
- nominal budget;
- pengeluaran posted pada bulan tersebut;
- sisa atau kelebihan;
- progress bar;
- persentase;
- status visual.

Status:

| Kondisi | Label |
|---|---|
| kurang dari 80% | Aman |
| 80% sampai 99,9% | Mendekati batas |
| 100% | Batas tercapai |
| lebih dari 100% | Melebihi budget |

### 9.3 Buat/edit budget

Form dapat memakai modal dari halaman index:

- bulan;
- kategori pengeluaran aktif;
- nominal budget.

Kategori yang sudah memiliki budget pada bulan itu tidak dapat dipilih lagi. Penghapusan budget belum ditampilkan sampai keputusan produk tentang penghapusan data perencanaan disetujui.

---

## 10. Target Tabungan

### 10.1 Daftar target

Route rencana: `/savings-goals`.

Kartu ringkasan:

- jumlah target aktif;
- total target nominal;
- total kontribusi aktif;
- target yang sudah selesai.

Filter: status active, completed, archived dan urutan target tanggal terdekat.

Setiap kartu target berisi:

- nama;
- nominal terkumpul dari contribution active;
- target nominal;
- persentase dan progress bar;
- target tanggal jika ada;
- perkiraan sisa nominal;
- badge status;
- tombol lihat detail.

### 10.2 Tambah/edit target

Field:

- nama target;
- target nominal;
- target tanggal opsional.

Archive memakai konfirmasi dan tidak menghapus kontribusi.

### 10.3 Detail target

Route rencana: `/savings-goals/{goal}`.

Bagian atas:

- nominal terkumpul;
- target;
- sisa;
- persentase;
- target tanggal;
- status.

Bagian kontribusi:

- form tambah setoran berisi nominal, tanggal, akun opsional, dan catatan;
- informasi bahwa setoran target tidak otomatis mengurangi saldo akun;
- daftar contribution berisi tanggal, akun konteks, catatan, nominal, dan status;
- aksi void contribution dengan alasan.

Jika uang benar-benar dipindahkan ke akun tabungan, UI mengarahkan pengguna membuat transaksi transfer terpisah.

---

## 11. Investasi

### 11.1 Daftar investasi

Route rencana: `/investments`.

Kartu ringkasan:

- total nilai investasi terbaru;
- total modal perolehan;
- estimasi untung/rugi;
- jumlah investasi yang perlu diperbarui nilainya.

Filter:

- jenis instrumen;
- status active/archived;
- kondisi valuasi: terbaru, perlu diperbarui, belum dinilai.

Setiap item menampilkan:

- nama dan jenis instrumen;
- unit bila tersedia;
- modal perolehan;
- nilai terbaru atau `Belum dinilai`;
- untung/rugi nominal dan persentase jika dapat dihitung;
- tanggal valuasi terakhir;
- status.

### 11.2 Tambah/edit investasi

Field:

- nama;
- jenis: Saham, Reksa Dana, Crypto, Obligasi, Emas, atau Lainnya;
- modal/nilai perolehan;
- tanggal perolehan;
- jumlah unit opsional.

Archive tidak menghapus histori valuasi.

### 11.3 Detail investasi

Route rencana: `/investments/{investment}`.

Isi:

- kartu modal, nilai terbaru, dan untung/rugi;
- informasi instrumen dan unit;
- grafik histori nilai;
- tabel valuasi berdasarkan tanggal;
- tombol `Perbarui nilai`;
- aksi edit dan archive.

Form valuasi berisi tanggal nilai, nilai terbaru, dan catatan sumber. Valuasi yang salah dibatalkan melalui void, bukan dihapus.

---

## 12. Aset

### 12.1 Daftar aset

Route rencana: `/assets`.

Kartu ringkasan:

- total nilai aset aktif;
- total nilai perolehan yang tersedia;
- jumlah aset aktif;
- aset yang paling lama belum diperbarui nilainya.

Filter berdasarkan jenis dan status. Tampilan kartu/list berisi:

- nama;
- jenis aset;
- nilai saat ini;
- tanggal penilaian;
- nilai perolehan bila ada;
- selisih estimasi bila nilai perolehan tersedia;
- status.

### 12.2 Tambah/edit/detail aset

Field:

- nama;
- jenis: Kendaraan, Elektronik, Properti, Perhiasan, atau Lainnya;
- tanggal perolehan opsional;
- nilai perolehan opsional;
- nilai saat ini;
- tanggal penilaian;
- catatan.

Halaman detail menampilkan seluruh data dan aksi edit/archive. Karena versi pertama tidak mempunyai histori valuasi aset, perubahan nilai mengganti estimasi terakhir dan UI harus menjelaskan hal ini.

---

## 13. Utang & Piutang

### 13.1 Daftar kewajiban

Route rencana: `/obligations`.

Kartu ringkasan:

- total sisa utang;
- total sisa piutang;
- jumlah yang jatuh tempo dalam tujuh hari;
- jumlah yang sudah lewat jatuh tempo.

Filter:

- tab Utang dan Piutang;
- status open, settled, archived;
- jatuh tempo;
- pencarian nama pihak terkait.

Setiap item menampilkan:

- nama pihak terkait;
- jenis utang/piutang;
- nominal awal;
- sisa outstanding;
- progress pelunasan;
- tanggal mulai dan jatuh tempo;
- badge status dan overdue.

### 13.2 Tambah/edit kewajiban

Field:

- jenis debt atau receivable;
- nama pihak terkait;
- nominal awal;
- tanggal mulai;
- tanggal jatuh tempo opsional;
- catatan.

### 13.3 Detail dan pelunasan

Route rencana: `/obligations/{obligation}`.

Bagian atas:

- nominal awal;
- total sudah dilunasi;
- sisa outstanding;
- progress;
- status dan jatuh tempo;
- informasi pihak terkait.

Riwayat pelunasan menampilkan tanggal, akun, transaksi terkait, catatan, dan nominal.

Form `Catat pelunasan` berisi:

- nominal;
- akun pembayaran/penerimaan;
- tanggal;
- catatan.

Untuk utang, pelunasan membuat transaksi expense. Untuk piutang, pelunasan membuat transaksi income. Sebelum submit, ringkasan menjelaskan dampak terhadap saldo akun dan sisa outstanding.

Tidak ada tombol membatalkan settlement sampai aturan reversal disepakati.

---

## 14. Pengingat

Route rencana: `/reminders`.

### 14.1 Ringkasan

- jumlah reminder aktif;
- jatuh tempo hari ini;
- terlambat;
- selesai dalam periode berjalan.

### 14.2 Daftar reminder manual

Filter:

- status active, done, dismissed;
- jatuh tempo;
- pencarian judul.

Daftar dikelompokkan menjadi:

- Terlambat;
- Hari ini;
- Mendatang;
- Tanpa tanggal;
- Selesai/diabaikan.

Setiap reminder berisi judul, tanggal, catatan singkat, status, tombol selesai, abaikan, dan edit.

### 14.3 Tambah/edit reminder

Form modal:

- judul;
- tanggal opsional;
- catatan opsional.

Reminder sistem tidak diedit dari halaman ini. Sistem reminder tampil pada tab terpisah dan setiap item mengarah ke budget, obligation, savings goal, atau investasi terkait.

---

## 15. Laporan

Route rencana: `/reports`.

### 15.1 Filter laporan

- jenis laporan;
- rentang tanggal atau periode bulan;
- akun opsional;
- kategori opsional;
- status bila relevan;
- tombol `Terapkan` dan `Reset`;
- tombol `Ekspor`.

Jenis laporan awal:

1. Transaksi;
2. Arus Kas;
3. Budget;
4. Tabungan;
5. Investasi;
6. Kekayaan Bersih;
7. Utang & Piutang.

### 15.2 Isi setiap laporan

| Laporan | Kartu/grafik | Detail |
|---|---|---|
| Transaksi | jumlah transaksi, income, expense, transfer | tabel transaksi terfilter |
| Arus Kas | income, expense, net cash flow | grafik tren dan rincian per kategori |
| Budget | total budget, terpakai, sisa, jumlah over budget | progress per kategori dan bulan |
| Tabungan | total target, terkumpul, sisa | progres target dan contribution |
| Investasi | modal, nilai terbaru, untung/rugi | holding dan valuasi terakhir |
| Kekayaan Bersih | total net worth dan komponen pembentuk | akun, investasi, aset, piutang, utang |
| Utang & Piutang | total awal, outstanding, settled | rincian per pihak dan pelunasan |

Data detail memakai pagination. Perubahan filter memperbarui URL agar laporan dapat dibuka ulang dengan filter yang sama.

### 15.3 Ekspor laporan

Dialog ekspor menampilkan:

- jenis laporan;
- periode dan filter aktif;
- pilihan PDF atau XLSX;
- perkiraan isi file;
- tombol `Buat dan unduh`.

File langsung diunduh dan tidak disimpan permanen pada MVP.

### 15.4 Riwayat ekspor

Route rencana: `/reports/exports`.

Tabel read-only:

- waktu ekspor;
- jenis laporan;
- format;
- filter ringkas;
- jumlah baris;
- nama file.

Riwayat ini adalah audit bahwa ekspor pernah dibuat, bukan tempat mengunduh ulang file lama.

### 15.5 Riwayat aktivitas

Route rencana: `/reports/activity` jika fitur ini disetujui untuk ditampilkan kepada pengguna.

Tabel read-only:

- waktu;
- aksi;
- jenis data;
- identitas data;
- ringkasan perubahan yang aman.

Tidak ada aksi edit/delete. Password, token, dan data sensitif tidak pernah ditampilkan.

---

## 16. Pengaturan

### 16.1 Profil

Route: `/settings/profile`.

- nama;
- email;
- tombol simpan;
- informasi status verifikasi email jika kelak diwajibkan.

Penghapusan akun belum ditampilkan sampai aturan ekspor, anonimisasi, dan retensi disepakati.

### 16.2 Kata sandi

Route: `/settings/password`.

- kata sandi saat ini;
- kata sandi baru;
- konfirmasi kata sandi baru;
- indikator aturan minimum;
- tombol perbarui.

### 16.3 Preferensi

Route: `/settings/preferences`.

- mode tema: Sistem, Terang, Gelap;
- preset: Ocean, Forest, Violet, Custom;
- preview tema;
- warna primary, secondary, dan accent ketika preset Custom dipilih;
- timezone;
- tombol simpan dan reset ke default.

Perubahan tema harus terlihat pada preview sebelum disimpan dan tetap berlaku setelah reload.

---

## 17. Perilaku responsive

### Desktop

- sidebar tetap;
- tabel lengkap;
- filter horizontal atau panel samping;
- dashboard memakai grid 12 kolom;
- form utama maksimal dua kolom bila field saling berhubungan.

### Tablet

- sidebar dapat diciutkan;
- kartu ringkasan dua kolom;
- tabel dapat menggulir horizontal hanya bila benar-benar diperlukan.

### Mobile

- navigasi bawah dan panel menu lainnya;
- kartu ringkasan satu atau dua kolom sesuai lebar;
- tabel berubah menjadi daftar kartu;
- filter dibuka melalui bottom sheet/modal;
- tombol aksi utama mudah dijangkau;
- dialog kompleks berubah menjadi halaman penuh atau bottom sheet;
- nominal dan status tetap terlihat tanpa harus membuka detail.

---

## 18. Prioritas implementasi tampilan

### Tahap A — Shell aplikasi

- AppLayout;
- sidebar desktop;
- navigasi mobile;
- header dan user menu;
- komponen global;
- theme provider.

### Tahap B — Pencatatan inti

- Akun Keuangan;
- Kategori;
- Transaksi;
- Dashboard dasar.

### Tahap C — Perencanaan

- Budget;
- Target Tabungan;
- Pengingat.

### Tahap D — Kekayaan

- Investasi;
- Aset;
- Utang & Piutang;
- Dashboard net worth lengkap.

### Tahap E — Analisis

- Laporan;
- ekspor;
- riwayat ekspor;
- riwayat aktivitas jika disetujui.

---

## 19. Hal yang sengaja tidak masuk tampilan MVP

- manajemen role atau admin, karena semua pengguna memiliki kemampuan yang sama;
- sinkronisasi rekening bank otomatis;
- multi-currency;
- transaksi berulang otomatis;
- tag many-to-many;
- upload bukti transaksi;
- berbagi akun keuangan dengan pengguna lain;
- hard delete data finansial;
- download ulang file ekspor lama;
- notifikasi push/email untuk reminder sebelum mekanismenya disetujui.

Fitur tersebut tidak boleh muncul sebagai tombol kosong atau menu yang belum berfungsi.

---

## 20. Keputusan produk yang masih diperlukan

1. Apakah email verification wajib sebelum pengguna mengakses fitur finansial?
2. Apakah budget boleh dihapus atau hanya diubah/dinonaktifkan?
3. Bagaimana mekanisme koreksi settlement yang salah: reversal atau perubahan schema?
4. Berapa hari investasi dianggap belum diperbarui untuk system reminder?
5. Apakah audit activity ditampilkan kepada pengguna atau hanya untuk kebutuhan internal?
6. Package apa yang disetujui untuk menghasilkan PDF dan XLSX?
7. Apakah reminder akan tetap in-app saja atau juga dikirim melalui email/push notification?

---

## 21. Checklist penerimaan tampilan

- [ ] Semua menu mengarah ke halaman yang berfungsi, tanpa placeholder mati.
- [ ] Navigasi aktif sesuai route saat ini.
- [ ] Semua form dapat digunakan dengan keyboard.
- [ ] Label dan error field terbaca jelas.
- [ ] Nominal, tanggal, dan status konsisten di seluruh halaman.
- [ ] Tampilan mobile tidak kehilangan aksi penting.
- [ ] Empty state selalu memberi langkah berikutnya.
- [ ] Tindakan archive dan void selalu meminta konfirmasi.
- [ ] Tidak ada tombol hard delete untuk data finansial.
- [ ] Filter tersimpan di URL pada halaman daftar/laporan yang relevan.
- [ ] Loading state tidak menyebabkan layout meloncat secara berlebihan.
- [ ] Tema system/light/dark dan preset tetap konsisten setelah reload.
- [ ] Kontras, focus state, dan ukuran target sentuh memenuhi aksesibilitas dasar.
- [ ] Tidak ada data pengguna lain yang muncul pada kartu, opsi form, tabel, atau laporan.

---

## 22. Ringkasan halaman

| Menu | Halaman utama | Halaman/form tambahan |
|---|---|---|
| Dashboard | ringkasan keuangan dan reminder | tidak ada |
| Transaksi | daftar dan filter | tambah, detail, void dialog |
| Akun Keuangan | daftar akun dan saldo | tambah, edit, archive dialog |
| Kategori | tab income/expense | tambah, edit, archive dialog |
| Budget | daftar per bulan | modal tambah/edit |
| Target Tabungan | daftar target | tambah, edit, detail, contribution, void |
| Investasi | daftar holding | tambah, edit, detail, valuation, void, archive |
| Aset | daftar aset | tambah, edit, detail, archive |
| Utang & Piutang | daftar kewajiban | tambah, edit, detail, settlement, archive |
| Pengingat | reminder manual dan sistem | modal tambah/edit, complete/dismiss |
| Laporan | filter dan hasil laporan | ekspor, riwayat ekspor, aktivitas opsional |
| Pengaturan | profil | kata sandi dan preferensi |

Dokumen ini menjadi acuan isi tampilan. Detail visual seperti font, ukuran pasti, radius, shadow, ikon, dan palet final ditentukan pada fase fondasi UI tanpa mengubah struktur menu dan aturan bisnis di atas.
