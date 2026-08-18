# Laravel Clean Architecture Skill

## Purpose

Skill ini digunakan untuk membantu AI coding agent membangun aplikasi **Laravel 13** dengan struktur yang bersih, mudah dirawat, mudah diuji, dan tidak berlebihan dalam menerapkan pattern.

Fokus utama skill ini:

- menjaga controller tetap tipis;
- memisahkan validasi, business logic, authorization, dan proses background;
- menggunakan fitur bawaan Laravel sebelum menambahkan abstraction tambahan;
- menghindari over-engineering;
- menghasilkan kode yang mudah dibaca dan mudah dikembangkan;
- menjaga konsistensi struktur project.

Skill ini cocok digunakan untuk project Laravel berbasis:

- Laravel 13
- Inertia.js
- React
- Blade
- REST API
- PostgreSQL / MySQL / SQLite

---

# 1. Prinsip Utama

Gunakan alur dasar berikut sebagai default:

```text
Route
  ↓
Middleware
  ↓
Form Request
  ↓
Controller
  ↓
Action
  ↓
Model
  ↓
Database
```

Gunakan komponen tambahan hanya jika memang diperlukan:

```text
Policy
Resource
Job
Event
Listener
Notification
Service
```

Jangan menambahkan layer hanya supaya struktur terlihat kompleks.

**Clean code bukan berarti semakin banyak folder dan abstraction semakin baik.**

Prioritas utama:

1. mudah dibaca;
2. tanggung jawab jelas;
3. mudah diuji;
4. mudah diubah;
5. mengikuti convention Laravel;
6. hindari duplikasi;
7. hindari abstraction yang belum diperlukan.

---

# 2. Route

## Tanggung Jawab

Route hanya bertugas:

- menentukan URL;
- menentukan HTTP method;
- menentukan controller;
- menerapkan middleware;
- grouping route.

## Contoh Benar

```php
Route::middleware('auth')->group(function () {
    Route::resource('investments', InvestmentController::class);
});
```

## Hindari

Jangan menaruh business logic di route.

```php
Route::post('/investments', function (Request $request) {
    // validation
    // calculation
    // database query
    // send email
    // save data
});
```

Jika route closure sudah melakukan pekerjaan selain response sangat sederhana, pindahkan logic ke controller atau class yang sesuai.

---

# 3. Controller

## Prinsip

Controller harus **tipis**.

Controller bertanggung jawab untuk:

1. menerima request;
2. memanggil class yang menangani proses;
3. mengembalikan response.

Controller **bukan** tempat utama untuk business logic.

## Contoh

```php
class InvestmentController extends Controller
{
    public function store(
        StoreInvestmentRequest $request,
        CreateInvestment $action,
    ): RedirectResponse {
        $action->handle(
            $request->validated(),
            $request->user(),
        );

        return to_route('investments.index');
    }
}
```

## Jangan Lakukan

Hindari controller seperti:

```php
public function store(Request $request)
{
    $request->validate([...]);

    $investment = Investment::create([...]);

    $result = $investment->amount * $investment->interest;

    $investment->update([...]);

    Mail::to(...)->send(...);

    Log::info(...);

    return redirect(...);
}
```

Jika controller sudah berisi:

- perhitungan bisnis;
- banyak query;
- transaksi database;
- upload file kompleks;
- pengiriman email;
- logging;
- integrasi API;
- banyak kondisi bisnis;

maka logic tersebut harus dipindahkan.

---

# 4. Form Request

Gunakan **Form Request** untuk validasi request yang bukan sangat trivial.

## Lokasi

```text
app/
└── Http/
    └── Requests/
```

Kelompokkan berdasarkan domain jika jumlahnya mulai banyak.

```text
app/Http/Requests/
├── Investment/
│   ├── StoreInvestmentRequest.php
│   └── UpdateInvestmentRequest.php
└── Asset/
    ├── StoreAssetRequest.php
    └── UpdateAssetRequest.php
```

## Contoh

```php
class StoreInvestmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
        ];
    }
}
```

Controller cukup menggunakan:

```php
$request->validated();
```

## Aturan

Jangan menduplikasi validation rule di controller.

Jika validasi membutuhkan rule kompleks, gunakan:

- custom validation rule;
- Rule object;
- after validation hook;
- Form Request method.

