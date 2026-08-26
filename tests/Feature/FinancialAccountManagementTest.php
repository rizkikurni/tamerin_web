<?php

use App\Enums\FinancialAccountStatus;
use App\Enums\FinancialAccountType;
use App\Models\FinancialAccount;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('users only see their own financial accounts including archived history', function () {
    $user = User::factory()->create();
    $activeAccount = FinancialAccount::factory()->for($user)->create();
    $archivedAccount = FinancialAccount::factory()->for($user)->archived()->create();
    $otherAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->get(route('financial-accounts.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('financial-accounts/index')
            ->has('accounts.data', 2)
            ->where('accounts.data', fn (Collection $accounts): bool => $accounts->contains('id', $activeAccount->id)
                && $accounts->contains('id', $archivedAccount->id)
                && $accounts->doesntContain('id', $otherAccount->id)));
});

test('users can create a financial account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('financial-accounts.store'), [
            'name' => 'Dompet Harian',
            'type' => FinancialAccountType::Cash->value,
            'opening_balance' => 250_000,
            'opened_on' => '2026-08-01',
        ])
        ->assertRedirect(route('financial-accounts.index'))
        ->assertSessionHas('status', 'financial-account-created');

    $account = FinancialAccount::query()->sole();

    expect($account)
        ->user_id->toBe($user->id)
        ->name->toBe('Dompet Harian')
        ->type->toBe(FinancialAccountType::Cash)
        ->status->toBe(FinancialAccountStatus::Active)
        ->archived_at->toBeNull();
});

test('active financial account names must be unique per user', function () {
    $user = User::factory()->create();
    FinancialAccount::factory()->for($user)->create(['name' => 'Rekening Utama']);

    $this->actingAs($user)
        ->post(route('financial-accounts.store'), [
            'name' => 'Rekening Utama',
            'type' => FinancialAccountType::Bank->value,
            'opening_balance' => 0,
            'opened_on' => '2026-08-01',
        ])
        ->assertInvalid(['name']);

    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->post(route('financial-accounts.store'), [
            'name' => 'Rekening Utama',
            'type' => FinancialAccountType::Bank->value,
            'opening_balance' => 0,
            'opened_on' => '2026-08-01',
        ])
        ->assertRedirect(route('financial-accounts.index'));
});

test('an archived financial account name can be reused by the same user', function () {
    $user = User::factory()->create();
    FinancialAccount::factory()->for($user)->archived()->create(['name' => 'Dompet Lama']);

    $this->actingAs($user)
        ->post(route('financial-accounts.store'), [
            'name' => 'Dompet Lama',
            'type' => FinancialAccountType::Cash->value,
            'opening_balance' => 0,
            'opened_on' => '2026-08-01',
        ])
        ->assertRedirect(route('financial-accounts.index'));

    expect(FinancialAccount::query()->where('name', 'Dompet Lama')->count())->toBe(2);
});

test('users can update their own active financial account', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('financial-accounts.update', $account), [
            'name' => 'Bank Operasional',
            'type' => FinancialAccountType::Bank->value,
            'opening_balance' => 1_000_000,
            'opened_on' => '2026-01-01',
        ])
        ->assertRedirect(route('financial-accounts.index'))
        ->assertSessionHas('status', 'financial-account-updated');

    expect($account->refresh())
        ->name->toBe('Bank Operasional')
        ->type->toBe(FinancialAccountType::Bank)
        ->opening_balance->toBe(1_000_000);
});

test('users cannot read or update another users financial account', function () {
    $user = User::factory()->create();
    $otherAccount = FinancialAccount::factory()->create();

    $this->actingAs($user)
        ->get(route('financial-accounts.edit', $otherAccount))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('financial-accounts.update', $otherAccount), [
            'name' => 'Tidak Boleh Berubah',
            'type' => FinancialAccountType::Bank->value,
            'opening_balance' => 0,
            'opened_on' => '2026-08-01',
        ])
        ->assertForbidden();

    expect($otherAccount->refresh()->name)->not->toBe('Tidak Boleh Berubah');
});

test('users can archive an account once and archived accounts are excluded from active choices', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('financial-accounts.archive', $account))
        ->assertRedirect(route('financial-accounts.index'))
        ->assertSessionHas('status', 'financial-account-archived');

    expect($account->refresh())
        ->status->toBe(FinancialAccountStatus::Archived)
        ->archived_at->not->toBeNull()
        ->and(FinancialAccount::query()->active()->pluck('id'))
        ->not->toContain($account->id);

    $this->actingAs($user)
        ->patch(route('financial-accounts.archive', $account))
        ->assertForbidden();
});
