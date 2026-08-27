<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('budget routes require authentication', function () {
    $budget = Budget::factory()->create();

    $this->get(route('budgets.index'))->assertRedirect(route('login'));
    $this->post(route('budgets.store'))->assertRedirect(route('login'));
    $this->patch(route('budgets.update', $budget))->assertRedirect(route('login'));
});

test('users only see their own budgets for the selected month with calculated usage', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();
    $category = Category::factory()->for($user)->expense()->create(['name' => 'Makanan']);
    $availableCategory = Category::factory()->for($user)->expense()->create();
    $incomeCategory = Category::factory()->for($user)->income()->create();
    $archivedCategory = Category::factory()->for($user)->expense()->archived()->create();
    $budget = Budget::factory()->for($user)->create([
        'category_id' => $category->id,
        'period_start' => '2026-08-01',
        'amount' => 1_000_000,
    ]);

    Transaction::factory()->expense()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'transacted_on' => '2026-08-10',
        'amount' => 850_000,
    ]);
    Transaction::factory()->expense()->voided()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'transacted_on' => '2026-08-11',
        'amount' => 500_000,
    ]);
    Transaction::factory()->expense()->for($user)->create([
        'account_id' => $account->id,
        'category_id' => $category->id,
        'transacted_on' => '2026-07-31',
        'amount' => 200_000,
    ]);

    $otherBudget = Budget::factory()->create(['period_start' => '2026-08-01']);
    Budget::factory()->for($user)->create([
        'category_id' => $availableCategory->id,
        'period_start' => '2026-07-01',
    ]);

    $this->actingAs($user)
        ->get(route('budgets.index', ['period' => '2026-08']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('budgets/index')
            ->where('period.value', '2026-08')
            ->has('budgets.data', 1)
            ->where('budgets.data.0.id', $budget->id)
            ->where('budgets.data.0.spent', 850_000)
            ->where('budgets.data.0.remaining', 150_000)
            ->where('budgets.data.0.percentage', 85)
            ->where('budgets.data.0.status', 'warning')
            ->where('summary.allocated', 1_000_000)
            ->where('summary.spent', 850_000)
            ->where('summary.remaining', 150_000)
            ->where('summary.percentage', 85)
            ->where('summary.overBudgetCount', 0)
            ->where('categoryOptions', fn (Collection $options): bool => $options->contains('value', $availableCategory->id)
                && $options->doesntContain('value', $category->id)
                && $options->doesntContain('value', $incomeCategory->id)
                && $options->doesntContain('value', $archivedCategory->id))
            ->where('budgets.data', fn (Collection $budgets): bool => $budgets->doesntContain('id', $otherBudget->id)));
});

test('users can create a budget and the period is stored as the first day of the month', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'period' => '2026-08',
            'amount' => 1_500_000,
        ])
        ->assertRedirect(route('budgets.index', ['period' => '2026-08']))
        ->assertSessionHas('status', 'budget-created');

    $budget = Budget::query()->sole();

    expect($budget)
        ->user_id->toBe($user->id)
        ->category_id->toBe($category->id)
        ->period_start->toDateString()->toBe('2026-08-01')
        ->amount->toBe(1_500_000);
});

test('a category can only have one budget in the same month', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();
    Budget::factory()->for($user)->create([
        'category_id' => $category->id,
        'period_start' => '2026-08-01',
    ]);

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'period' => '2026-08',
            'amount' => 2_000_000,
        ])
        ->assertInvalid(['category_id']);

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'period' => '2026-09',
            'amount' => 2_000_000,
        ])
        ->assertRedirect(route('budgets.index', ['period' => '2026-09']));

    expect(Budget::query()->count())->toBe(2);
});

test('budgets only accept active expense categories owned by the user', function () {
    $user = User::factory()->create();
    $invalidCategories = [
        Category::factory()->for($user)->income()->create(),
        Category::factory()->for($user)->expense()->archived()->create(),
        Category::factory()->expense()->create(),
    ];

    foreach ($invalidCategories as $category) {
        $this->actingAs($user)
            ->post(route('budgets.store'), [
                'category_id' => $category->id,
                'period' => '2026-08',
                'amount' => 1_000_000,
            ])
            ->assertInvalid(['category_id']);
    }

    expect(Budget::query()->count())->toBe(0);
});

test('budget amount must be a positive integer', function (mixed $amount) {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->expense()->create();

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'period' => '2026-08',
            'amount' => $amount,
        ])
        ->assertInvalid(['amount']);
})->with([
    'zero' => 0,
    'negative' => -10_000,
    'decimal' => 1000.50,
]);

test('users can update their own budget amount', function () {
    $user = User::factory()->create();
    $budget = Budget::factory()->for($user)->create([
        'period_start' => '2026-08-01',
        'amount' => 1_000_000,
    ]);

    $this->actingAs($user)
        ->patch(route('budgets.update', $budget), ['amount' => 1_750_000])
        ->assertRedirect(route('budgets.index', ['period' => '2026-08']))
        ->assertSessionHas('status', 'budget-updated');

    expect($budget->refresh()->amount)->toBe(1_750_000);
});

test('users cannot update another users budget', function () {
    $user = User::factory()->create();
    $otherBudget = Budget::factory()->create(['amount' => 1_000_000]);

    $this->actingAs($user)
        ->patch(route('budgets.update', $otherBudget), ['amount' => 9_000_000])
        ->assertForbidden();

    expect($otherBudget->refresh()->amount)->toBe(1_000_000);
});
