<?php

use App\Enums\TransactionStatus;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('report page requires authentication', function () {
    $this->get(route('reports.index'))->assertRedirect(route('home'));
});

test('transaction report filters owned data and calculates correct totals', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $otherAccount = FinancialAccount::factory()->for($user)->create();
    $incomeCategory = Category::factory()->income()->for($user)->create();
    $expenseCategory = Category::factory()->expense()->for($user)->create();

    Transaction::factory()->income()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $incomeCategory->id,
        'amount' => 1_000_000,
        'transacted_on' => '2026-08-05',
    ]);
    Transaction::factory()->expense()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $expenseCategory->id,
        'amount' => 400_000,
        'transacted_on' => '2026-08-10',
    ]);
    Transaction::factory()->expense()->voided()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $expenseCategory->id,
        'amount' => 900_000,
        'transacted_on' => '2026-08-11',
    ]);
    Transaction::factory()->income()->for($user)->create([
        'account_id' => $otherAccount->id,
        'category_id' => $incomeCategory->id,
        'amount' => 2_000_000,
        'transacted_on' => '2026-08-12',
    ]);
    Transaction::factory()->income()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $incomeCategory->id,
        'amount' => 3_000_000,
        'transacted_on' => '2026-07-31',
    ]);
    Transaction::factory()->income()->create([
        'amount' => 99_000_000,
        'transacted_on' => '2026-08-08',
    ]);

    $this->actingAs($user)
        ->get(route('reports.index', [
            'report_type' => 'transactions',
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-31',
            'account_id' => $account->id,
            'status' => TransactionStatus::Posted->value,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('filters.report_type', 'transactions')
            ->where('report.summary.transaction_count', 2)
            ->where('report.summary.income', 1_000_000)
            ->where('report.summary.expense', 400_000)
            ->where('report.summary.transfer', 0)
            ->has('report.details.data', 2)
            ->has('reportOptions', 7));
});

test('every initial report type returns a normalized report payload', function (string $reportType) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.index', [
            'report_type' => $reportType,
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-31',
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('report.type', $reportType)
            ->has('report.title')
            ->has('report.summary')
            ->has('report.columns')
            ->has('report.details.data'));
})->with([
    'transactions',
    'cash_flow',
    'budgets',
    'savings',
    'investments',
    'net_worth',
    'obligations',
]);

test('report filter rejects invalid dates type and foreign account', function () {
    $user = User::factory()->create();
    $foreignAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.index', [
            'report_type' => 'unknown',
            'date_from' => 'not-a-date',
            'date_to' => '2026-01-01',
            'account_id' => $foreignAccount->id,
        ]))
        ->assertInvalid(['report_type', 'date_from', 'account_id']);
});