---

# 5. Action

Gunakan **Action** sebagai tempat utama business logic yang mewakili satu tindakan bisnis.

Nama Action harus menggunakan kata kerja yang jelas.

Contoh:

```text
CreateInvestment
UpdateInvestment
DeleteInvestment
ApproveInvestment
RejectInvestment
CalculatePortfolioValue
CreateAsset
ArchiveTransaction
```

## Lokasi

```text
app/
└── Actions/
    ├── Investments/
    │   ├── CreateInvestment.php
    │   ├── UpdateInvestment.php
    │   └── DeleteInvestment.php
    └── Assets/
        ├── CreateAsset.php
        └── UpdateAsset.php
```

## Contoh

```php
namespace App\Actions\Investments;

use App\Models\Investment;
use App\Models\User;

class CreateInvestment
{
    public function handle(array $data, User $user): Investment
    {
        return $user->investments()->create($data);
    }
}
```

## Aturan

Satu Action sebaiknya mewakili **satu use case utama**.

Jangan membuat:

```text
InvestmentService
```

yang kemudian berisi:

```text
create()
update()
delete()
approve()
reject()
export()
email()
calculate()
archive()
```

Jika setiap method merupakan use case independen, lebih baik jadikan Action terpisah.

---

# 6. Service

Jangan otomatis membuat Service untuk setiap model.

Gunakan Service jika logic:

- digunakan oleh beberapa Action;
- mengakses external API;
- menangani algoritma atau proses kompleks;
- tidak cocok dimiliki satu model;
- merupakan kemampuan reusable.

Contoh:

```text
CurrencyConversionService
PaymentGatewayService
PortfolioCalculationService
ExchangeRateService
FileStorageService
```

## Contoh Struktur

```text
app/
└── Services/
    ├── PortfolioCalculationService.php
    └── CurrencyConversionService.php
```

## Prinsip

Action = satu use case.

Service = kemampuan reusable.

---

# 7. Model

Model bertanggung jawab terhadap perilaku yang dekat dengan data/domain model.

Model dapat berisi:

- relationship;
- casts;
- scopes;
- accessor;
- mutator;
- simple domain behavior;
- query behavior yang memang berkaitan langsung dengan model.

## Contoh

```php
class Investment extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'amount',
        'status',
        'started_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'started_at' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
```

## Hindari Fat Model Ekstrem

Model tidak boleh berubah menjadi tempat semua logic aplikasi.

Jika model berisi:

- HTTP request;
- API call;
- notification;
- file upload;
- rendering response;
- orchestration panjang;

pindahkan logic tersebut.

---

# 8. Query Logic

Untuk query sederhana, gunakan langsung Eloquent.

```php
Investment::query()
    ->where('user_id', $user->id)
    ->latest()
    ->paginate();
```

Untuk query yang berulang, gunakan:

- local scope;
- dedicated query class jika benar-benar kompleks.

## Contoh Scope

```php
public function scopeOwnedBy(Builder $query, User $user): Builder
{
    return $query->where('user_id', $user->id);
}
```

Penggunaan:

```php
Investment::ownedBy($user)
    ->active()
    ->latest()
    ->get();
```

Jangan membuat Repository hanya untuk membungkus:

```php
Investment::find($id);
```

---

# 9. Repository Pattern

Repository **bukan default**.

Jangan menggunakan Repository Pattern hanya karena dianggap lebih "clean".

Gunakan repository jika benar-benar ada kebutuhan seperti:

- beberapa data source;
- persistence layer harus dapat diganti;
- domain layer tidak boleh tergantung Eloquent;
- query persistence sangat kompleks;
- aplikasi menggunakan architecture khusus yang membutuhkannya.

Jangan membuat:

```text
InvestmentRepositoryInterface
InvestmentRepository
EloquentInvestmentRepository
```

jika implementasinya hanya:

```php
return Investment::find($id);
```

Itu hanya menambah file tanpa menambah nilai.

---

# 10. Policy

Gunakan **Policy** untuk authorization berbasis model/resource.

Jangan menyebarkan pengecekan ownership seperti:

```php
if ($investment->user_id !== auth()->id()) {
    abort(403);
}
```

ke banyak controller.

## Contoh

