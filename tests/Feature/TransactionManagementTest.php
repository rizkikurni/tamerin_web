<?php

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\AuditEvent;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use App\Queries\Transactions\AccountBalanceQuery;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function phaseFiveTransactionPayload(
    FinancialAccount $account,
    ?Category $category,
    array $overrides = [],
): array {
    return [
        'type' => TransactionType::Expense->value,
        'amount' => 250_000,
        'transacted_on' => '2026-08-20',
        'account_id' => $account->id,
        'destination_account_id' => null,
        'category_id' => $category?->id,
        'note' => 'Catatan transaksi',
        'idempotency_key' => (string) Str::uuid(),
        ...$overrides,
    ];
}

test('income adds to the account balance', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['opening_balance' => 1_000_000]);
    $category = Category::factory()->for($user)->income()->create();

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($account, $category, [
            'type' => TransactionType::Income->value,
            'amount' => 500_000,
        ]))
        ->assertRedirect()
        ->assertSessionHas('status', 'transaction-created');

    expect((new AccountBalanceQuery)->calculate($account))->toBe(1_500_000);
});

test('expense subtracts from the account balance', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['opening_balance' => 1_000_000]);
    $category = Category::factory()->for($user)->expense()->create();

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($account, $category, [
            'amount' => 350_000,
        ]))
        ->assertRedirect();

    expect((new AccountBalanceQuery)->calculate($account))->toBe(650_000);
});

test('transfer moves balance between accounts without becoming cash flow', function () {
    $user = User::factory()->create();
    $sourceAccount = FinancialAccount::factory()->for($user)->create(['opening_balance' => 1_000_000]);
    $destinationAccount = FinancialAccount::factory()->for($user)->create(['opening_balance' => 200_000]);

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($sourceAccount, null, [
            'type' => TransactionType::Transfer->value,
            'amount' => 300_000,
            'destination_account_id' => $destinationAccount->id,
        ]))
        ->assertRedirect();

    $transaction = Transaction::query()->sole();

    expect((new AccountBalanceQuery)->calculate($sourceAccount))->toBe(700_000)
        ->and((new AccountBalanceQuery)->calculate($destinationAccount))->toBe(500_000)
        ->and($transaction->type)->toBe(TransactionType::Transfer)
        ->and($transaction->category_id)->toBeNull()
        ->and(Transaction::query()
            ->whereIn('type', [TransactionType::Income, TransactionType::Expense])
            ->sum('amount'))->toBe(0);
});

test('category must match the transaction type', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $expenseCategory = Category::factory()->for($user)->expense()->create();

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($account, $expenseCategory, [
            'type' => TransactionType::Income->value,
        ]))
        ->assertInvalid(['category_id']);

    expect(Transaction::query()->count())->toBe(0);
});

test('transfer destination must differ from its source account', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($account, null, [
            'type' => TransactionType::Transfer->value,
            'destination_account_id' => $account->id,
        ]))
        ->assertInvalid(['destination_account_id']);
});

test('accounts and categories owned by another user are rejected', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $category = Category::factory()->for($user)->expense()->create();
    $otherAccount = FinancialAccount::factory()->create();
    $otherCategory = Category::factory()->expense()->create();

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($otherAccount, $category))
        ->assertInvalid(['account_id']);

    $this->actingAs($user)
        ->post(route('transactions.store'), phaseFiveTransactionPayload($account, $otherCategory))
        ->assertInvalid(['category_id']);

    expect(Transaction::query()->count())->toBe(0);
});

test('an idempotency key prevents duplicate transactions', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $category = Category::factory()->for($user)->expense()->create();
    $payload = phaseFiveTransactionPayload($account, $category);

    $this->actingAs($user)->post(route('transactions.store'), $payload)->assertRedirect();
    $this->actingAs($user)->post(route('transactions.store'), $payload)->assertRedirect();

    expect(Transaction::query()->count())->toBe(1);
});

test('transaction create choices only include active data owned by the user', function () {
    $user = User::factory()->create();
    $activeAccount = FinancialAccount::factory()->for($user)->create();
    $archivedAccount = FinancialAccount::factory()->for($user)->archived()->create();
    $activeCategory = Category::factory()->for($user)->create();
    $archivedCategory = Category::factory()->for($user)->archived()->create();
    $otherAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->get(route('transactions.create'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transactions/create')
            ->where('accounts', fn (Collection $accounts): bool => $accounts->contains('id', $activeAccount->id)
                && $accounts->doesntContain('id', $archivedAccount->id)
                && $accounts->doesntContain('id', $otherAccount->id))
            ->where('categories', fn (Collection $categories): bool => $categories->contains('id', $activeCategory->id)
                && $categories->doesntContain('id', $archivedCategory->id)));
});

test('transaction index is filtered and isolated by owner', function () {
    $user = User::factory()->create();
    $income = Transaction::factory()->income()->for($user)->create();
    Transaction::factory()->expense()->for($user)->create();
    Transaction::factory()->income()->for($user)->voided()->create();
    Transaction::factory()->income()->create();

    $this->actingAs($user)
        ->get(route('transactions.index', [
            'type' => TransactionType::Income->value,
            'status' => TransactionStatus::Posted->value,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transactions/index')
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $income->id)
            ->where('filters.type', TransactionType::Income->value)
            ->where('filters.status', TransactionStatus::Posted->value));
});

test('users cannot view or void another users transaction', function () {
    $user = User::factory()->create();
    $otherTransaction = Transaction::factory()->create();

    $this->actingAs($user)
        ->get(route('transactions.show', $otherTransaction))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('transactions.void', $otherTransaction), [
            'void_reason' => 'Tidak berhak membatalkan transaksi ini.',
        ])
        ->assertForbidden();
});

test('void removes transaction impact and stores an audit event atomically', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['opening_balance' => 1_000_000]);
    $transaction = Transaction::factory()->income()->for($user)->create([
        'account_id' => $account->id,
        'amount' => 500_000,
    ]);

    expect((new AccountBalanceQuery)->calculate($account))->toBe(1_500_000);

    $this->actingAs($user)
        ->patch(route('transactions.void', $transaction), [
            'void_reason' => 'Nominal pemasukan salah.',
        ], [
            'X-Request-ID' => 'request-void-transaction',
        ])
        ->assertRedirect(route('transactions.show', $transaction))
        ->assertSessionHas('status', 'transaction-voided');

    $transaction->refresh();
    $auditEvent = AuditEvent::query()->sole();

    expect($transaction)
        ->status->toBe(TransactionStatus::Voided)
        ->voided_at->not->toBeNull()
        ->void_reason->toBe('Nominal pemasukan salah.')
        ->and((new AccountBalanceQuery)->calculate($account))->toBe(1_000_000)
        ->and($auditEvent->user_id)->toBe($user->id)
        ->and($auditEvent->actor_id)->toBe($user->id)
        ->and($auditEvent->action)->toBe('transaction.voided')
        ->and($auditEvent->auditable_type)->toBe(Transaction::class)
        ->and($auditEvent->auditable_id)->toBe($transaction->id)
        ->and($auditEvent->old_values['status'])->toBe(TransactionStatus::Posted->value)
        ->and($auditEvent->new_values['status'])->toBe(TransactionStatus::Voided->value)
        ->and($auditEvent->request_id)->toBe('request-void-transaction');
});

test('a voided transaction cannot be voided again', function () {
    $user = User::factory()->create();
    $transaction = Transaction::factory()->for($user)->voided()->create();

    $this->actingAs($user)
        ->patch(route('transactions.void', $transaction), [
            'void_reason' => 'Percobaan kedua.',
        ])
        ->assertForbidden();
});
