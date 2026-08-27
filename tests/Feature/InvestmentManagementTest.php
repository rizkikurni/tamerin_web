<?php

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentInstrumentType;
use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('investment holding routes require authentication', function () {
    $holding = InvestmentHolding::factory()->create();

    $this->get(route('investments.index'))->assertRedirect(route('login'));
    $this->get(route('investments.create'))->assertRedirect(route('login'));
    $this->get(route('investments.show', $holding))->assertRedirect(route('login'));
    $this->post(route('investments.store'))->assertRedirect(route('login'));
    $this->patch(route('investments.update', $holding))->assertRedirect(route('login'));
    $this->patch(route('investments.archive', $holding))->assertRedirect(route('login'));
});

test('investment index is owner scoped and reports the latest active values', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->for($user)->create([
        'name' => 'Saham Tamerin',
        'instrument_type' => InvestmentInstrumentType::Stock,
        'acquisition_cost' => 10_000_000,
        'last_valuation_at' => '2026-08-20',
    ]);
    InvestmentValuation::factory()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-10',
        'value' => 11_000_000,
    ]);
    InvestmentValuation::factory()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-20',
        'value' => 12_500_000,
    ]);
    InvestmentValuation::factory()->voided()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-25',
        'value' => 99_000_000,
    ]);
    $otherHolding = InvestmentHolding::factory()->create();

    $this->actingAs($user)
        ->get(route('investments.index', [
            'instrument_type' => InvestmentInstrumentType::Stock->value,
            'status' => InvestmentHoldingStatus::Active->value,
            'valuation_condition' => 'current',
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('investments/index')
            ->where('filters.instrument_type', 'stock')
            ->where('filters.status', 'active')
            ->where('filters.valuation_condition', 'current')
            ->has('investments.data', 1)
            ->where('investments.data.0.id', $holding->id)
            ->where('investments.data.0.current_value', 12_500_000)
            ->where('investments.data.0.profit_loss', 2_500_000)
            ->where('investments.data.0.profit_loss_percentage', 25)
            ->where('summary.totalCurrentValue', 12_500_000)
            ->where('summary.totalAcquisitionCost', 10_000_000)
            ->where('summary.profitLoss', 2_500_000)
            ->where('investments.data', fn (Collection $items): bool => $items->doesntContain('id', $otherHolding->id)));
});

test('users can create and update an investment holding', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('investments.store'), [
            'name' => 'Reksa Dana Pasar Uang',
            'instrument_type' => InvestmentInstrumentType::MutualFund->value,
            'acquisition_cost' => 5_000_000,
            'acquired_on' => '2026-08-01',
            'units' => '1250.12345678',
        ])
        ->assertRedirect();

    $holding = InvestmentHolding::query()->sole();

    expect($holding)
        ->user_id->toBe($user->id)
        ->status->toBe(InvestmentHoldingStatus::Active)
        ->last_valuation_at->toBeNull()
        ->and($holding->units)->toBe('1250.12345678');

    $this->actingAs($user)
        ->patch(route('investments.update', $holding), [
            'name' => 'Reksa Dana Likuid',
            'instrument_type' => InvestmentInstrumentType::MutualFund->value,
            'acquisition_cost' => 5_500_000,
            'acquired_on' => '2026-08-02',
            'units' => null,
        ])
        ->assertRedirect(route('investments.show', $holding));

    expect($holding->refresh())
        ->name->toBe('Reksa Dana Likuid')
        ->acquisition_cost->toBe(5_500_000)
        ->units->toBeNull();
});

test('investment holding input validates positive units and non negative cost', function (array $data, array $errors) {
    $this->actingAs(User::factory()->create())
        ->post(route('investments.store'), $data)
        ->assertInvalid($errors);

    expect(InvestmentHolding::query()->count())->toBe(0);
})->with([
    'zero units' => [[
        'name' => 'Investasi', 'instrument_type' => 'stock', 'acquisition_cost' => 1_000_000,
        'acquired_on' => '2026-08-01', 'units' => 0,
    ], ['units']],
    'negative units' => [[
        'name' => 'Investasi', 'instrument_type' => 'stock', 'acquisition_cost' => 1_000_000,
        'acquired_on' => '2026-08-01', 'units' => -1,
    ], ['units']],
    'too many unit decimals' => [[
        'name' => 'Investasi', 'instrument_type' => 'stock', 'acquisition_cost' => 1_000_000,
        'acquired_on' => '2026-08-01', 'units' => '1.123456789',
    ], ['units']],
    'negative acquisition cost' => [[
        'name' => 'Investasi', 'instrument_type' => 'stock', 'acquisition_cost' => -1,
        'acquired_on' => '2026-08-01', 'units' => null,
    ], ['acquisition_cost']],
]);

test('users cannot access another users investment holding', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->create();

    $this->actingAs($user)->get(route('investments.show', $holding))->assertForbidden();
    $this->actingAs($user)->get(route('investments.edit', $holding))->assertForbidden();
    $this->actingAs($user)->patch(route('investments.archive', $holding))->assertForbidden();
});

test('archiving an investment preserves all valuation history', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->for($user)->create(['last_valuation_at' => '2026-08-20']);
    $activeValuation = InvestmentValuation::factory()->for($user)->create([
        'investment_holding_id' => $holding->id, 'valued_on' => '2026-08-20',
    ]);
    $voidedValuation = InvestmentValuation::factory()->voided()->for($user)->create([
        'investment_holding_id' => $holding->id, 'valued_on' => '2026-08-10',
    ]);

    $this->actingAs($user)
        ->patch(route('investments.archive', $holding))
        ->assertRedirect(route('investments.index'));

    expect($holding->refresh())
        ->status->toBe(InvestmentHoldingStatus::Archived)
        ->archived_at->not->toBeNull()
        ->and($activeValuation->refresh()->status)->toBe(InvestmentValuationStatus::Active)
        ->and($voidedValuation->refresh()->status)->toBe(InvestmentValuationStatus::Voided)
        ->and(InvestmentValuation::query()->count())->toBe(2);
});
