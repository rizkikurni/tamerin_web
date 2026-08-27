<?php

use App\Enums\ObligationStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\AuditEvent;
use App\Models\FinancialAccount;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use App\Models\Transaction;
use App\Models\User;
use App\Queries\Transactions\AccountBalanceQuery;
use Illuminate\Support\Str;

/** @return array{amount: int, account_id: string, settled_on: string, note: string|null, idempotency_key: string} */
function obligationSettlementPayload(FinancialAccount $account, array $overrides = []): array
{
    return [
        'amount' => 500_000,
        'account_id' => $account->id,
        'settled_on' => '2026-08-27',
        'note' => 'Pelunasan tahap pertama',
        'idempotency_key' => (string) Str::uuid(),
        ...$overrides,
    ];
}

test('debt settlement creates an expense transaction and audit event', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['opening_balance' => 2_000_000]);
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 1_500_000,
        'outstanding_amount' => 1_500_000,
    ]);
    $balanceBefore = app(AccountBalanceQuery::class)->calculate($account);

    $this->actingAs($user)
        ->post(
            route('obligations.settlements.store', $obligation),
            obligationSettlementPayload($account),
            ['X-Request-ID' => 'request-debt-settlement'],
        )
        ->assertRedirect(route('obligations.show', $obligation));

    $settlement = ObligationSettlement::query()->sole();
    $transaction = Transaction::query()->sole();
    $auditEvent = AuditEvent::query()->sole();

    expect($transaction)
        ->type->toBe(TransactionType::Expense)
        ->status->toBe(TransactionStatus::Posted)
        ->amount->toBe(500_000)
        ->account_id->toBe($account->id)
        ->category_id->toBeNull()
        ->and($settlement->transaction_id)->toBe($transaction->id)
        ->and($obligation->refresh()->outstanding_amount)->toBe(1_000_000)
        ->and(app(AccountBalanceQuery::class)->calculate($account))->toBe($balanceBefore - 500_000)
        ->and($auditEvent->action)->toBe('obligation.settlement_recorded')
        ->and($auditEvent->request_id)->toBe('request-debt-settlement');
});

test('receivable settlement creates an income transaction', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['opening_balance' => 1_000_000]);
    $obligation = Obligation::factory()->receivable()->for($user)->create();
    $balanceBefore = app(AccountBalanceQuery::class)->calculate($account);

    $this->actingAs($user)
        ->post(
            route('obligations.settlements.store', $obligation),
            obligationSettlementPayload($account),
        )
        ->assertRedirect(route('obligations.show', $obligation));

    $transaction = Transaction::query()->sole();

    expect($transaction->type)->toBe(TransactionType::Income)
        ->and(app(AccountBalanceQuery::class)->calculate($account))->toBe($balanceBefore + 500_000);
});

test('overpayment is rejected without creating financial records', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 1_000_000,
        'outstanding_amount' => 300_000,
    ]);

    $this->actingAs($user)
        ->post(
            route('obligations.settlements.store', $obligation),
            obligationSettlementPayload($account, ['amount' => 300_001]),
        )
        ->assertInvalid(['amount']);

    expect($obligation->refresh()->outstanding_amount)->toBe(300_000)
        ->and(ObligationSettlement::query()->count())->toBe(0)
        ->and(Transaction::query()->count())->toBe(0);
});

test('idempotency key prevents duplicate settlements and balance changes', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 2_000_000,
        'outstanding_amount' => 2_000_000,
    ]);
    $payload = obligationSettlementPayload($account, ['idempotency_key' => 'same-settlement-request']);

    $this->actingAs($user)->post(route('obligations.settlements.store', $obligation), $payload);
    $this->actingAs($user)->post(route('obligations.settlements.store', $obligation), $payload);

    expect(ObligationSettlement::query()->count())->toBe(1)
        ->and(Transaction::query()->count())->toBe(1)
        ->and($obligation->refresh()->outstanding_amount)->toBe(1_500_000);
});

test('serialized settlement attempts cannot exceed outstanding amount', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 1_000_000,
        'outstanding_amount' => 1_000_000,
    ]);

    $this->actingAs($user)->post(
        route('obligations.settlements.store', $obligation),
        obligationSettlementPayload($account, ['amount' => 800_000]),
    );
    $this->actingAs($user)
        ->post(
            route('obligations.settlements.store', $obligation),
            obligationSettlementPayload($account, ['amount' => 300_000]),
        )
        ->assertInvalid(['amount']);

    expect($obligation->refresh()->outstanding_amount)->toBe(200_000)
        ->and((int) ObligationSettlement::query()->sum('amount'))->toBe(800_000);
});

test('final settlement marks obligation settled and additional settlement is rejected', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 500_000,
        'outstanding_amount' => 500_000,
    ]);

    $this->actingAs($user)->post(
        route('obligations.settlements.store', $obligation),
        obligationSettlementPayload($account),
    );

    expect($obligation->refresh())
        ->outstanding_amount->toBe(0)
        ->status->toBe(ObligationStatus::Settled)
        ->settled_at->not->toBeNull();

    $this->actingAs($user)
        ->post(
            route('obligations.settlements.store', $obligation),
            obligationSettlementPayload($account, ['amount' => 1]),
        )
        ->assertForbidden();
});

test('settlement account must be active and owned by the user', function (string $accountState) {
    $user = User::factory()->create();
    $obligation = Obligation::factory()->for($user)->create();
    $account = $accountState === 'other'
        ? FinancialAccount::factory()->create()
        : FinancialAccount::factory()->archived()->for($user)->create();

    $this->actingAs($user)
        ->post(
            route('obligations.settlements.store', $obligation),
            obligationSettlementPayload($account),
        )
        ->assertInvalid(['account_id']);
})->with(['other', 'archived']);

test('transactions linked to settlements cannot be voided directly', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $obligation = Obligation::factory()->for($user)->create();

    $this->actingAs($user)->post(
        route('obligations.settlements.store', $obligation),
        obligationSettlementPayload($account),
    );

    $transaction = Transaction::query()->sole();

    $this->actingAs($user)
        ->patch(route('transactions.void', $transaction), [
            'void_reason' => 'Mencoba membatalkan settlement.',
        ])
        ->assertForbidden();

    expect($transaction->refresh()->status)->toBe(TransactionStatus::Posted);
});