```php
class InvestmentPolicy
{
    public function update(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }

    public function delete(User $user, Investment $investment): bool
    {
        return $user->id === $investment->user_id;
    }
}
```

Gunakan authorization Laravel pada controller/request sesuai kebutuhan.

---

# 11. API Resource

Jika aplikasi membuat REST API atau JSON response, gunakan **API Resource**.

## Contoh

```php
class InvestmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'amount' => $this->amount,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
```

Gunakan:

```php
return InvestmentResource::collection(
    Investment::paginate()
);
```

Jangan menduplikasi format JSON secara manual di banyak controller.

---

# 12. Inertia Response

Untuk Laravel + Inertia + React, controller boleh mengatur data yang dikirim ke page.

Contoh:

```php
public function index(Request $request): Response
{
    return Inertia::render('investments/index', [
        'investments' => Investment::query()
            ->whereBelongsTo($request->user())
            ->latest()
            ->paginate(),
    ]);
}
```

Namun jika query menjadi kompleks, pindahkan query ke:

- scope;
- query object;
- Action;
- Service;

sesuai tanggung jawabnya.

Jangan membuat controller menjadi query dump.

---

# 13. Job dan Queue

Gunakan Job untuk proses:

- berat;
- lambat;
- bisa dijalankan asynchronous;
- tidak harus selesai sebelum HTTP response diberikan.

Contoh:

```text
GenerateReport
ImportLargeDataset
ProcessUploadedFile
SendBulkEmail
SyncExternalData
```

## Contoh

```php
GenerateInvestmentReport::dispatch($investment);
```

Jangan membuat user menunggu proses yang seharusnya bisa dilakukan queue.

---

# 14. Event dan Listener

Gunakan Event jika sebuah kejadian bisnis memiliki beberapa side effect yang independen.

Contoh:

```text
InvestmentCreated
├── WriteAuditLog
├── SendInvestmentNotification
└── UpdatePortfolioSummary
```

Gunakan Event secara selektif.

Jangan menggunakan Event untuk semua method karena akan membuat alur aplikasi sulit ditelusuri.

Jika hanya ada satu proses sederhana, panggil class tersebut secara langsung.

---

# 15. Notification

Gunakan Notification untuk komunikasi kepada user seperti:

- email;
- database notification;
- broadcast;
- push notification;
- SMS jika menggunakan channel yang sesuai.

Jangan menaruh formatting notification panjang di controller.

---

# 16. Database Transaction

Gunakan transaction jika satu proses terdiri dari beberapa operasi database yang harus berhasil atau gagal bersama-sama.

Contoh:

```php
DB::transaction(function () use ($data, $user) {
    $investment = $user->investments()->create($data);

    $investment->transactions()->create([
        // ...
    ]);
});
```

Gunakan transaction pada layer business logic, biasanya Action atau Service.

Jangan menaruh transaction kompleks langsung di controller jika bisa dihindari.

---

# 17. Dependency Injection

Gunakan constructor injection atau method injection.

## Contoh

```php
public function store(
    StoreInvestmentRequest $request,
    CreateInvestment $action,
): RedirectResponse {
    $action->handle($request->validated(), $request->user());

    return to_route('investments.index');
}
```

Jangan membuat dependency secara manual jika Laravel Container dapat meng-inject-nya.

Hindari:

```php
$service = new PortfolioCalculationService();
```

jika service mempunyai dependency sendiri.

---

# 18. Naming Convention

Gunakan nama yang menjelaskan maksud.

## Controller

```text
InvestmentController
AssetController
TransactionController
```

## Request

```text
StoreInvestmentRequest
UpdateInvestmentRequest
```

## Action

```text
CreateInvestment
UpdateInvestment
DeleteInvestment
ApproveInvestment
```

## Policy

```text
InvestmentPolicy
AssetPolicy
```

## Job

```text
GenerateInvestmentReport
ImportTransactions
```

## Event

```text
InvestmentCreated
InvestmentApproved
```

## Listener

```text
WriteInvestmentAuditLog
SendInvestmentCreatedNotification
```

Hindari nama terlalu umum seperti:

```text
Helper
Manager
Handler
Utility
Common
DataService
MainService
```

kecuali konteksnya benar-benar jelas.

---

# 19. Folder Structure

Struktur awal yang direkomendasikan:

