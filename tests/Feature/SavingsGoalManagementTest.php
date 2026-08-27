<?php

use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\FinancialAccount;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use App\Queries\Transactions\AccountBalanceQuery;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('savings goal routes require authentication', function () {
    $goal = SavingsGoal::factory()->create();
    $contribution = SavingsContribution::factory()->for($goal->user)->create([
        'savings_goal_id' => $goal->id,
    ]);

    $this->get(route('savings-goals.index'))->assertRedirect(route('login'));
    $this->get(route('savings-goals.create'))->assertRedirect(route('login'));
    $this->get(route('savings-goals.show', $goal))->assertRedirect(route('login'));
    $this->post(route('savings-goals.store'))->assertRedirect(route('login'));
    $this->patch(route('savings-goals.update', $goal))->assertRedirect(route('login'));
    $this->patch(route('savings-goals.archive', $goal))->assertRedirect(route('login'));
    $this->post(route('savings-goals.contributions.store', $goal))->assertRedirect(route('login'));
    $this->patch(route('savings-contributions.void', $contribution))->assertRedirect(route('login'));
});

test('users only see their own goals and progress only sums active contributions', function () {
    $user = User::factory()->create();
    $activeGoal = SavingsGoal::factory()->for($user)->create([
        'name' => 'Dana Darurat',
        'target_amount' => 10_000_000,
        'target_date' => '2027-01-10',
    ]);
    $completedGoal = SavingsGoal::factory()->completed()->for($user)->create([
        'target_amount' => 5_000_000,
    ]);
    SavingsContribution::factory()->for($user)->create([
        'savings_goal_id' => $activeGoal->id,
        'amount' => 4_000_000,
    ]);
    SavingsContribution::factory()->voided()->for($user)->create([
        'savings_goal_id' => $activeGoal->id,
        'amount' => 8_000_000,
    ]);
    SavingsContribution::factory()->for($user)->create([
        'savings_goal_id' => $completedGoal->id,
        'amount' => 5_000_000,
    ]);
    $otherGoal = SavingsGoal::factory()->create();

    $this->actingAs($user)
        ->get(route('savings-goals.index', ['status' => SavingsGoalStatus::Active->value]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('savings-goals/index')
            ->where('filters.status', 'active')
            ->has('goals.data', 1)
            ->where('goals.data.0.id', $activeGoal->id)
            ->where('goals.data.0.saved_amount', 4_000_000)
            ->where('goals.data.0.remaining_amount', 6_000_000)
            ->where('goals.data.0.percentage', 40)
            ->where('summary.activeCount', 1)
            ->where('summary.totalTarget', 15_000_000)
            ->where('summary.totalSaved', 9_000_000)
            ->where('summary.completedCount', 1)
            ->where('goals.data', fn (Collection $goals): bool => $goals->doesntContain('id', $otherGoal->id)));
});

test('users can create a savings goal', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('savings-goals.store'), [
            'name' => 'Dana Pendidikan',
            'target_amount' => 25_000_000,
            'target_date' => '2028-06-30',
        ])
        ->assertRedirect(route('savings-goals.index'))
        ->assertSessionHas('status', 'savings-goal-created');

    $goal = SavingsGoal::query()->sole();

    expect($goal)
        ->user_id->toBe($user->id)
        ->name->toBe('Dana Pendidikan')
        ->target_amount->toBe(25_000_000)
        ->status->toBe(SavingsGoalStatus::Active)
        ->and($goal->target_date?->toDateString())->toBe('2028-06-30');
});

