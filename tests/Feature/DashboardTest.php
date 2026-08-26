<?php

use App\Enums\AssetStatus;
use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentValuationStatus;
use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Asset;
use App\Models\Budget;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\Obligation;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard and system reminders require authentication', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
    $this->get(route('system-reminders.index'))->assertRedirect(route('login'));
});

test('dashboard validates the selected monthly period', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['period' => 'Agustus 2026']))
        ->assertSessionHasErrors(['period']);
});

test('dashboard summary only uses posted financial data owned by the user', function () {
    $this->travelTo('2026-08-20 10:00:00');

    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $sourceAccount = FinancialAccount::factory()->for($user)->create([
        'opening_balance' => 1_000_000,
    ]);
    $destinationAccount = FinancialAccount::factory()->for($user)->create([
        'opening_balance' => 200_000,
    ]);
    $incomeCategory = Category::factory()->for($user)->income()->create();
    $expenseCategory = Category::factory()->for($user)->expense()->create();

    Transaction::factory()->income()->for($user)->create([
        'account_id' => $sourceAccount->id,
        'category_id' => $incomeCategory->id,
        'amount' => 500_000,
        'transacted_on' => '2026-08-05',
    ]);
    Transaction::factory()->expense()->for($user)->create([
        'account_id' => $sourceAccount->id,
        'category_id' => $expenseCategory->id,
        'amount' => 200_000,
        'transacted_on' => '2026-08-06',
    ]);
    Transaction::factory()->transfer()->for($user)->create([
        'account_id' => $sourceAccount->id,
        'destination_account_id' => $destinationAccount->id,
        'amount' => 100_000,
        'transacted_on' => '2026-08-07',
    ]);
    Transaction::factory()->income()->voided()->for($user)->create([
        'account_id' => $sourceAccount->id,
        'category_id' => $incomeCategory->id,
        'amount' => 900_000,
        'transacted_on' => '2026-08-08',
    ]);
    Transaction::factory()->income()->for($otherUser)->create([
        'amount' => 8_000_000,
        'transacted_on' => '2026-08-09',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['period' => '2026-08']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('period.value', '2026-08')
            ->where('summary.totalBalance', 1_500_000)
            ->where('summary.activeAccountCount', 2)
            ->where('summary.income', 500_000)
            ->where('summary.expense', 200_000)
            ->where('summary.netCashFlow', 300_000)
            ->has('cashFlow', 31)
            ->has('accounts', 2)
            ->has('recentTransactions', 4));
});

test('net worth applies the correct signs and excludes other users data', function () {
    $this->travelTo('2026-08-20 10:00:00');

    $user = User::factory()->create();
    FinancialAccount::factory()->for($user)->create(['opening_balance' => 1_000_000]);
    $holding = InvestmentHolding::factory()->for($user)->create([
        'status' => InvestmentHoldingStatus::Active,
        'last_valuation_at' => '2026-08-10',
    ]);
    InvestmentValuation::factory()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-10',
        'value' => 2_000_000,
        'status' => InvestmentValuationStatus::Active,
    ]);
    Asset::factory()->for($user)->create([
        'current_value' => 3_000_000,
        'status' => AssetStatus::Active,
    ]);
    Obligation::factory()->receivable()->for($user)->create([
        'outstanding_amount' => 4_000_000,
        'status' => ObligationStatus::Open,
    ]);
    Obligation::factory()->for($user)->create([
        'kind' => ObligationKind::Debt,
        'outstanding_amount' => 1_500_000,
        'status' => ObligationStatus::Open,
    ]);
    Asset::factory()->create(['current_value' => 50_000_000]);

    $this->actingAs($user)
        ->get(route('dashboard', ['period' => '2026-08']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('netWorth.accountBalance', 1_000_000)
            ->where('netWorth.investments', 2_000_000)
            ->where('netWorth.assets', 3_000_000)
            ->where('netWorth.receivables', 4_000_000)
            ->where('netWorth.debts', 1_500_000)
            ->where('netWorth.total', 8_500_000));
});

test('system reminder endpoint returns current user reminders for the navbar popup', function () {
    $this->travelTo('2026-08-20 10:00:00');

    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $category = Category::factory()->for($user)->expense()->create();

    Budget::factory()->for($user)->create([
        'category_id' => $category->id,
        'period_start' => '2026-08-01',
        'amount' => 1_000_000,
    ]);
    Transaction::factory()->expense()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount' => 850_000,
        'transacted_on' => '2026-08-10',
    ]);
    Obligation::factory()->for($user)->create([
        'due_on' => '2026-08-23',
        'status' => ObligationStatus::Open,
    ]);
    $goal = SavingsGoal::factory()->for($user)->create([
        'target_amount' => 5_000_000,
        'target_date' => '2026-08-30',
        'status' => SavingsGoalStatus::Active,
    ]);
    SavingsContribution::factory()->for($user)->create([
        'savings_goal_id' => $goal->id,
        'amount' => 1_000_000,
        'status' => SavingsContributionStatus::Active,
    ]);
    InvestmentHolding::factory()->for($user)->create([
        'status' => InvestmentHoldingStatus::Active,
        'last_valuation_at' => '2026-06-01',
    ]);
    Obligation::factory()->create([
        'counterparty_name' => 'Data pengguna lain',
        'due_on' => '2026-08-21',
    ]);

    $response = $this->actingAs($user)
        ->getJson(route('system-reminders.index'))
        ->assertSuccessful()
        ->assertJsonPath('count', 4)
        ->assertJsonCount(4, 'reminders');

    expect(collect($response->json('reminders'))->pluck('type')->all())
        ->toContain('budget', 'obligation', 'savings', 'investment')
        ->and(collect($response->json('reminders'))->pluck('message')->join(' '))
        ->not->toContain('Data pengguna lain');
});

test('dashboard query count stays constant as transaction rows increase', function () {
    $this->travelTo('2026-08-20 10:00:00');

    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $category = Category::factory()->for($user)->expense()->create();

    Transaction::factory()
        ->expense()
        ->for($user)
        ->create([
            'account_id' => $account->id,
            'category_id' => $category->id,
            'transacted_on' => '2026-08-10',
            'status' => TransactionStatus::Posted,
            'type' => TransactionType::Expense,
        ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['period' => '2026-08']))
        ->assertSuccessful();

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)
        ->get(route('dashboard', ['period' => '2026-08']))
        ->assertSuccessful();
    $emptyDashboardQueryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    Transaction::factory()
        ->count(19)
        ->expense()
        ->for($user)
        ->create([
            'account_id' => $account->id,
            'category_id' => $category->id,
            'transacted_on' => '2026-08-10',
            'status' => TransactionStatus::Posted,
            'type' => TransactionType::Expense,
        ]);

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($user)
        ->get(route('dashboard', ['period' => '2026-08']))
        ->assertSuccessful();
    $populatedDashboardQueryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    expect($populatedDashboardQueryCount)->toBe($emptyDashboardQueryCount);
});