```text
app/
├── Actions/
│   ├── Assets/
│   └── Investments/
│
├── Events/
│
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/
│   │   ├── Assets/
│   │   └── Investments/
│   └── Resources/
│
├── Jobs/
├── Listeners/
├── Models/
├── Notifications/
├── Policies/
├── Providers/
└── Services/
```

Jangan membuat folder kosong hanya demi mengikuti struktur ini.

Buat folder ketika fitur memang membutuhkannya.

---

# 20. Frontend Structure untuk Inertia + React

Gunakan struktur berbasis feature/domain jika aplikasi mulai berkembang.

```text
resources/js/
├── components/
├── hooks/
├── layouts/
├── lib/
├── pages/
│   ├── assets/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── edit.tsx
│   │   └── show.tsx
│   │
│   └── investments/
│       ├── index.tsx
│       ├── create.tsx
│       ├── edit.tsx
│       └── show.tsx
│
└── types/
```

## Aturan React

- component kecil dan reusable;
- jangan menaruh semua halaman dalam satu file;
- pisahkan UI component dari logic yang kompleks;
- gunakan custom hook jika logic React digunakan ulang;
- jangan membuat abstraction sebelum diperlukan;
- gunakan TypeScript jika stack project sudah menggunakannya.

---

# 21. Feature Test

Setiap fitur penting sebaiknya memiliki Feature Test.

Prioritas test:

1. authentication;
2. authorization;
3. create;
4. update;
5. delete;
6. validation;
7. business rule;
8. critical calculation;
9. API response;
10. ownership/access control.

## Contoh

```php
test('user can create an investment', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('investments.store'), [
            'name' => 'Deposito',
            'amount' => 10_000_000,
            'date' => now()->toDateString(),
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('investments', [
        'user_id' => $user->id,
        'name' => 'Deposito',
    ]);
});
```

---

# 22. Unit Test

Gunakan Unit Test terutama untuk:

- algoritma;
- kalkulasi;
- class kecil;
- pure business logic;
- service yang tidak membutuhkan HTTP.

Jangan memaksakan semuanya menjadi Unit Test.

Jika test membutuhkan Laravel, database, auth, middleware, atau route, sering kali Feature Test lebih tepat.

---

# 23. Database Migration

Migration harus:

- memiliki nama yang jelas;
- mempunyai foreign key yang sesuai;
- index dibuat jika memang diperlukan;
- nullable hanya jika secara domain memang boleh kosong;
- constraint diterapkan di level database jika berguna.

Contoh:

```php
Schema::create('investments', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->string('name');
    $table->decimal('amount', 18, 2);
    $table->string('status')->index();

    $table->timestamps();
});
```

Jangan bergantung sepenuhnya pada validation aplikasi untuk menjaga integritas data.

---

# 24. Eager Loading

Hindari N+1 query.

Jangan:

```php
$investments = Investment::all();

foreach ($investments as $investment) {
    echo $investment->user->name;
}
```

Gunakan:

```php
$investments = Investment::with('user')->get();
```

Perhatikan query untuk:

- list;
- dashboard;
- report;
- API endpoint.

---

# 25. Pagination

Untuk list besar, gunakan pagination.

```php
Investment::query()
    ->latest()
    ->paginate(15);
```

Jangan menggunakan:

```php
Investment::all();
```

untuk tabel yang berpotensi memiliki ribuan data.

---

# 26. Configuration

Jangan menggunakan `env()` secara langsung di application code.

Buruk:

```php
$apiKey = env('PAYMENT_API_KEY');
```

Gunakan config:

```php
$apiKey = config('services.payment.key');
```

`env()` digunakan di file config.

---

# 27. Constants dan Enum

Jika nilai status memiliki daftar tetap, pertimbangkan PHP Enum.

Contoh:

```php
enum InvestmentStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Closed = 'closed';
}
```

Model:

```php
protected function casts(): array
{
    return [
        'status' => InvestmentStatus::class,
    ];
}
```

Hindari menyebarkan magic string seperti:

```php
'active'
'pending'
'closed'
```

di puluhan lokasi.

---

# 28. Error Handling

Jangan membungkus semua kode dengan:

```php
try {
    //
} catch (\Exception $e) {
    return back()->with('error', 'Something went wrong');
}
```

Biarkan exception Laravel ditangani secara normal jika tidak ada kebutuhan khusus.