test('savings goal input is validated', function (array $data, array $errors) {
    $this->actingAs(User::factory()->create())
        ->post(route('savings-goals.store'), $data)
        ->assertInvalid($errors);

    expect(SavingsGoal::query()->count())->toBe(0);
})->with([
    'empty name' => [
        ['name' => '', 'target_amount' => 1_000_000, 'target_date' => null],
        ['name'],
    ],
    'name too long' => [
        ['name' => str_repeat('a', 121), 'target_amount' => 1_000_000, 'target_date' => null],
        ['name'],
    ],
    'non positive amount' => [
        ['name' => 'Target', 'target_amount' => 0, 'target_date' => null],
        ['target_amount'],
    ],
    'decimal amount' => [
        ['name' => 'Target', 'target_amount' => 1000.50, 'target_date' => null],
        ['target_amount'],
    ],
    'invalid date' => [
        ['name' => 'Target', 'target_amount' => 1_000_000, 'target_date' => 'besok'],
        ['target_date'],
    ],
]);

test('users can update their own non archived goal', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('savings-goals.update', $goal), [
            'name' => 'Target Diperbarui',
            'target_amount' => 30_000_000,
            'target_date' => null,
        ])
        ->assertRedirect(route('savings-goals.show', $goal))
        ->assertSessionHas('status', 'savings-goal-updated');

    expect($goal->refresh())
        ->name->toBe('Target Diperbarui')
        ->target_amount->toBe(30_000_000)
        ->target_date->toBeNull();
});

test('users cannot view or update another users goal', function () {
    $user = User::factory()->create();
    $otherGoal = SavingsGoal::factory()->create();

    $this->actingAs($user)
        ->get(route('savings-goals.show', $otherGoal))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('savings-goals.update', $otherGoal), [
            'name' => 'Bukan Milik Saya',
            'target_amount' => 5_000_000,
            'target_date' => null,
        ])
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('savings-goals.archive', $otherGoal))
        ->assertForbidden();
});

test('archiving a goal preserves its contribution history', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();
    $contribution = SavingsContribution::factory()->for($user)->create([
        'savings_goal_id' => $goal->id,
    ]);

    $this->actingAs($user)
        ->patch(route('savings-goals.archive', $goal))
        ->assertRedirect(route('savings-goals.index'))
        ->assertSessionHas('status', 'savings-goal-archived');

    expect($goal->refresh())
        ->status->toBe(SavingsGoalStatus::Archived)
        ->archived_at->not->toBeNull();

    $this->assertModelExists($contribution);
});

test('goal detail only offers active accounts owned by the user', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();
    $activeAccount = FinancialAccount::factory()->for($user)->create();
    $archivedAccount = FinancialAccount::factory()->archived()->for($user)->create();
    $otherAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->get(route('savings-goals.show', $goal))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('savings-goals/show')
            ->where('goal.id', $goal->id)
            ->where('accountOptions', fn (Collection $accounts): bool => $accounts->contains('value', $activeAccount->id)
                && $accounts->doesntContain('value', $archivedAccount->id)
                && $accounts->doesntContain('value', $otherAccount->id)));
});

test('recording a contribution completes the goal without changing account balance', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['opening_balance' => 3_000_000]);
    $goal = SavingsGoal::factory()->for($user)->create(['target_amount' => 1_000_000]);
    SavingsContribution::factory()->for($user)->create([
        'savings_goal_id' => $goal->id,
        'amount' => 600_000,
    ]);
    $balanceBefore = app(AccountBalanceQuery::class)->calculate($account);

    $this->actingAs($user)
        ->post(route('savings-goals.contributions.store', $goal), [
            'amount' => 400_000,
            'contributed_on' => '2026-08-27',
            'account_id' => $account->id,
            'note' => 'Setoran tambahan',
        ])
        ->assertRedirect(route('savings-goals.show', $goal))
        ->assertSessionHas('status', 'savings-contribution-recorded');

    $contribution = SavingsContribution::query()
        ->where('amount', 400_000)
        ->sole();

    expect($contribution)
        ->user_id->toBe($user->id)
        ->savings_goal_id->toBe($goal->id)
        ->account_id->toBe($account->id)
        ->amount->toBe(400_000)
        ->status->toBe(SavingsContributionStatus::Active)
        ->and($goal->refresh()->status)->toBe(SavingsGoalStatus::Completed)
        ->and($goal->completed_at)->not->toBeNull()
        ->and(Transaction::query()->count())->toBe(0)
        ->and(app(AccountBalanceQuery::class)->calculate($account))->toBe($balanceBefore);
});

