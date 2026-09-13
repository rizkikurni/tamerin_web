<?php

use App\Actions\Audit\RecordAuditEvent;
use App\Actions\Reports\XlsxReportGenerator;
use App\Enums\ExportFormat;
use App\Enums\ExportReportType;
use App\Models\Category;
use App\Models\ExportAudit;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

test('export history requires authentication', function () {
    $this->get(route('reports.exports.index'))->assertRedirect(route('home'));
});

test('user only sees owned export history with filters', function () {
    $user = User::factory()->create();
    ExportAudit::factory()->for($user)->create([
        'report_type' => ExportReportType::Transactions,
        'format' => ExportFormat::Pdf,
        'file_name' => 'transaksi-agustus.pdf',
        'generated_at' => '2026-08-20 10:00:00',
    ]);
    ExportAudit::factory()->for($user)->create([
        'report_type' => ExportReportType::Budgets,
        'format' => ExportFormat::Xlsx,
        'generated_at' => '2026-08-21 10:00:00',
    ]);
    ExportAudit::factory()->create([
        'report_type' => ExportReportType::Transactions,
        'format' => ExportFormat::Pdf,
        'file_name' => 'rahasia-user-lain.pdf',
    ]);

    $this->actingAs($user)
        ->get(route('reports.exports.index', [
            'report_type' => ExportReportType::Transactions->value,
            'format' => ExportFormat::Pdf->value,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/exports')
            ->has('exports.data', 1)
            ->where('exports.data.0.file_name', 'transaksi-agustus.pdf')
            ->where('filters.report_type', 'transactions')
            ->where('filters.format', 'pdf'));
});

test('successful xlsx export downloads every filtered row and records its audit', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $category = Category::factory()->expense()->for($user)->create();

    Transaction::factory()
        ->count(17)
        ->expense()
        ->for($user)
        ->create([
            'account_id' => $account->id,
            'category_id' => $category->id,
            'transacted_on' => '2026-08-10',
        ]);

    $response = $this->actingAs($user)->post(route('reports.exports.store'), [
        'report_type' => ExportReportType::Transactions->value,
        'format' => ExportFormat::Xlsx->value,
        'date_from' => '2026-08-01',
        'date_to' => '2026-08-31',
        'account_id' => $account->id,
    ]);

    $response
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->assertHeader('content-disposition');

    expect($response->getContent())->toStartWith('PK');

    $audit = ExportAudit::query()->whereBelongsTo($user)->sole();

    expect($audit->row_count)
        ->toBe(17)
        ->and($audit->format)->toBe(ExportFormat::Xlsx)
        ->and($audit->report_type)->toBe(ExportReportType::Transactions);

    Storage::disk('local')->assertDirectoryEmpty('/');
});

test('successful pdf export returns a pdf and records its audit', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('reports.exports.store'), [
        'report_type' => ExportReportType::NetWorth->value,
        'format' => ExportFormat::Pdf->value,
        'date_from' => '2026-08-01',
        'date_to' => '2026-08-31',
    ]);

    $response
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/pdf')
        ->assertHeader('content-disposition');

    expect($response->getContent())->toStartWith('%PDF-');

    $audit = ExportAudit::query()->whereBelongsTo($user)->sole();

    expect($audit->format)
        ->toBe(ExportFormat::Pdf)
        ->and($audit->row_count)->toBe(5);
});

test('user cannot export a report through another users account filter', function () {
    $user = User::factory()->create();
    $foreignAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->post(route('reports.exports.store'), [
            'report_type' => ExportReportType::Transactions->value,
            'format' => ExportFormat::Pdf->value,
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-31',
            'account_id' => $foreignAccount->id,
        ])
        ->assertInvalid(['account_id']);

    expect(ExportAudit::query()->whereBelongsTo($user)->exists())->toBeFalse();
});

test('failed file generation does not create an export audit', function () {
    Exceptions::fake();

    $user = User::factory()->create();

    mock(XlsxReportGenerator::class, function (MockInterface $mock): void {
        $mock->shouldReceive('generate')
            ->once()
            ->andThrow(new RuntimeException('XLSX generation failed.'));
    });

    $this->actingAs($user)
        ->post(route('reports.exports.store'), [
            'report_type' => ExportReportType::Transactions->value,
            'format' => ExportFormat::Xlsx->value,
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-31',
        ])
        ->assertServerError();

    expect(ExportAudit::query()->whereBelongsTo($user)->exists())->toBeFalse();
    Exceptions::assertReported(RuntimeException::class);
});

test('audit event recursively removes sensitive old and new values', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->for($user)->create([
        'created_by' => $user->id,
    ]);

    $event = app(RecordAuditEvent::class)->handle(
        owner: $user,
        actor: $user,
        auditable: $transaction,
        action: 'security.tested',
        oldValues: [
            'amount' => 100,
            'password' => 'old-password',
            'nested' => ['api_token' => 'old-token', 'safe' => 'value'],
        ],
        newValues: [
            'amount' => 200,
            'client_secret' => 'new-secret',
            'authorization' => 'Bearer token',
        ],
        requestId: 'safe-request-id',
    );

    expect($event->old_values)->toBe([
        'amount' => 100,
        'nested' => ['safe' => 'value'],
    ])->and($event->new_values)->toBe(['amount' => 200]);
});

test('audit activity has no user-facing route before product approval', function () {
    expect(Route::has('reports.activity.index'))->toBeFalse();
});