Tangkap exception hanya jika:

- bisa dipulihkan;
- perlu diubah menjadi domain response tertentu;
- external service membutuhkan fallback;
- ada tindakan spesifik setelah error.

---

# 29. Logging

Log harus berguna.

Bagus:

```php
Log::warning('Payment callback signature mismatch', [
    'payment_id' => $payment->id,
]);
```

Hindari:

```php
Log::info('masuk sini');
Log::info('test');
Log::info('berhasil');
```

untuk production code.

Jangan log:

- password;
- access token;
- secret;
- API key;
- data sensitif.

---

# 30. Security

Selalu perhatikan:

- mass assignment;
- authorization;
- CSRF;
- validation;
- file upload;
- SQL injection;
- XSS;
- sensitive data;
- secrets di `.env`;
- rate limiting untuk endpoint yang sesuai.

Jangan hanya menyembunyikan button di frontend sebagai authorization.

Backend tetap harus memverifikasi izin user.

---

# 31. Jangan Over-Engineering

Jangan otomatis menambahkan:

```text
Repository
RepositoryInterface
DTO
Factory
Adapter
Domain Service
Application Service
Command Bus
Query Bus
CQRS
Event Sourcing
```

untuk CRUD sederhana.

Gunakan pattern karena ada masalah yang perlu diselesaikan, bukan karena pattern tersebut terlihat profesional.

Default architecture:

```text
Route
↓
Form Request
↓
Controller
↓
Action
↓
Model
```

sudah cukup untuk banyak fitur.

---

# 32. Kapan Membuat DTO

DTO bersifat opsional.

Pertimbangkan DTO jika:

- data mempunyai struktur kompleks;
- data berpindah melewati beberapa layer;
- type safety sangat berguna;
- array mulai sulit dipahami;
- integration payload kompleks.

Jangan membuat DTO hanya untuk mengganti array tiga field.

---

# 33. Kapan Memecah Action

Action perlu dipecah jika:

- terlalu panjang;
- memiliki beberapa tanggung jawab berbeda;
- ada bagian reusable;
- sulit dites;
- mempunyai banyak branch yang sebenarnya use case berbeda.

Contoh buruk:

```text
ProcessInvestmentAction
```

yang menangani:

```text
create
approve
reject
calculate
email
audit
export
```

Lebih baik pisahkan berdasarkan use case.

---

# 34. Query Object

Gunakan Query Object hanya untuk query kompleks yang:

- digunakan berulang;
- memiliki banyak filter;
- sulit dibaca di controller;
- memiliki business filtering rule.

Contoh:

```text
app/
└── Queries/
    └── InvestmentIndexQuery.php
```

Jangan membuat Query Object untuk:

```php
Investment::latest()->paginate();
```

---

# 35. Coding Style

Ikuti Laravel Pint.

Jalankan:

```bash
./vendor/bin/pint
```

atau pada Windows:

```powershell
vendor\bin\pint
```

Sebelum tugas dianggap selesai, format kode yang berubah.

Jangan melakukan formatting manual yang bertentangan dengan Pint.

---

# 36. Tahapan Implementasi Fitur

Saat AI diminta membuat fitur, jangan langsung menghasilkan seluruh project sekaligus.

Kerjakan bertahap.

## Tahap 1 — Analisis

Tentukan:

- tujuan fitur;
- entity yang terlibat;
- table;
- relationship;
- authorization;
- validation;
- use case;
- kemungkinan side effect.

## Tahap 2 — Database

Buat:

- migration;
- foreign key;
- index;
- model relationship;
- cast.

Lalu jalankan migration/test yang relevan.

## Tahap 3 — Backend Core

Buat:

- Form Request;
- Policy jika perlu;
- Action;
- Controller;
- Route.

## Tahap 4 — Frontend

Jika menggunakan Inertia:

- page;
- form;
- reusable component;
- validation error rendering.

## Tahap 5 — Side Effect

Jika dibutuhkan:

- Job;
- Event;
- Listener;
- Notification.

## Tahap 6 — Testing

Tambahkan Feature Test untuk happy path dan critical failure path.

## Tahap 7 — Cleanup

Periksa:

- duplikasi;
- naming;
- N+1;
- unused import;
- dead code;
- formatting;
- architecture consistency.