test('completed and archived goals reject new contributions', function (string $state) {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->{$state}()->for($user)->create();

    $this->actingAs($user)
        ->post(route('savings-goals.contributions.store', $goal), [
            'amount' => 100_000,
            'contributed_on' => '2026-08-27',
            'account_id' => null,
            'note' => null,
        ])
        ->assertForbidden();

    expect(SavingsContribution::query()->count())->toBe(0);
})->with(['completed', 'archived']);

test('savings contribution input is validated', function (array $data, array $errors) {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('savings-goals.contributions.store', $goal), $data)
        ->assertInvalid($errors);

    expect(SavingsContribution::query()->count())->toBe(0);
})->with([
    'non positive amount' => [
        ['amount' => 0, 'contributed_on' => '2026-08-27'],
        ['amount'],
    ],
    'decimal amount' => [
        ['amount' => 1000.50, 'contributed_on' => '2026-08-27'],
        ['amount'],
    ],
    'invalid date' => [
        ['amount' => 100_000, 'contributed_on' => 'hari ini'],
        ['contributed_on'],
    ],
    'note too long' => [
        [
            'amount' => 100_000,
            'contributed_on' => '2026-08-27',
            'note' => str_repeat('a', 501),
        ],
        ['note'],
    ],
]);

test('a contribution can only reference an account owned by the same user', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create();
    $otherAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->post(route('savings-goals.contributions.store', $goal), [
            'amount' => 100_000,
            'contributed_on' => '2026-08-27',
            'account_id' => $otherAccount->id,
            'note' => null,
        ])
        ->assertInvalid(['account_id']);

    expect(SavingsContribution::query()->count())->toBe(0);
});

test('users cannot add contributions to another users goal', function () {
    $user = User::factory()->create();
    $otherGoal = SavingsGoal::factory()->create();

    $this->actingAs($user)
        ->post(route('savings-goals.contributions.store', $otherGoal), [
            'amount' => 100_000,
            'contributed_on' => '2026-08-27',
            'account_id' => null,
            'note' => null,
        ])
        ->assertForbidden();
});

test('users can void their own active contribution without deleting it', function () {
    $user = User::factory()->create();
    $goal = SavingsGoal::factory()->for($user)->create(['target_amount' => 2_000_000]);
    $contribution = SavingsContribution::factory()->for($user)->create([
        'savings_goal_id' => $goal->id,
        'amount' => 750_000,
    ]);

    $this->actingAs($user)
        ->patch(route('savings-contributions.void', $contribution), [
            'void_reason' => 'Nominal setoran salah',
        ])
        ->assertRedirect(route('savings-goals.show', $goal))
        ->assertSessionHas('status', 'savings-contribution-voided');

    expect($contribution->refresh())
        ->status->toBe(SavingsContributionStatus::Voided)
        ->void_reason->toBe('Nominal setoran salah')
        ->voided_at->not->toBeNull();

    $this->assertModelExists($contribution);

    $this->actingAs($user)
        ->get(route('savings-goals.show', $goal))
        ->assertInertia(fn (Assert $page) => $page
            ->where('goal.saved_amount', 0)
            ->where('goal.remaining_amount', 2_000_000));
});

test('users cannot void another users contribution', function () {
    $user = User::factory()->create();
    $contribution = SavingsContribution::factory()->create();

    $this->actingAs($user)
        ->patch(route('savings-contributions.void', $contribution), [
            'void_reason' => 'Tidak sah',
        ])
        ->assertForbidden();

    expect($contribution->refresh()->status)->toBe(SavingsContributionStatus::Active);
});

test('voiding a savings contribution requires a reason', function () {
    $user = User::factory()->create();
    $contribution = SavingsContribution::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('savings-contributions.void', $contribution), [
            'void_reason' => '   ',
        ])
        ->assertInvalid(['void_reason']);

    expect($contribution->refresh()->status)->toBe(SavingsContributionStatus::Active);
});