Jangan lanjut ke tahap berikutnya jika tahap aktif masih mempunyai error dasar.

---

# 37. Aturan AI Coding Agent

Saat bekerja pada project ini, AI harus:

1. mempelajari struktur project sebelum membuat file baru;
2. mengikuti convention yang sudah ada;
3. menggunakan fitur native Laravel terlebih dahulu;
4. tidak menambahkan package tanpa alasan;
5. tidak mengubah architecture secara besar tanpa kebutuhan;
6. menjaga controller tetap tipis;
7. memindahkan validation ke Form Request;
8. memindahkan business logic ke Action;
9. menggunakan Policy untuk authorization;
10. menggunakan Job untuk proses asynchronous/berat;
11. menggunakan Event hanya jika memang berguna;
12. menghindari Repository tanpa kebutuhan nyata;
13. menggunakan transaction untuk operasi database atomik;
14. menghindari N+1 query;
15. menggunakan eager loading jika diperlukan;
16. menggunakan pagination untuk dataset besar;
17. membuat test untuk fitur penting;
18. menjalankan formatter;
19. tidak membuat abstraction spekulatif;
20. memilih solusi paling sederhana yang tetap maintainable.

---

# 38. Checklist Sebelum Menganggap Fitur Selesai

- [ ] Route hanya menangani routing.
- [ ] Validation berada di Form Request jika non-trivial.
- [ ] Controller tidak berisi business logic panjang.
- [ ] Business logic berada di Action atau Service yang tepat.
- [ ] Authorization sudah diperiksa.
- [ ] Model relationship sudah benar.
- [ ] Cast model sudah sesuai.
- [ ] Query tidak menimbulkan N+1.
- [ ] List besar menggunakan pagination.
- [ ] Operasi multi-query kritis menggunakan transaction.
- [ ] Process berat menggunakan Job jika sesuai.
- [ ] Tidak ada secret hardcoded.
- [ ] Tidak ada `env()` di luar config.
- [ ] Tidak ada Repository yang tidak perlu.
- [ ] Tidak ada abstraction tanpa manfaat nyata.
- [ ] Naming class dan method jelas.
- [ ] Feature Test tersedia untuk fitur kritis.
- [ ] Test berhasil dijalankan.
- [ ] Laravel Pint berhasil dijalankan.
- [ ] Tidak ada unused import atau dead code.
- [ ] Implementasi mengikuti convention project yang sudah ada.

---

# 39. Decision Guide

Gunakan aturan berikut ketika ragu menentukan lokasi logic.

## Apakah ini validation input?

Gunakan:

```text
Form Request
```

## Apakah ini authorization?

Gunakan:

```text
Policy
```

## Apakah ini satu use case bisnis?

Gunakan:

```text
Action
```

## Apakah ini kemampuan reusable yang dipakai banyak use case?

Gunakan:

```text
Service
```

## Apakah ini relationship atau behavior yang sangat dekat dengan model?

Gunakan:

```text
Model
```

## Apakah ini proses berat / asynchronous?

Gunakan:

```text
Job
```

## Apakah satu kejadian memiliki beberapa side effect independen?

Pertimbangkan:

```text
Event + Listener
```

## Apakah ini format response API?

Gunakan:

```text
Resource
```

## Apakah query sangat kompleks dan reusable?

Pertimbangkan:

```text
Query Object
```

## Apakah hanya query Eloquent sederhana?

Tetap gunakan:

```text
Eloquent
```

Jangan membuat layer tambahan.

---

# 40. Target Akhir

Target architecture aplikasi bukan membuat sebanyak mungkin layer.

Targetnya adalah alur yang mudah dipahami:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Form Request
   ↓
Controller
   ↓
Action
   ↓
Model
   ↓
Database
```

Dengan kebutuhan tambahan:

```text
          ┌─ Policy
          ├─ Service
Action ───┼─ Job
          ├─ Event
          └─ Notification
```

Setiap class harus memiliki alasan yang jelas untuk ada.

Jika sebuah class hanya meneruskan method ke class lain tanpa menambah abstraction yang berguna, pertimbangkan untuk menghapusnya.

**Gunakan arsitektur sesederhana mungkin, tetapi tetap cukup terstruktur untuk tumbuh bersama aplikasi.**
